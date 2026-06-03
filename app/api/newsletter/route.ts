import { NextRequest, NextResponse } from "next/server";
import {
  deliverLead,
  hasFailedDelivery,
  hasSentGhl,
  hasSentWebhook,
  missingRequiredDelivery,
  summarizeLeadDelivery,
} from "@/lib/leads/delivery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SOURCES = new Set(["homepage_berman_brief", "footer_berman_brief"]);

function ticketId() {
  return `nl_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

function sourceLabel(source: string) {
  return source === "footer_berman_brief"
    ? "footer Berman Brief signup"
    : "homepage Berman Brief signup";
}

export async function POST(req: NextRequest) {
  let body: { email?: unknown; source?: unknown };
  try {
    body = (await req.json()) as { email?: unknown; source?: unknown };
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const source =
    typeof body.source === "string" && SOURCES.has(body.source)
      ? body.source
      : "homepage_berman_brief";

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { ok: false, error: "A valid email is required" },
      { status: 400 },
    );
  }

  const id = ticketId();
  const receivedAt = new Date().toISOString();
  const lead = {
    ticketId: id,
    receivedAt,
    source,
    firstName: "Berman Brief",
    lastName: "Subscriber",
    email,
    phone: "",
    preferredContact: "email",
    visitType: null,
    preferredWindow: null,
    reasons: ["berman-brief"],
    reasonLabels: ["The Berman Brief"],
    message: `Berman Brief newsletter signup from ${sourceLabel(source)}.`,
    consent: null,
    smsConsentText: null,
    sourceUrl: req.headers.get("referer"),
    userAgent: req.headers.get("user-agent"),
  };

  const delivery = await deliverLead(lead);
  if (hasFailedDelivery(delivery)) {
    console.error("[newsletter-delivery-failed]", summarizeLeadDelivery(delivery));
    return NextResponse.json(
      { ok: false, error: "We could not subscribe that email yet." },
      { status: 502 },
    );
  }

  const missingRequired = missingRequiredDelivery(delivery);
  if (missingRequired.length > 0) {
    console.error("[newsletter-delivery-missing-required]", {
      missingRequired,
      delivery: summarizeLeadDelivery(delivery),
    });
    return NextResponse.json(
      { ok: false, error: "Newsletter intake is not fully configured." },
      { status: 503 },
    );
  }

  if (hasSentGhl(delivery) || hasSentWebhook(delivery)) {
    return NextResponse.json({ ok: true, ticketId: id });
  }

  if (process.env.NODE_ENV !== "production") {
    console.log("[newsletter-intake-stub]", { ticketId: id, source });
    return NextResponse.json({ ok: true, ticketId: id });
  }

  return NextResponse.json(
    { ok: false, error: "Newsletter intake is not configured." },
    { status: 503 },
  );
}
