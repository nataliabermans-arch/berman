import { NextRequest, NextResponse } from "next/server";
import https from "node:https";
import {
  deliverLead,
  hasFailedDelivery,
  hasSentGhl,
  hasSentWebhook,
  labelLeadReasons,
  missingRequiredDelivery,
  summarizeLeadDelivery,
} from "@/lib/leads/delivery";
import {
  FORM_ACKNOWLEDGMENT_TEXT,
  REQUESTED_TIME_WINDOWS,
  SMS_CONSENT_TEXT,
  requestedTimeWindowLabel,
} from "@/lib/leads/a2p";

// Keep website intake lightweight. This route forwards to the configured
// intake webhook when available, and falls back to the legacy intake pipeline
// that powered the WordPress site during launch.
// Do not invite detailed medical information into this form.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_DIGIT_RE = /\d/g;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const LEGACY_HOST = "bermansexualhealth.com";
const LEGACY_ORIGIN_IP = "50.62.141.127";
const LEGACY_CONTACT_PATH = "/contact/";

const REASON_VALUES = new Set<string>([
  "menopause-hormones",
  "sexual-health",
  "pelvic-urinary",
  "vaginal-rejuvenation",
  "aesthetic-regenerative",
  "body-contouring",
  "berman-supplements",
  "not-sure",
]);

const CONTACT_METHODS = new Set<string>(["phone", "email", "either"]);
const VISIT_TYPES = new Set<string>(["in-person", "telehealth", "either"]);
const REQUESTED_TIME_WINDOW_VALUES = new Set<string>(
  REQUESTED_TIME_WINDOWS.map((option) => option.value),
);

type ContactPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  preferredContact: string;
  reasons: string[];
  visitType: string;
  preferredWindow?: string;
  requestedDate?: string;
  requestedTimeWindow?: string;
  message: string;
  formAcknowledgment?: boolean;
  smsConsent?: boolean;
  consent?: boolean;
  source?: string;
};

function badRequest(message: string) {
  return NextResponse.json({ ok: false, error: message }, { status: 400 });
}

function nonEmpty(s: unknown): s is string {
  return typeof s === "string" && s.trim().length > 0;
}

function makeTicketId() {
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).slice(2, 6);
  return `tkt_${t}_${r}`;
}

function inferLeadSource(body: ContactPayload, req: NextRequest) {
  if (nonEmpty(body.source)) return body.source.trim();
  const referer = req.headers.get("referer");
  if (referer) {
    try {
      const pathname = new URL(referer).pathname;
      if (pathname === "/contact" || pathname === "/contact/") {
        return "website_contact_page";
      }
    } catch {
      // Ignore malformed referers and fall through to the generic source.
    }
  }
  return "website_lead_modal";
}

function decodeAttribute(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&#038;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function readHiddenValue(html: string, name: string) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = html.match(
    new RegExp(`name=['"]${escaped}['"][^>]*value=['"]([^'"]*)`, "i"),
  );
  return match?.[1] ? decodeAttribute(match[1]) : "";
}

function legacyHttpsRequest(options: {
  method: "GET" | "POST";
  path: string;
  body?: string;
  headers?: Record<string, string>;
}) {
  return new Promise<{ status: number; body: string }>((resolve, reject) => {
    const upstream = https.request(
      {
        hostname: LEGACY_HOST,
        servername: LEGACY_HOST,
        path: options.path,
        method: options.method,
        headers: {
          Host: LEGACY_HOST,
          "User-Agent": "BermanWebsiteContactForwarder/1.0",
          ...options.headers,
        },
        lookup: (_hostname, lookupOptions, callback) => {
          if (lookupOptions?.all) {
            callback(null, [{ address: LEGACY_ORIGIN_IP, family: 4 }]);
            return;
          }
          callback(null, LEGACY_ORIGIN_IP, 4);
        },
      },
      (response) => {
        const chunks: Buffer[] = [];
        response.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
        response.on("end", () => {
          resolve({
            status: response.statusCode ?? 502,
            body: Buffer.concat(chunks).toString("utf8"),
          });
        });
      },
    );

    upstream.on("error", reject);
    if (options.body) upstream.write(options.body);
    upstream.end();
  });
}

function addLegacyServiceChoices(params: URLSearchParams, reasons: string[]) {
  const add = (name: string, value: string) => {
    if (!params.has(name)) params.set(name, value);
  };

  for (const reason of reasons) {
    switch (reason) {
      case "menopause-hormones":
        add("input_9.3", "Hormones");
        add("input_9.6", "Menopause & Perimenopause");
        break;
      case "sexual-health":
      case "pelvic-urinary":
        add("input_9.8", "Sexual & Urinary Tract Health");
        break;
      case "vaginal-rejuvenation":
        add("input_9.2", "Vaginal Rejuvenation");
        break;
      case "aesthetic-regenerative":
        add("input_9.1", "Anti-Aging Treatments");
        add("input_9.4", "Skin Tight");
        break;
      case "body-contouring":
        add("input_9.7", "Body Sculpting, Fat Melting, Cellulite Treatment");
        break;
      case "berman-supplements":
      case "not-sure":
        add("input_9.1", "Anti-Aging Treatments");
        break;
    }
  }

  if (![...params.keys()].some((key) => key.startsWith("input_9."))) {
    add("input_9.1", "Anti-Aging Treatments");
  }
}

function hasFormAcknowledgment(body: ContactPayload) {
  return body.formAcknowledgment === true || body.consent === true;
}

function hasSmsConsent(body: ContactPayload) {
  return body.smsConsent === true;
}

async function submitLegacyGravityForm(body: ContactPayload, ticketId: string) {
  const contactPage = await legacyHttpsRequest({
    method: "GET",
    path: LEGACY_CONTACT_PATH,
  });

  if (contactPage.status < 200 || contactPage.status >= 300) {
    throw new Error("Legacy contact page unavailable");
  }

  const params = new URLSearchParams();
  params.set("input_1.3", body.firstName.trim());
  params.set("input_11.6", body.lastName.trim());
  params.set("input_3", body.email.trim());
  params.set("input_4", body.phone.trim());
  addLegacyServiceChoices(params, body.reasons);
  params.set("input_6", "White");
  params.set("input_10.1", "1");
  params.set(
    "input_10.2",
    hasSmsConsent(body) ? SMS_CONSENT_TEXT : FORM_ACKNOWLEDGMENT_TEXT,
  );
  params.set("input_10.3", "11");
  params.set("gform_submission_method", "postback");
  params.set(
    "gform_theme",
    readHiddenValue(contactPage.body, "gform_theme") || "gravity-theme",
  );
  params.set(
    "gform_style_settings",
    readHiddenValue(contactPage.body, "gform_style_settings") || "[]",
  );
  params.set("is_submit_1", "1");
  params.set("gform_submit", "1");
  params.set("gform_currency", readHiddenValue(contactPage.body, "gform_currency"));
  params.set("gform_unique_id", "");
  params.set("state_1", readHiddenValue(contactPage.body, "state_1"));
  params.set("gform_target_page_number_1", "0");
  params.set("gform_source_page_number_1", "1");
  params.set("gform_field_values", "");
  params.set(
    "input_999",
    [
      `Ticket: ${ticketId}`,
      `Visit: ${body.visitType}`,
      `Contact preference: ${body.preferredContact}`,
      `Preferred appointment date: ${body.requestedDate?.trim() || "not specified"}`,
      `Preferred appointment time: ${
        requestedTimeWindowLabel(body.requestedTimeWindow) || "not specified"
      }`,
      `Best contact time: ${body.preferredWindow?.trim() || "not specified"}`,
      `Reasons: ${labelLeadReasons(body.reasons).join(", ")}`,
      `SMS consent: ${hasSmsConsent(body) ? "yes" : "no"}`,
      `Message: ${body.message.trim()}`,
    ].join(" | "),
  );

  const payload = params.toString();
  const posted = await legacyHttpsRequest({
    method: "POST",
    path: LEGACY_CONTACT_PATH,
    body: payload,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": String(Buffer.byteLength(payload)),
      Referer: `https://${LEGACY_HOST}${LEGACY_CONTACT_PATH}`,
    },
  });

  if (posted.status < 200 || posted.status >= 400) {
    throw new Error("Legacy contact submission failed");
  }

  if (
    posted.body.includes("gform_validation_error") ||
    posted.body.includes("There was a problem with your submission")
  ) {
    throw new Error("Legacy contact submission was not accepted");
  }
}

export async function POST(req: NextRequest) {
  let body: ContactPayload;
  try {
    body = (await req.json()) as ContactPayload;
  } catch {
    return badRequest("Invalid JSON body");
  }

  if (!body || typeof body !== "object") return badRequest("Missing body");

  if (!nonEmpty(body.firstName)) return badRequest("First name is required");
  if (!nonEmpty(body.lastName)) return badRequest("Last name is required");
  if (!nonEmpty(body.email) || !EMAIL_RE.test(body.email.trim())) {
    return badRequest("A valid email is required");
  }
  if (!nonEmpty(body.phone)) return badRequest("Phone is required");
  const phoneDigits = (body.phone.match(PHONE_DIGIT_RE) || []).length;
  if (phoneDigits < 10)
    return badRequest("Phone must include at least 10 digits");

  if (!CONTACT_METHODS.has(body.preferredContact)) {
    return badRequest("Preferred contact method is invalid");
  }
  if (!VISIT_TYPES.has(body.visitType)) {
    return badRequest("Visit type is invalid");
  }

  if (!Array.isArray(body.reasons) || body.reasons.length === 0) {
    return badRequest("Select at least one reason for visit");
  }
  for (const r of body.reasons) {
    if (!REASON_VALUES.has(r)) return badRequest("Invalid reason value");
  }

  if (!nonEmpty(body.message)) return badRequest("Message is required");
  if (body.message.length > 800)
    return badRequest("Message exceeds 800 characters");

  if (body.requestedDate && !DATE_RE.test(body.requestedDate.trim())) {
    return badRequest("Preferred appointment date is invalid");
  }

  if (
    body.requestedTimeWindow &&
    !REQUESTED_TIME_WINDOW_VALUES.has(body.requestedTimeWindow)
  ) {
    return badRequest("Preferred appointment time window is invalid");
  }

  if (!hasFormAcknowledgment(body)) {
    return badRequest("Form acknowledgment is required");
  }

  const ticketId = makeTicketId();
  const receivedAt = new Date().toISOString();
  const smsConsent = hasSmsConsent(body);
  const lead = {
    ticketId,
    receivedAt,
    source: inferLeadSource(body, req),
    firstName: body.firstName.trim(),
    lastName: body.lastName.trim(),
    email: body.email.trim(),
    phone: body.phone.trim(),
    preferredContact: body.preferredContact,
    visitType: body.visitType,
    preferredWindow: body.preferredWindow?.trim() || null,
    requestedDate: body.requestedDate?.trim() || null,
    requestedTimeWindow: requestedTimeWindowLabel(body.requestedTimeWindow),
    reasons: body.reasons,
    reasonLabels: labelLeadReasons(body.reasons),
    message: body.message.trim(),
    formAcknowledgment: true,
    formAcknowledgmentText: FORM_ACKNOWLEDGMENT_TEXT,
    smsConsent,
    smsConsentText: smsConsent ? SMS_CONSENT_TEXT : null,
    sourceUrl: req.headers.get("referer"),
    userAgent: req.headers.get("user-agent"),
  };

  const delivery = await deliverLead(lead);
  if (hasFailedDelivery(delivery)) {
    console.error(
      "[contact-intake-delivery-failed]",
      summarizeLeadDelivery(delivery),
    );
    return NextResponse.json(
      {
        ok: false,
        error: "We couldn't send your message. Please call (310) 772-0072.",
      },
      { status: 502 },
    );
  }

  const missingRequired = missingRequiredDelivery(delivery);
  if (missingRequired.length > 0) {
    console.error("[contact-intake-delivery-missing-required]", {
      missingRequired,
      delivery: summarizeLeadDelivery(delivery),
    });
    return NextResponse.json(
      {
        ok: false,
        error: "Online intake is not fully configured. Please call (310) 772-0072.",
      },
      { status: 503 },
    );
  }

  if (hasSentGhl(delivery) || hasSentWebhook(delivery)) {
    return NextResponse.json({ ok: true, ticketId });
  }

  if (process.env.VERCEL_ENV === "production") {
    try {
      await submitLegacyGravityForm(body, ticketId);
      return NextResponse.json({ ok: true, ticketId });
    } catch (err) {
      console.error("[contact-intake-legacy-forward-failed]", err);
      return NextResponse.json(
        {
          ok: false,
          error: "We couldn't send your message. Please call (310) 772-0072.",
        },
        { status: 502 },
      );
    }
  }

  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      {
        ok: false,
        error: "Online intake is not configured. Please call (310) 772-0072.",
      },
      { status: 503 },
    );
  }

  console.log("[contact-intake-stub]", {
    ticketId,
    receivedAt,
    preferredContact: body.preferredContact,
    visitType: body.visitType,
    requestedDate: body.requestedDate || null,
    requestedTimeWindow: body.requestedTimeWindow || null,
    reasons: body.reasons,
    messageLength: body.message.length,
    formAcknowledgment: true,
    smsConsent,
  });

  return NextResponse.json({ ok: true, ticketId });
}
