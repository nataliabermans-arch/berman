import { NextResponse } from "next/server";
import { isCalendlyConfigured, listAvailableSlots } from "@/lib/booking/calendly";

// Thin server-side proxy so the Calendly token never reaches the browser.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!isCalendlyConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Booking is not configured." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const slots = await listAvailableSlots(14);
    return NextResponse.json(
      {
        ok: true,
        slots: slots.map((s) => ({ startTime: s.startTime })),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    console.error("[booking-availability-failed]", err);
    return NextResponse.json(
      { ok: false, error: "Could not load available times." },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
