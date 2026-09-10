import { NextRequest, NextResponse } from "next/server";
import { eventConferencingUrl } from "@/lib/booking/calendly";
import {
  findContactIdByEmail,
  getContactCustomField,
  isGhlConfigured,
  setBookingStatus,
  setContactCustomFields,
} from "@/lib/booking/ghl";
import { deleteZoomMeeting } from "@/lib/booking/zoom";
import { verifyCalendlySignature } from "@/lib/booking/webhook-signature";

// Calendly webhook receiver.
//
// Its real job is the out-of-band cases our own booking flow cannot see:
// a patient cancelling through Calendly, or an appointment booked directly on
// the Calendly page rather than through the site. Nothing here rubber-stamps a
// booking we already made.
//
// Signature scheme (verified against Calendly's docs):
//   header  Calendly-Webhook-Signature: t=<unix seconds>,v1=<hex hmac>
//   signed  <t> + "." + <RAW body>
//   hmac    SHA-256 with the subscription's signing_key
//
// Calendly's own Node example is unsafe — it HMACs JSON.stringify(req.body)
// and compares with !==. Both are wrong: re-serialising can differ from the
// bytes that were signed, and a non-constant-time compare leaks the digest.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type InviteePayload = {
  uri?: string;
  email?: string;
  name?: string;
  first_name?: string | null;
  last_name?: string | null;
  status?: string;
  /** True on the CANCELED half of a reschedule - the invitee moved, not left. */
  rescheduled?: boolean;
  /** Set on the CREATED half of a reschedule: the invitee it replaces. */
  old_invitee?: string | null;
  tracking?: { salesforce_uuid?: string | null } | null;
  scheduled_event?: { start_time?: string; uri?: string } | null;
  cancellation?: {
    canceled_by?: string;
    reason?: string | null;
    canceler_type?: string;
  } | null;
};

export async function POST(req: NextRequest) {
  // The raw text, never a re-serialisation — the HMAC covers these exact bytes.
  const raw = await req.text();

  const check = verifyCalendlySignature(
    req.headers.get("calendly-webhook-signature"),
    raw,
    (process.env.CALENDLY_WEBHOOK_SIGNING_KEY || "").trim(),
  );
  if (!check.ok) {
    console.warn("[calendly-webhook-rejected]", { reason: check.reason });
    // 401 rather than 400: Calendly retries 4xx for 24 hours, and a genuinely
    // unauthenticated caller should not be able to make us retry anything.
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let body: { event?: string; created_at?: string; payload?: InviteePayload };
  try {
    body = JSON.parse(raw) as {
      event?: string;
      created_at?: string;
      payload?: InviteePayload;
    };
  } catch {
    return NextResponse.json({ ok: false, error: "bad json" }, { status: 400 });
  }

  const event = body.event || "";
  const p = body.payload || {};
  const consultId = p.tracking?.salesforce_uuid || null;
  const email = p.email || "";

  console.info("[calendly-webhook]", {
    event,
    consultId,
    startTime: p.scheduled_event?.start_time || null,
  });

  // How long we are willing to keep asking Calendly to redeliver.
  //
  // Retrying is how we survive GHL's eventually-consistent search, but it must
  // not be unbounded: Calendly disables a subscription that keeps failing, and
  // one cancellation for a contact that will never appear — a patient who
  // booked on Calendly directly, or whose record was deleted — would otherwise
  // take down cancellation sync for everyone.
  const RETRY_BUDGET_MS = 30 * 60_000;
  const deliveryAge = body.created_at
    ? Date.now() - new Date(body.created_at).getTime()
    : 0;
  const pastRetryBudget =
    Number.isFinite(deliveryAge) && deliveryAge > RETRY_BUDGET_MS;

  // A reschedule arrives as invitee.canceled + invitee.created. The canceled
  // half carries rescheduled: true, and treating it as a real cancellation
  // tagged patients booking-canceled while they held a live appointment -
  // staff would see a cancelled consult that was actually just moved. The
  // created half below re-affirms the booking and refreshes the details.
  if (event === "invitee.canceled" && p.rescheduled === true) {
    console.info("[calendly-webhook-reschedule-cancel-half-skipped]", { consultId });
    return NextResponse.json({ ok: true });
  }

  // Every action below must be idempotent: Calendly retries for 24 hours and
  // sends no delivery id to deduplicate on.
  if (event === "invitee.canceled" && email && isGhlConfigured()) {
    // GHL's contact search is eventually consistent, so a cancellation
    // arriving moments after the booking can look up a contact that provably
    // exists and find nothing. Try briefly here...
    let contactId: string | null = null;
    for (let attempt = 0; attempt < 3 && !contactId; attempt += 1) {
      if (attempt) await new Promise((r) => setTimeout(r, 1500));
      contactId = await findContactIdByEmail(email);
    }

    if (contactId) {
      const ok = await setBookingStatus(contactId, "booking-canceled");

      // Tear down the Zoom meeting too, or the practice's account fills with
      // meetings for consults nobody is attending — and a cancelled patient
      // keeps a live link into the host's account.
      //
      // Best-effort by design: a failure here must not make Calendly redeliver
      // and re-run the tagging. The meeting id is read back from the CRM
      // because that is the only place it is durable between booking and
      // cancellation; there is no database.
      const zoomMeetingId = await getContactCustomField(
        contactId,
        "berman_website_zoom_meeting_id",
      );
      if (zoomMeetingId) {
        const gone = await deleteZoomMeeting(zoomMeetingId);
        console.info("[calendly-webhook-zoom-teardown]", {
          consultId,
          deleted: gone,
        });
        if (!gone) {
          // Loud, because it leaves a live meeting on the account that only a
          // human will now clean up.
          console.error("[zoom-orphaned-after-cancel]", { consultId, zoomMeetingId });
        }
      }
      // Patient name and email are deliberately absent: these lines land in
      // platform logs, which are a far wider audience than the CRM.
      console.info("[calendly-webhook-cancel-synced]", {
        consultId,
        contactId,
        tagged: ok,
        canceledBy: p.cancellation?.canceler_type || null,
      });
      if (!ok && !pastRetryBudget) {
        // Tagging failed outright — ask Calendly to send it again rather than
        // losing the cancellation.
        return NextResponse.json({ ok: false, retry: true }, { status: 503 });
      }
      if (!ok) {
        console.error("[calendly-webhook-cancel-tag-abandoned]", { consultId });
      }
    } else if (!pastRetryBudget) {
      // ...and if it still is not visible, do NOT swallow the event. Returning
      // 503 makes Calendly redeliver with backoff, by which point the index
      // will have caught up. Re-tagging is harmless.
      console.warn("[calendly-webhook-cancel-contact-not-found-yet]", { consultId });
      return NextResponse.json({ ok: false, retry: true }, { status: 503 });
    } else {
      // Out of budget. Accept the delivery so the subscription survives, and
      // make the unsynced cancellation loud — this is a real CRM/calendar
      // divergence someone has to reconcile by hand.
      console.error("[calendly-webhook-cancel-unsynced]", {
        consultId,
        ageMinutes: Math.round(deliveryAge / 60_000),
      });
    }
  }

  // The created half of a reschedule. old_invitee is only ever set here, and
  // gating on it keeps this away from ordinary bookings, which the booking
  // route has already recorded - re-doing that work here would race it.
  if (event === "invitee.created" && p.old_invitee && email && isGhlConfigured()) {
    let contactId: string | null = null;
    for (let attempt = 0; attempt < 3 && !contactId; attempt += 1) {
      if (attempt) await new Promise((r) => setTimeout(r, 1500));
      contactId = await findContactIdByEmail(email);
    }

    if (contactId) {
      // Undo the canceled tag if the cancel half was processed first (webhook
      // order is not guaranteed), and put the NEW time and link on the record
      // so staff and Privyr-style consumers see where the patient actually is.
      const ok = await setBookingStatus(contactId, "booking-confirmed");
      const startTime = p.scheduled_event?.start_time;
      const when = startTime ? new Date(startTime) : null;
      const valid = when && !Number.isNaN(when.getTime());
      const joinUrl = await eventConferencingUrl(p.scheduled_event?.uri || "");
      await setContactCustomFields(contactId, {
        ...(joinUrl ? { berman_website_zoom_join_url: joinUrl } : {}),
        ...(valid
          ? {
              berman_website_requested_date: when.toLocaleDateString("en-CA", {
                timeZone: "America/Los_Angeles",
              }),
              berman_website_requested_time_window: `${when.toLocaleString("en-US", {
                timeZone: "America/Los_Angeles",
                weekday: "short",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })} PT`,
            }
          : {}),
      });
      console.info("[calendly-webhook-reschedule-synced]", {
        consultId,
        contactId,
        tagged: ok,
        newStart: startTime || null,
        linkRefreshed: Boolean(joinUrl),
      });
    } else if (!pastRetryBudget) {
      // Same eventual-consistency dance as the cancel path: ask Calendly to
      // redeliver rather than dropping the new time on the floor.
      console.warn("[calendly-webhook-reschedule-contact-not-found-yet]", { consultId });
      return NextResponse.json({ ok: false, retry: true }, { status: 503 });
    } else {
      console.error("[calendly-webhook-reschedule-unsynced]", {
        consultId,
        ageMinutes: Math.round(deliveryAge / 60_000),
      });
    }
    return NextResponse.json({ ok: true });
  }

  if (event === "invitee.created" && !consultId) {
    // Booked straight from the Calendly page rather than through the site, so
    // no lead exists in the CRM for it. Logged without identifying detail —
    // the booking itself is visible in Calendly.
    console.info("[calendly-webhook-direct-booking]", {
      startTime: p.scheduled_event?.start_time || null,
    });
  }

  // Always 200 once authenticated, so a downstream hiccup does not put the
  // subscription into Calendly's 24-hour retry loop.
  return NextResponse.json({ ok: true });
}
