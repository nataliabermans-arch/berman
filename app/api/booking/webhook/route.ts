import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { addContactTags, findContactIdByEmail, isGhlConfigured } from "@/lib/booking/ghl";

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

const TOLERANCE_SECONDS = 180;

function signingKey(): string {
  return (process.env.CALENDLY_WEBHOOK_SIGNING_KEY || "").trim();
}

type SigCheck = { ok: true } | { ok: false; reason: string };

export function verifySignature(header: string | null, rawBody: string): SigCheck {
  const key = signingKey();
  if (!key) return { ok: false, reason: "signing key not configured" };
  if (!header) return { ok: false, reason: "missing signature header" };

  let t = "";
  let v1 = "";
  for (const part of header.split(",")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const name = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (name === "t") t = value;
    if (name === "v1") v1 = value;
  }
  if (!t || !v1) return { ok: false, reason: "malformed signature header" };

  // `t` is in SECONDS. Rejecting stale timestamps blocks replay of a captured
  // delivery.
  const ts = Number(t);
  if (!Number.isFinite(ts)) return { ok: false, reason: "bad timestamp" };
  const ageSeconds = Math.abs(Date.now() / 1000 - ts);
  if (ageSeconds > TOLERANCE_SECONDS) {
    return { ok: false, reason: `timestamp outside tolerance (${Math.round(ageSeconds)}s)` };
  }

  const expected = createHmac("sha256", key)
    .update(`${t}.${rawBody}`)
    .digest("hex");

  const a = Buffer.from(v1, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, reason: "signature mismatch" };
  }
  return { ok: true };
}

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

  const check = verifySignature(
    req.headers.get("calendly-webhook-signature"),
    raw,
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

  // first_name/last_name are null when the event type uses a single combined
  // name field, so `name` is the reliable one.
  const who = p.name || [p.first_name, p.last_name].filter(Boolean).join(" ");

  console.info("[calendly-webhook]", {
    event,
    consultId,
    startTime: p.scheduled_event?.start_time || null,
  });

  // Every action below must be idempotent: Calendly retries for 24 hours and
  // sends no delivery id to deduplicate on.
  if (event === "invitee.canceled" && email && isGhlConfigured()) {
    const contactId = await findContactIdByEmail(email);
    if (contactId) {
      const ok = await addContactTags(contactId, ["booking-canceled"]);
      console.info("[calendly-webhook-cancel-synced]", {
        consultId,
        contactId,
        tagged: ok,
        canceledBy: p.cancellation?.canceler_type || null,
        who,
      });
    } else {
      console.warn("[calendly-webhook-cancel-no-contact]", { consultId, email });
    }
  }

  if (event === "invitee.created" && !consultId) {
    // Booked straight from the Calendly page rather than through the site, so
    // no lead exists in the CRM for it.
    console.info("[calendly-webhook-direct-booking]", {
      email,
      who,
      startTime: p.scheduled_event?.start_time || null,
    });
  }

  // Always 200 once authenticated, so a downstream hiccup does not put the
  // subscription into Calendly's 24-hour retry loop.
  return NextResponse.json({ ok: true });
}
