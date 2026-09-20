import { NextRequest, NextResponse } from "next/server";
import { isPrivyrConfigured, sendPrivyrLead } from "@/lib/booking/privyr";
import { mapGhlToPrivyr } from "@/lib/leads/ghl-privyr";

// Relay: GoHighLevel workflow webhook -> Privyr, in the shape Privyr expects.
//
// The consult landing pages (consult./get.bermansexualhealth.com) are a
// separate app that creates GHL contacts with only a name, phone and email
// (source "external_form"). A GHL workflow then fires a webhook to Privyr — but
// GHL's webhook body is GHL's own contact shape, not Privyr's
// {name, phone, email, other_fields}. Privyr can't map it, so the phone and
// every attribute land wrong or not at all.
//
// GHL's workflow action can't be read or edited through the API. What CAN be
// changed — one field in the GHL UI — is the URL it posts to. Point it here:
//
//   https://www.bermansexualhealth.com/api/privyr/ghl?key=<PRIVYR_GHL_WEBHOOK_KEY>
//
// This route accepts whatever GHL sends (standard Webhook action or a
// hand-built Custom Webhook body), pulls out the person, normalises the phone
// to E.164 (the only format Privyr stores), labels every remaining attribute
// into other_fields, and forwards it through the same sender the booking form
// uses. It always answers 200 once authenticated, so GHL never retry-spams a
// lead Privyr already has.
//
// Verification without sending: add &dry=1 and the mapped Privyr payload is
// returned instead of posted.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Shared secret GHL must include in the URL (?key=) so only GHL can post here. */
function relayKey(): string {
  return (process.env.PRIVYR_GHL_WEBHOOK_KEY || "").trim();
}

async function readBody(req: NextRequest): Promise<Record<string, unknown> | null> {
  const ct = (req.headers.get("content-type") || "").toLowerCase();
  const raw = await req.text();
  if (!raw.trim()) return null;
  if (ct.includes("application/x-www-form-urlencoded")) {
    return Object.fromEntries(new URLSearchParams(raw).entries());
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    // GHL occasionally form-encodes even with a JSON content type.
    try {
      return Object.fromEntries(new URLSearchParams(raw).entries());
    } catch {
      return null;
    }
  }
}

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      relay: "ghl -> privyr",
      configured: Boolean(relayKey()),
      privyr: isPrivyrConfigured(),
      usage: "POST the GHL webhook here with ?key=<PRIVYR_GHL_WEBHOOK_KEY>; add &dry=1 to preview the mapping without sending",
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(req: NextRequest) {
  const expected = relayKey();
  if (!expected) {
    return NextResponse.json({ ok: false, error: "relay not configured" }, { status: 503 });
  }
  const given =
    req.nextUrl.searchParams.get("key") || req.headers.get("x-relay-key") || "";
  if (given !== expected) {
    return NextResponse.json({ ok: false, error: "unauthorised" }, { status: 401 });
  }

  const body = await readBody(req);
  if (!body) {
    console.warn("[privyr-ghl-relay] unreadable body");
    // 200 on purpose: a retry of an unreadable body will be just as unreadable.
    return NextResponse.json({ ok: false, error: "unreadable body" });
  }

  const { payload, diagnostics } = mapGhlToPrivyr(body);
  const dry = req.nextUrl.searchParams.get("dry") === "1";

  if (dry) {
    return NextResponse.json({ ok: true, dry: true, wouldSend: payload, diagnostics });
  }

  if (!payload.phone && !payload.email) {
    // Nothing Privyr could attach a lead to. Say so loudly, don't send junk.
    console.warn("[privyr-ghl-relay] no phone or email", diagnostics);
    return NextResponse.json({ ok: false, error: "no phone or email in payload", diagnostics });
  }

  const sent = await sendPrivyrLead(payload);
  // Values are never logged — only shape and outcome.
  console.info("[privyr-ghl-relay]", { ...diagnostics, privyrStatus: sent.status, ok: sent.ok });

  return NextResponse.json({
    ok: sent.ok,
    privyrStatus: sent.status,
    leadId: sent.leadId,
    mapped: {
      name: Boolean(payload.name),
      phone: payload.phone ? "E.164" : "missing",
      email: Boolean(payload.email),
      otherFields: Object.keys(payload.other_fields),
    },
  });
}
