import { NextRequest, NextResponse } from "next/server";
import { issueBookingPass, verifyCaptchaToken } from "@/lib/booking/human";

// Exchanges a reCAPTCHA token for a short-lived signed pass, so the CAPTCHA can
// live at the start of the flow without its ~2 minute expiry killing a booking
// made several minutes later.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { token?: string };
  try {
    body = (await req.json()) as { token?: string };
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;

  const verdict = await verifyCaptchaToken(body?.token || "", ip);
  if (!verdict.ok) {
    console.warn("[booking-captcha-rejected]", { reason: verdict.reason });
    return NextResponse.json(
      { ok: false, error: "Verification failed. Please try again." },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true, pass: issueBookingPass() });
}
