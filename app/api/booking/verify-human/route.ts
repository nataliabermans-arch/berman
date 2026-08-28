import { NextRequest, NextResponse } from "next/server";
import { issueBookingPass, verifyCaptchaToken } from "@/lib/booking/human";
import { clientIp, rateLimit } from "@/lib/booking/rate-limit";

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

  const ip = clientIp(req.headers);

  // Issuing passes is the cheap half of the attack; cap it too.
  const limit = rateLimit(`verify:${ip}`, 10, 60 * 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  const verdict = await verifyCaptchaToken(body?.token || "", ip);
  if (!verdict.ok) {
    console.warn("[booking-captcha-rejected]", { reason: verdict.reason });
    return NextResponse.json(
      { ok: false, error: "Verification failed. Please try again." },
      { status: 400 },
    );
  }

  // The pass is bound to this client, so a captured one cannot be replayed
  // from another address.
  return NextResponse.json({ ok: true, pass: issueBookingPass(ip) });
}
