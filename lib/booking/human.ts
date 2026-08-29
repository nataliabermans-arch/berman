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

/**
 * CAPTCHA counts as configured only when BOTH keys are present.
 *
 * The browser can only produce a pass if the public site key exists. If the
 * server enforced on the secret alone, a deploy that set one and not the other
 * would reject every real patient with a 403 they cannot act on — while the
 * page itself showed no CAPTCHA to solve. Requiring both makes the two sides
 * agree: either verification is on everywhere, or it is off everywhere.
 */
/**
 * CAPTCHA is OPT-IN. It is enforced only when
 * `NEXT_PUBLIC_BOOKING_REQUIRE_CAPTCHA` is exactly "true" AND both reCAPTCHA
 * keys are present.
 *
 * Deliberately off by default. A domain allowlist that has to be right in
 * Google's console before a single booking can be taken is a hard dependency
 * on config nobody can see, and its failure mode is blocking 100% of patients
 * with an error only they ever see. The endpoint still has the honeypot,
 * origin checking, the timing trap and per-IP rate limiting without it — which
 * is more than the form it replaces ever had.
 *
 * One variable, read identically on both sides, so the browser and the server
 * can never disagree about whether a pass is required.
 */
export function isCaptchaConfigured(): boolean {
  const requested =
    (process.env.NEXT_PUBLIC_BOOKING_REQUIRE_CAPTCHA || "").trim() === "true";
  if (!requested) return false;

  // Previews sit behind Vercel's own login, so a CAPTCHA there guards an
  // already-gated URL while blocking every test.
  if (process.env.VERCEL_ENV === "preview") return false;

  const hasSecret = secret().length > 20;
  const hasSiteKey =
    (process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "").trim().length > 20;

  if (hasSecret !== hasSiteKey) {
    console.error(
      "[booking-captcha-misconfigured] verification was requested but only one " +
        "of RECAPTCHA_SECRET_KEY / NEXT_PUBLIC_RECAPTCHA_SITE_KEY is set — it " +
        "is DISABLED rather than blocking every booking. Set both.",
    );
    return false;
  }
  return hasSecret;
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

// The pass is bound to the client it was issued to, so a captured one cannot be
// replayed from elsewhere. Hashed with the signing key so the raw IP is never
// written into a token that travels through the browser.
function clientFingerprint(ip: string | null | undefined): string {
  return createHmac("sha256", signingKey())
    .update(`ip:${ip || "unknown"}`)
    .digest("base64url")
    .slice(0, 22);
}

// Single-use enforcement. Serverless instances do not share memory, so this
// caps amplification rather than eliminating it: an attacker can get at most
// one booking per pass per warm instance instead of unlimited bookings per
// pass. A shared store (KV/Redis) would make it absolute; that is a
// provisioning decision, and this is the strongest guarantee available without
// one.
const consumed = new Map<string, number>();

function consumeNonce(nonce: string, exp: number): boolean {
  const now = Date.now();
  if (consumed.size > 5000) {
    for (const [k, v] of consumed) if (v <= now) consumed.delete(k);
  }
  const seen = consumed.get(nonce);
  if (seen !== undefined && seen > now) return false;
  consumed.set(nonce, exp);
  return true;
}

export function issueBookingPass(ip?: string | null): string {
  const payload = JSON.stringify({
    exp: Date.now() + PASS_TTL_MS,
    n: randomBytes(9).toString("base64url"),
    iph: clientFingerprint(ip),
  });
  const encoded = Buffer.from(payload).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export type PassVerdict =
  | { ok: true }
  | { ok: false; reason: "missing" | "signature" | "expired" | "wrong_client" | "already_used" };

/**
 * Hand a consumed pass back so the patient can legitimately try again.
 *
 * The pass is marked used before the booking is attempted, which is right for
 * replay protection but wrong for the retriable failures the UI actively invites
 * a retry from — a taken slot, a CRM blip. Without this, the second attempt is
 * refused with "that booking was already submitted" for a booking that never
 * happened.
 */
export function releaseBookingPass(pass: string): void {
  if (!pass) return;
  const [encoded] = pass.split(".");
  if (!encoded) return;
  try {
    const { n } = JSON.parse(Buffer.from(encoded, "base64url").toString());
    if (typeof n === "string") consumed.delete(n);
  } catch {
    // Malformed passes were never consumed in the first place.
  }
}

export function verifyBookingPass(
  pass: string,
  ip?: string | null,
): PassVerdict {
  if (!isCaptchaConfigured()) return { ok: true };
  if (!pass || typeof pass !== "string") return { ok: false, reason: "missing" };

  const [encoded, signature] = pass.split(".");
  if (!encoded || !signature) return { ok: false, reason: "missing" };

  const expected = sign(encoded);
  // Constant-time compare; lengths must match first or timingSafeEqual throws.
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, reason: "signature" };
  }

  let claims: { exp?: number; n?: string; iph?: string };
  try {
    claims = JSON.parse(Buffer.from(encoded, "base64url").toString());
  } catch {
    return { ok: false, reason: "signature" };
  }

  if (typeof claims.exp !== "number" || claims.exp <= Date.now()) {
    return { ok: false, reason: "expired" };
  }
  if (claims.iph !== clientFingerprint(ip)) {
    return { ok: false, reason: "wrong_client" };
  }
  if (!claims.n || !consumeNonce(claims.n, claims.exp)) {
    return { ok: false, reason: "already_used" };
  }
  return { ok: true };
}
