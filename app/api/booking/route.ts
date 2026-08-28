import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  deliverLead,
  hasFailedDelivery,
  labelLeadReasons,
  missingRequiredDelivery,
  summarizeLeadDelivery,
} from "@/lib/leads/delivery";
import { FORM_ACKNOWLEDGMENT_TEXT, SMS_CONSENT_TEXT } from "@/lib/leads/a2p";
import {
  createBooking,
  findExistingBooking,
  isCalendlyConfigured,
} from "@/lib/booking/calendly";
import { isCaptchaConfigured, verifyBookingPass } from "@/lib/booking/human";

// Native booking: capture the lead, then book the consult, without ever
// handing the patient off to a Calendly page.
//
// Ordering is deliberate and is the core of the design: everything that can
// fail happens BEFORE the one step that cannot be undone. Calendly always
// emails the invitee on booking and that email cannot be disabled, so a
// booking made and then rolled back produces confirm-then-cancel whiplash.
// Writing the CRM first means a GHL outage costs us nothing but a retry.
//
// See docs/superpowers/specs/2026-08-28-booking-integration-design.md

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_DIGIT_RE = /\d/g;
const PHONE = "(310) 772-0072";

const REASON_VALUES = new Set<string>([
  "menopause-hormones",
  "sexual-health",
  "pelvic-urinary",
  "vaginal-rejuvenation",
  "aesthetic-regenerative",
  "body-contouring",
  "menopause-perimenopause",
  "berman-supplements",
  "not-sure",
]);
const CONTACT_METHODS = new Set(["phone", "email", "either"]);
const VISIT_TYPES = new Set(["in-person", "telehealth", "either"]);

const ALLOWED_HOSTS = [
  "bermansexualhealth.com",
  "localhost",
  "127.0.0.1",
];

type BookingPayload = {
  fullName?: string;
  email?: string;
  phone?: string;
  preferredContact?: string;
  visitType?: string;
  reasons?: string[];
  note?: string;
  formAcknowledgment?: boolean;
  smsConsent?: boolean;
  startTime?: string;
  timezone?: string;
  source?: string;
  website?: string;
  elapsedMs?: number;
  humanPass?: string;
};

function nonEmpty(v?: string | null): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function badRequest(error: string) {
  return NextResponse.json({ ok: false, error }, { status: 400 });
}

// Non-identifying by construction: the spec forbids transaction ids that
// encode anything about the patient, since this value reaches ad platforms.
function makeConsultId(): string {
  return `BK-${randomBytes(5).toString("hex").toUpperCase()}`;
}

function isAllowedOrigin(origin: string): boolean {
  try {
    const host = new URL(origin).hostname;
    return ALLOWED_HOSTS.some(
      (allowed) => host === allowed || host.endsWith(`.${allowed}`),
    ) || host.endsWith(".vercel.app");
  } catch {
    return false;
  }
}

function splitName(full: string): { firstName: string; lastName: string } {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: "-" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

export async function POST(req: NextRequest) {
  let body: BookingPayload;
  try {
    body = (await req.json()) as BookingPayload;
  } catch {
    return badRequest("Invalid JSON body");
  }
  if (!body || typeof body !== "object") return badRequest("Missing body");

  // --- Spam protection: identical contract to /api/contact ---
  // A tripped check returns a plausible success so the bot moves on, and
  // silently drops the submission. Nothing is booked and no lead is created.
  if (nonEmpty(body.website)) {
    console.warn("[booking-spam-honeypot]", { source: body.source || null });
    return NextResponse.json({ ok: true, consultId: makeConsultId(), startTime: body.startTime });
  }
  const origin = req.headers.get("origin");
  if (!origin || !isAllowedOrigin(origin)) {
    console.warn("[booking-spam-origin]", { origin });
    return NextResponse.json({ ok: true, consultId: makeConsultId(), startTime: body.startTime });
  }
  const elapsedMs = typeof body.elapsedMs === "number" ? body.elapsedMs : -1;
  if (elapsedMs >= 0 && elapsedMs < 1500) {
    console.warn("[booking-spam-timing]", { elapsedMs });
    return NextResponse.json({ ok: true, consultId: makeConsultId(), startTime: body.startTime });
  }

  // --- Human verification ---
  // The pass is issued by /api/booking/verify-human after a real reCAPTCHA
  // token was checked with Google. It is signed and short-lived, so a stale or
  // forged one cannot book. Unlike the spam checks above this is a visible
  // failure: a real person whose pass expired needs to know why.
  if (isCaptchaConfigured() && !verifyBookingPass(body.humanPass || "")) {
    console.warn("[booking-human-pass-invalid]");
    return NextResponse.json(
      {
        ok: false,
        code: "verification_expired",
        error: "Your verification expired. Please close this and start again.",
      },
      { status: 403 },
    );
  }

  // --- Validation ---
  if (!nonEmpty(body.fullName)) return badRequest("Your name is required");
  if (!nonEmpty(body.email) || !EMAIL_RE.test(body.email.trim())) {
    return badRequest("A valid email is required");
  }
  if (!nonEmpty(body.phone)) return badRequest("Phone is required");
  if ((body.phone.match(PHONE_DIGIT_RE) || []).length < 10) {
    return badRequest("Phone must include at least 10 digits");
  }
  if (!CONTACT_METHODS.has(body.preferredContact || "")) {
    return badRequest("Preferred contact method is invalid");
  }
  if (!VISIT_TYPES.has(body.visitType || "")) {
    return badRequest("Visit type is invalid");
  }
  if (!Array.isArray(body.reasons) || body.reasons.length === 0) {
    return badRequest("Select at least one reason for visit");
  }
  for (const r of body.reasons) {
    if (!REASON_VALUES.has(r)) return badRequest("Invalid reason value");
  }
  if (!body.formAcknowledgment) {
    return badRequest("Form acknowledgment is required");
  }
  if (!nonEmpty(body.startTime)) {
    return badRequest("Choose an appointment time");
  }
  if (!nonEmpty(body.timezone)) return badRequest("Missing timezone");

  if (!isCalendlyConfigured()) {
    return NextResponse.json(
      { ok: false, error: `Online booking is unavailable. Please call ${PHONE}.` },
      { status: 503 },
    );
  }

  const consultId = makeConsultId();
  const { firstName, lastName } = splitName(body.fullName);
  const smsConsent = Boolean(body.smsConsent);

  // --- Step 1: CRM first. Reversible, and nothing has been booked yet. ---
  const lead = {
    ticketId: consultId,
    receivedAt: new Date().toISOString(),
    source: body.source || "website_booking_flow",
    firstName,
    lastName,
    email: body.email.trim(),
    phone: body.phone.trim(),
    preferredContact: body.preferredContact as string,
    visitType: body.visitType as string,
    preferredWindow: null,
    requestedDate: null,
    requestedTimeWindow: null,
    reasons: body.reasons,
    reasonLabels: labelLeadReasons(body.reasons),
    message: nonEmpty(body.note)
      ? body.note.trim()
      : "Booked a 15-minute consult through the website booking flow.",
    formAcknowledgment: true,
    formAcknowledgmentText: FORM_ACKNOWLEDGMENT_TEXT,
    smsConsent,
    smsConsentText: smsConsent ? SMS_CONSENT_TEXT : null,
    sourceUrl: req.headers.get("referer"),
    userAgent: req.headers.get("user-agent"),
  };

  const delivery = await deliverLead(lead);
  if (hasFailedDelivery(delivery) || missingRequiredDelivery(delivery).length > 0) {
    console.error("[booking-crm-failed-before-booking]", {
      consultId,
      delivery: summarizeLeadDelivery(delivery),
    });
    // Nothing booked, no Calendly email sent, no phantom appointment.
    return NextResponse.json(
      {
        ok: false,
        error: `We couldn't complete your booking. Please call ${PHONE}.`,
      },
      { status: 502 },
    );
  }

  // --- Step 2: the irreversible act. ---
  const booking = await createBooking({
    startTime: body.startTime,
    name: body.fullName.trim(),
    email: body.email.trim(),
    timezone: body.timezone,
    phone: body.phone.trim(),
    reasons: body.reasons,
    note: body.note,
    consultId,
  });

  if (!booking.ok) {
    console.error("[booking-calendly-failed]", { consultId, ...booking });

    if (booking.code === "slot_taken") {
      return NextResponse.json(
        { ok: false, code: "slot_taken", error: "That time was just taken. Please pick another." },
        { status: 409 },
      );
    }

    // Ambiguous outcome — a timeout or 5xx means we do not know whether the
    // booking landed. Calendly offers no idempotency key, so retrying blind
    // could give this patient two appointments. Ask what actually happened.
    if (booking.code === "transient") {
      const existing = await findExistingBooking(
        body.email.trim(),
        body.startTime,
      );
      if (existing) {
        // It did land. Adopt it rather than creating a second one.
        console.warn("[booking-adopted-after-timeout]", {
          consultId,
          eventUri: existing,
        });
        return NextResponse.json({
          ok: true,
          consultId,
          startTime: body.startTime,
          adopted: true,
        });
      }
      console.error("[booking-unresolved-after-timeout]", { consultId });
    }
    // The lead is safely in the CRM, so staff can still reach them.
    return NextResponse.json(
      {
        ok: false,
        error: `We saved your details but couldn't confirm the time. We'll call you, or reach us at ${PHONE}.`,
      },
      { status: 502 },
    );
  }

  console.info("[booking-confirmed]", {
    consultId,
    startTime: booking.startTime,
    eventUri: booking.eventUri,
  });

  return NextResponse.json({
    ok: true,
    consultId,
    startTime: booking.startTime,
  });
}
