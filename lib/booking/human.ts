// Human verification for the booking flow.
//
// reCAPTCHA v2 tokens expire in about two minutes, but the CAPTCHA is presented
// at the START of the flow and the patient may spend several minutes choosing a
// time. So the Google token is verified immediately and exchanged for our own
// short-lived signed pass, which is what the booking endpoint actually checks.
//
// Server-only: reads the reCAPTCHA secret.

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";
const PASS_TTL_MS = 30 * 60_000;

function secret(): string {
  return (process.env.RECAPTCHA_SECRET_KEY || "").trim();
}

function signingKey(): string {
  return (
    process.env.BOOKING_SESSION_SECRET?.trim() ||
    // Falling back to the reCAPTCHA secret keeps this working if the dedicated
    // signing secret is not set, without ever using a hardcoded default.
    secret()
  );
}

export function isCaptchaConfigured(): boolean {
  return secret().length > 20;
}

export type CaptchaVerdict =
  | { ok: true }
  | { ok: false; reason: string };

export async function verifyCaptchaToken(
  token: string,
  remoteIp?: string | null,
): Promise<CaptchaVerdict> {
  if (!isCaptchaConfigured()) {
    // Not configured (local dev). Fail open rather than blocking the whole
    // flow, but say so loudly in the logs.
    console.warn("[booking-captcha-not-configured]");
    return { ok: true };
  }
  if (!token) return { ok: false, reason: "missing token" };

  const params = new URLSearchParams({ secret: secret(), response: token });
  if (remoteIp) params.set("remoteip", remoteIp);

  let res: Response;
  try {
    res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
      cache: "no-store",
    });
  } catch (err) {
    return {
      ok: false,
      reason: err instanceof Error ? err.message : "verification unreachable",
    };
  }

  const body = (await res.json().catch(() => null)) as {
    success?: boolean;
    "error-codes"?: string[];
  } | null;

  if (!body?.success) {
    return {
      ok: false,
      reason: (body?.["error-codes"] || ["unknown"]).join(","),
    };
  }
  return { ok: true };
}

// --- the pass we issue ourselves -------------------------------------------

function sign(payload: string): string {
  return createHmac("sha256", signingKey()).update(payload).digest("base64url");
}

export function issueBookingPass(): string {
  const payload = JSON.stringify({
    exp: Date.now() + PASS_TTL_MS,
    n: randomBytes(9).toString("base64url"),
  });
  const encoded = Buffer.from(payload).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function verifyBookingPass(pass: string): boolean {
  if (!isCaptchaConfigured()) return true;
  if (!pass || typeof pass !== "string") return false;

  const [encoded, signature] = pass.split(".");
  if (!encoded || !signature) return false;

  const expected = sign(encoded);
  // Constant-time compare; lengths must match first or timingSafeEqual throws.
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  try {
    const { exp } = JSON.parse(Buffer.from(encoded, "base64url").toString());
    return typeof exp === "number" && exp > Date.now();
  } catch {
    return false;
  }
}
