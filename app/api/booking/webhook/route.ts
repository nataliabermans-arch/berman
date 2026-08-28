import { NextRequest, NextResponse } from "next/server";
import { addContactTags, findContactIdByEmail, isGhlConfigured } from "@/lib/booking/ghl";
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

  let body: { event?: string; payload?: InviteePayload };
  try {
    body = JSON.parse(raw) as { event?: string; payload?: InviteePayload };
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
      const ok = await addContactTags(contactId, ["booking-canceled"]);
      // Patient name and email are deliberately absent: these lines land in
      // platform logs, which are a far wider audience than the CRM.
      console.info("[calendly-webhook-cancel-synced]", {
        consultId,
        contactId,
        tagged: ok,
        canceledBy: p.cancellation?.canceler_type || null,
      });
      if (!ok) {
        // Tagging failed outright — ask Calendly to send it again rather than
        // losing the cancellation.
        return NextResponse.json({ ok: false, retry: true }, { status: 503 });
      }
    } else {
      // ...and if it still is not visible, do NOT swallow the event. Returning
      // 503 makes Calendly redeliver with backoff for up to 24 hours, by which
      // point the index will have caught up. Re-tagging is harmless.
      console.warn("[calendly-webhook-cancel-contact-not-found-yet]", { consultId });
      return NextResponse.json({ ok: false, retry: true }, { status: 503 });
    }
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
