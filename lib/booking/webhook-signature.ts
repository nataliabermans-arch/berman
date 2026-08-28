import { createHmac, timingSafeEqual } from "node:crypto";

// Calendly webhook signature verification.
//
//   header  Calendly-Webhook-Signature: t=<unix seconds>,v1=<hex hmac>
//   signed  <t> + "." + <RAW body>
//   hmac    SHA-256 with the subscription's signing_key
//
// Calendly's own Node example HMACs JSON.stringify(req.body) and compares with
// `!==`. Both are wrong: re-serialising can produce different bytes from those
// that were signed, and a non-constant-time compare leaks the digest.

const TOLERANCE_SECONDS = 180;

export type SignatureCheck = { ok: true } | { ok: false; reason: string };

export function verifyCalendlySignature(
  header: string | null,
  rawBody: string,
  key: string,
): SignatureCheck {
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
    return {
      ok: false,
      reason: `timestamp outside tolerance (${Math.round(ageSeconds)}s)`,
    };
  }

  const expected = createHmac("sha256", key).update(`${t}.${rawBody}`).digest("hex");

  const a = Buffer.from(v1, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, reason: "signature mismatch" };
  }
  return { ok: true };
}
