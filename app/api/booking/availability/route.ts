import { NextRequest, NextResponse } from "next/server";
import { isCalendlyConfigured, listAvailableSlots } from "@/lib/booking/calendly";
import { clientIp, rateLimit } from "@/lib/booking/rate-limit";

// Thin server-side proxy so the Calendly token never reaches the browser.
//
// Public and unauthenticated by necessity — the picker calls it before anyone
// has identified themselves. That makes it the cheapest way to attack the
// booking flow, so it is both cached and rate limited: without either, one host
// could exhaust Calendly's API limit and take booking offline for everyone.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Availability changes when someone books. A few seconds of staleness is
// invisible to a patient — the picker polls every 25s anyway — and collapses a
// burst of requests into one upstream call.
const CACHE_MS = 10_000;

let cache: { at: number; slots: Array<{ startTime: string }> } | null = null;

export async function GET(req: NextRequest) {
  if (!isCalendlyConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Booking is not configured." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  // Generous: a patient legitimately polls every 25s, and several people behind
  // one clinic or office NAT share an address.
  const limit = rateLimit(`avail:${clientIp(req.headers)}`, 120, 60_000);
  if (!limit.allowed) {
    // Serve the cached list rather than breaking a real patient's picker.
    if (cache) {
      return NextResponse.json(
        { ok: true, slots: cache.slots },
        { headers: { "Cache-Control": "no-store" } },
      );
    }
    return NextResponse.json(
      { ok: false, error: "Too many requests." },
      {
        status: 429,
        headers: {
          "Retry-After": String(limit.retryAfterSeconds),
          "Cache-Control": "no-store",
        },
      },
    );
  }

  if (cache && Date.now() - cache.at < CACHE_MS) {
    return NextResponse.json(
      { ok: true, slots: cache.slots },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const slots = (await listAvailableSlots(14)).map((s) => ({
      startTime: s.startTime,
    }));
    cache = { at: Date.now(), slots };
    return NextResponse.json(
      { ok: true, slots },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    console.error("[booking-availability-failed]", err);
    // A stale list beats an empty picker: the booking call re-checks the slot
    // anyway, and a taken one comes back as a conflict the patient can recover
    // from.
    if (cache) {
      return NextResponse.json(
        { ok: true, slots: cache.slots, stale: true },
        { headers: { "Cache-Control": "no-store" } },
      );
    }
    return NextResponse.json(
      { ok: false, error: "Could not load available times." },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
