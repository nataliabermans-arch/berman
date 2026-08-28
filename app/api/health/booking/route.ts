import { NextResponse } from "next/server";
import {
  eventTypeUri,
  getEventTypeMeta,
  isCalendlyConfigured,
  listAvailableSlots,
} from "@/lib/booking/calendly";
import { isGhlConfigured } from "@/lib/booking/ghl";
import { isCaptchaConfigured } from "@/lib/booking/human";

// One URL that says whether booking can actually work in this environment.
//
// Every failure this reports is a configuration problem that is otherwise
// invisible: the patient sees "we couldn't load available times" and nobody
// else sees anything at all.
//
// Reports presence and behaviour, never values — this endpoint is public.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Check = {
  ok: boolean;
  detail: string;
};

function present(name: string): boolean {
  return (process.env[name] || "").trim().length > 0;
}

export async function GET() {
  const checks: Record<string, Check> = {};

  // --- Calendly ---
  const calendlyConfigured = isCalendlyConfigured();
  checks.calendly_token = {
    ok: calendlyConfigured,
    detail: calendlyConfigured
      ? "CALENDLY_API_TOKEN present"
      : "CALENDLY_API_TOKEN missing or too short — booking cannot work",
  };

  if (calendlyConfigured) {
    try {
      const meta = await getEventTypeMeta();
      const select = meta.questions.find(
        (q) => q.type === "multi_select" || q.type === "single_select",
      );
      checks.calendly_event_type = {
        ok: true,
        detail: `reachable; ${meta.questions.length} custom questions, ${
          select?.answerChoices.length ?? 0
        } service choices`,
      };
    } catch (err) {
      checks.calendly_event_type = {
        ok: false,
        detail: `event type lookup failed: ${
          err instanceof Error ? err.message : "unknown"
        }`,
      };
    }

    try {
      const slots = await listAvailableSlots(14);
      checks.calendly_availability = {
        ok: slots.length > 0,
        detail:
          slots.length > 0
            ? `${slots.length} slots in the next 14 days`
            : "reachable but NO open slots — the picker will show 'no times available'",
      };
    } catch (err) {
      checks.calendly_availability = {
        ok: false,
        detail: `availability call failed: ${
          err instanceof Error ? err.message : "unknown"
        }`,
      };
    }
  }

  // --- GoHighLevel ---
  // The booking writes the CRM before it books, so a missing GHL config fails
  // every booking even though Calendly is fine.
  const ghl = isGhlConfigured();
  checks.ghl = {
    ok: ghl,
    detail: ghl
      ? "token and location id present"
      : "GHL_BERMAN_API_TOKEN or GHL_BERMAN_LOCATION_ID missing — every booking will fail before reaching Calendly",
  };

  // --- Human verification ---
  const captcha = isCaptchaConfigured();
  const requested =
    (process.env.NEXT_PUBLIC_BOOKING_REQUIRE_CAPTCHA || "").trim() === "true";
  checks.captcha = {
    ok: true, // never fatal — it must not be able to block bookings
    detail: captcha
      ? "enforced"
      : !requested
        ? "off (opt-in: set NEXT_PUBLIC_BOOKING_REQUIRE_CAPTCHA=true with both reCAPTCHA keys to enable)"
        : process.env.VERCEL_ENV === "preview"
          ? "requested, but skipped on preview deployments"
          : "requested, but a reCAPTCHA key is missing — running without it rather than blocking bookings",
  };

  checks.booking_session_secret = {
    ok: true,
    detail: present("BOOKING_SESSION_SECRET")
      ? "set"
      : "not set — falling back to the reCAPTCHA secret for signing",
  };

  checks.webhook_signing_key = {
    ok: true,
    detail: present("CALENDLY_WEBHOOK_SIGNING_KEY")
      ? "set"
      : "not set — the Calendly webhook will reject every delivery",
  };

  // Only the things that actually stop a patient booking count as fatal.
  const fatal = ["calendly_token", "calendly_event_type", "calendly_availability", "ghl"]
    .filter((k) => checks[k] && !checks[k].ok);

  return NextResponse.json(
    {
      ok: fatal.length === 0,
      environment: process.env.VERCEL_ENV || "local",
      eventType: eventTypeUri(),
      blocking: fatal,
      checks,
    },
    {
      status: fatal.length === 0 ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
