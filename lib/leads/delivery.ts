export type LeadDeliverySource =
  | "website_lead_modal"
  | "website_contact_page"
  | "website_contact_form"
  | "ai_concierge"
  | string;

export interface LeadDeliveryPayload {
  ticketId: string;
  source: LeadDeliverySource;
  receivedAt: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  preferredContact?: string | null;
  visitType?: string | null;
  preferredWindow?: string | null;
  requestedDate?: string | null;
  requestedTimeWindow?: string | null;
  reasons?: string[];
  reasonLabels?: string[];
  message?: string | null;
  formAcknowledgment?: boolean | null;
  formAcknowledgmentText?: string | null;
  smsConsent?: boolean | null;
  consent?: boolean | null;
  smsConsentText?: string | null;
  sourceUrl?: string | null;
  userAgent?: string | null;
  conversationId?: string | null;
  recommendedSpecialty?: string | null;
  conversationSummary?: string | null;
}

export type LeadDeliveryStatus = "sent" | "skipped" | "failed";

export interface LeadDeliveryChannelResult {
  channel: "ghl" | "webhook" | "email";
  status: LeadDeliveryStatus;
  target?: string;
  detail?: string;
}

export interface LeadDeliveryResult {
  ghl: LeadDeliveryChannelResult;
  webhook: LeadDeliveryChannelResult[];
  email: LeadDeliveryChannelResult;
}

const GHL_BASE_URL = "https://services.leadconnectorhq.com";
const GHL_API_VERSION = "2021-07-28";
const GHL_OPPORTUNITY_API_VERSION = "2023-02-21";
const BERMAN_MARKETING_PIPELINE_ID = "eLqGD6YG5VkNOXYqrlux";
const BERMAN_NEW_LEADS_STAGE_ID = "e3f01ead-c51c-425f-a182-512d88c320bb";
const GHL_CUSTOM_FIELD_KEYS = {
  ticketId: "berman_website_lead_ticket_id",
  source: "berman_website_lead_source",
  submittedAt: "berman_website_lead_submitted_at",
  reasons: "berman_website_lead_reasons",
  reasonValues: "berman_website_lead_reason_values",
  issueSummary: "berman_website_lead_issue_summary",
  preferredContact: "berman_website_preferred_contact",
  visitType: "berman_website_visit_type",
  preferredWindow: "berman_website_preferred_window",
  requestedDate: "berman_website_requested_date",
  requestedTimeWindow: "berman_website_requested_time_window",
  formAcknowledgment: "berman_website_form_acknowledgment",
  smsConsent: "berman_website_sms_consent",
  smsConsentText: "berman_website_sms_consent_text",
  sourceUrl: "berman_website_source_url",
  userAgent: "berman_website_user_agent",
} as const;

const REASON_LABELS: Record<string, string> = {
  "menopause-hormones": "Menopause & Hormones",
  "sexual-health": "Sexual Health",
  "pelvic-urinary": "Pelvic & Urinary",
  "vaginal-rejuvenation": "Vaginal Rejuvenation",
  "aesthetic-regenerative": "Aesthetic & Regenerative",
  "body-contouring": "Body Contouring",
  "berman-supplements": "Berman Supplements",
  "berman-brief": "The Berman Brief",
  "not-sure": "Not sure yet",
};

function splitList(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(/[;,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function compact<T>(values: Array<T | null | undefined | false>): T[] {
  return values.filter(Boolean) as T[];
}

function envValue(...names: string[]): string {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) return value;
  }
  return "";
}

function envFlag(name: string): boolean | undefined {
  const value = process.env[name]?.trim().toLowerCase();
  if (!value) return undefined;
  if (["1", "true", "yes", "on"].includes(value)) return true;
  if (["0", "false", "no", "off"].includes(value)) return false;
  return undefined;
}

function describeWebhookTarget(value: string): string {
  try {
    const url = new URL(value);
    return url.origin;
  } catch {
    return "configured webhook";
  }
}

function getLeadWebhookUrls(): string[] {
  return unique(
    compact([
      envValue("GHL_LEAD_WEBHOOK_URL"),
      envValue("CONTACT_INTAKE_WEBHOOK_URL"),
    ]),
  );
}

function getGhlConfig() {
  return {
    token: envValue("GHL_BERMAN_API_TOKEN", "BERMAN_GHL_API_TOKEN"),
    locationId: envValue("GHL_BERMAN_LOCATION_ID", "BERMAN_GHL_LOCATION_ID"),
    pipelineId:
      envValue("GHL_BERMAN_PIPELINE_ID", "BERMAN_GHL_PIPELINE_ID") ||
      BERMAN_MARKETING_PIPELINE_ID,
    pipelineStageId:
      envValue(
        "GHL_BERMAN_PIPELINE_STAGE_ID",
        "BERMAN_GHL_PIPELINE_STAGE_ID",
      ) || BERMAN_NEW_LEADS_STAGE_ID,
    createOpportunity: envFlag("LEAD_DELIVERY_CREATE_GHL_OPPORTUNITY") ?? true,
  };
}

function getEmailConfig() {
  const to = splitList(envValue("LEAD_NOTIFICATION_TO"));
  const cc = splitList(envValue("LEAD_NOTIFICATION_CC"));
  return {
    apiKey: envValue("RESEND_API_KEY"),
    from: envValue("LEAD_NOTIFICATION_FROM"),
    to,
    cc,
  };
}

export function labelLeadReasons(reasons: string[] = []): string[] {
  return reasons.map((reason) => REASON_LABELS[reason] || reason);
}

export function normalizeVisitType(value?: string | null): string | null {
  if (!value) return null;
  return value.replace(/_/g, "-");
}

export function getLeadDeliveryRequirements() {
  const explicitGhlRequirement = envFlag("LEAD_DELIVERY_REQUIRE_GHL");
  return {
    requireGhl:
      explicitGhlRequirement === undefined
        ? process.env.VERCEL_ENV === "production"
        : explicitGhlRequirement,
    requireWebhook: envFlag("LEAD_DELIVERY_REQUIRE_WEBHOOK") === true,
    requireEmail: envFlag("LEAD_DELIVERY_REQUIRE_EMAIL") === true,
  };
}

function truncate(value: string, max = 2000): string {
  return value.length > max ? `${value.slice(0, max - 3)}...` : value;
}

function formatValue(value?: string | null): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "Not specified";
}

function formatList(values?: string[] | null): string {
  return values && values.length > 0 ? values.join(", ") : "Not specified";
}

function getSmsConsent(lead: LeadDeliveryPayload): boolean | null {
  if (lead.smsConsent !== undefined && lead.smsConsent !== null) {
    return lead.smsConsent;
  }
  return lead.consent ?? null;
}

function formatYesNo(value?: boolean | null): string {
  if (value === null || value === undefined) return "Not captured";
  return value ? "Yes" : "No";
}

function leadName(lead: LeadDeliveryPayload): string {
  return [lead.firstName, lead.lastName].map((part) => part.trim()).join(" ");
}

function notificationSubject(lead: LeadDeliveryPayload): string {
  const name = leadName(lead).trim() || "Website lead";
  return `New Berman website lead: ${name}`;
}

function renderNotificationText(lead: LeadDeliveryPayload): string {
  const reasonLabels = lead.reasonLabels?.length
    ? lead.reasonLabels
    : labelLeadReasons(lead.reasons || []);

  return [
    "New website lead",
    "",
    `Ticket: ${lead.ticketId}`,
    `Source: ${lead.source}`,
    `Submitted: ${lead.receivedAt}`,
    "",
    `Name: ${formatValue(leadName(lead))}`,
    `Phone: ${formatValue(lead.phone)}`,
    `Email: ${formatValue(lead.email)}`,
    `Preferred contact: ${formatValue(lead.preferredContact)}`,
    `Visit type: ${formatValue(normalizeVisitType(lead.visitType))}`,
    `Preferred appointment date: ${formatValue(lead.requestedDate)}`,
    `Preferred appointment time: ${formatValue(lead.requestedTimeWindow)}`,
    `Best time to reach: ${formatValue(lead.preferredWindow)}`,
    "",
    `Reason(s): ${formatList(reasonLabels)}`,
    `Recommended specialty: ${formatValue(lead.recommendedSpecialty)}`,
    "",
    "Message / issue summary:",
    formatValue(lead.message || lead.conversationSummary),
    "",
    `Form acknowledgment: ${formatYesNo(lead.formAcknowledgment)}`,
    `SMS consent: ${formatYesNo(getSmsConsent(lead))}`,
    `SMS consent text: ${formatValue(lead.smsConsentText)}`,
    `Source URL: ${formatValue(lead.sourceUrl)}`,
    `User agent: ${formatValue(lead.userAgent)}`,
    `Conversation ID: ${formatValue(lead.conversationId)}`,
  ].join("\n");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderRow(label: string, value: string): string {
  return `<tr><th align="left" style="padding:6px 12px 6px 0;color:#4a1c26;font-family:Arial,sans-serif;font-size:13px;">${escapeHtml(
    label,
  )}</th><td style="padding:6px 0;color:#20191b;font-family:Arial,sans-serif;font-size:13px;">${escapeHtml(
    value,
  )}</td></tr>`;
}

function renderNotificationHtml(lead: LeadDeliveryPayload): string {
  const reasonLabels = lead.reasonLabels?.length
    ? lead.reasonLabels
    : labelLeadReasons(lead.reasons || []);
  const message = formatValue(lead.message || lead.conversationSummary);
  const consent = formatYesNo(getSmsConsent(lead));

  return `<!doctype html>
<html>
  <body style="margin:0;background:#fff7f4;padding:24px;">
    <div style="max-width:680px;background:#ffffff;border:1px solid #f0d8d9;border-radius:8px;padding:24px;">
      <h1 style="margin:0 0 16px;color:#4a1c26;font-family:Georgia,serif;font-size:24px;">New website lead</h1>
      <table role="presentation" cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;">
        ${renderRow("Ticket", lead.ticketId)}
        ${renderRow("Source", String(lead.source))}
        ${renderRow("Submitted", lead.receivedAt)}
        ${renderRow("Name", formatValue(leadName(lead)))}
        ${renderRow("Phone", formatValue(lead.phone))}
        ${renderRow("Email", formatValue(lead.email))}
        ${renderRow("Preferred contact", formatValue(lead.preferredContact))}
        ${renderRow("Visit type", formatValue(normalizeVisitType(lead.visitType)))}
        ${renderRow("Preferred appointment date", formatValue(lead.requestedDate))}
        ${renderRow("Preferred appointment time", formatValue(lead.requestedTimeWindow))}
        ${renderRow("Best time to reach", formatValue(lead.preferredWindow))}
        ${renderRow("Reason(s)", formatList(reasonLabels))}
        ${renderRow("Recommended specialty", formatValue(lead.recommendedSpecialty))}
        ${renderRow("Form acknowledgment", formatYesNo(lead.formAcknowledgment))}
        ${renderRow("SMS consent", consent)}
        ${renderRow("SMS consent text", formatValue(lead.smsConsentText))}
        ${renderRow("Source URL", formatValue(lead.sourceUrl))}
        ${renderRow("User agent", formatValue(lead.userAgent))}
        ${renderRow("Conversation ID", formatValue(lead.conversationId))}
      </table>
      <h2 style="margin:20px 0 8px;color:#4a1c26;font-family:Arial,sans-serif;font-size:15px;">Message / issue summary</h2>
      <p style="white-space:pre-wrap;margin:0;color:#20191b;font-family:Arial,sans-serif;font-size:14px;line-height:1.55;">${escapeHtml(
        message,
      )}</p>
    </div>
  </body>
</html>`;
}

function leadIssueSummary(lead: LeadDeliveryPayload): string {
  return truncate(formatValue(lead.message || lead.conversationSummary));
}

function ghlCustomFields(lead: LeadDeliveryPayload) {
  const reasonLabels = lead.reasonLabels?.length
    ? lead.reasonLabels
    : labelLeadReasons(lead.reasons || []);
  const smsConsent = getSmsConsent(lead);
  const requestedTimeWindow = formatValue(lead.requestedTimeWindow);
  const preferredWindow = [lead.requestedDate, lead.requestedTimeWindow]
    .map((item) => item?.trim())
    .filter(Boolean)
    .join(" | ");

  return [
    {
      key: GHL_CUSTOM_FIELD_KEYS.ticketId,
      field_value: lead.ticketId,
    },
    {
      key: GHL_CUSTOM_FIELD_KEYS.source,
      field_value: String(lead.source),
    },
    {
      key: GHL_CUSTOM_FIELD_KEYS.submittedAt,
      field_value: lead.receivedAt,
    },
    {
      key: GHL_CUSTOM_FIELD_KEYS.reasons,
      field_value: truncate(formatList(reasonLabels)),
    },
    {
      key: GHL_CUSTOM_FIELD_KEYS.reasonValues,
      field_value: truncate(formatList(lead.reasons)),
    },
    {
      key: GHL_CUSTOM_FIELD_KEYS.issueSummary,
      field_value: leadIssueSummary(lead),
    },
    {
      key: GHL_CUSTOM_FIELD_KEYS.preferredContact,
      field_value: formatValue(lead.preferredContact),
    },
    {
      key: GHL_CUSTOM_FIELD_KEYS.visitType,
      field_value: formatValue(normalizeVisitType(lead.visitType)),
    },
    {
      key: GHL_CUSTOM_FIELD_KEYS.preferredWindow,
      field_value: formatValue(preferredWindow || lead.preferredWindow),
    },
    {
      key: GHL_CUSTOM_FIELD_KEYS.requestedDate,
      field_value: formatValue(lead.requestedDate),
    },
    {
      key: GHL_CUSTOM_FIELD_KEYS.requestedTimeWindow,
      field_value: requestedTimeWindow,
    },
    {
      key: GHL_CUSTOM_FIELD_KEYS.formAcknowledgment,
      field_value: formatYesNo(lead.formAcknowledgment),
    },
    {
      key: GHL_CUSTOM_FIELD_KEYS.smsConsent,
      field_value: formatYesNo(smsConsent),
    },
    {
      key: GHL_CUSTOM_FIELD_KEYS.smsConsentText,
      field_value: truncate(formatValue(lead.smsConsentText)),
    },
    {
      key: GHL_CUSTOM_FIELD_KEYS.sourceUrl,
      field_value: truncate(formatValue(lead.sourceUrl), 500),
    },
    {
      key: GHL_CUSTOM_FIELD_KEYS.userAgent,
      field_value: truncate(formatValue(lead.userAgent), 500),
    },
  ];
}

function ghlTags(lead: LeadDeliveryPayload): string[] {
  const source = String(lead.source);
  const isNewsletterSignup =
    source.includes("berman_brief") || lead.reasons?.includes("berman-brief");
  const smsConsent = getSmsConsent(lead);

  return unique(
    compact([
      "berman-website-lead",
      lead.source === "ai_concierge" ? "ai-concierge-lead" : "website-form-lead",
      isNewsletterSignup && "berman-brief-subscriber",
      isNewsletterSignup && "newsletter-signup",
      !isNewsletterSignup &&
        smsConsent !== null &&
        (smsConsent ? "sms-consent-yes" : "sms-consent-no"),
    ]),
  );
}

function extractGhlContactId(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const data = body as { id?: unknown; contact?: { id?: unknown } };
  if (typeof data.contact?.id === "string") return data.contact.id;
  if (typeof data.id === "string") return data.id;
  return null;
}

function isNewsletterLead(lead: LeadDeliveryPayload): boolean {
  const source = String(lead.source);
  return (
    source.includes("berman_brief") ||
    Boolean(lead.reasons?.includes("berman-brief"))
  );
}

function shouldCreateGhlOpportunity(lead: LeadDeliveryPayload): boolean {
  const config = getGhlConfig();
  return config.createOpportunity && !isNewsletterLead(lead);
}

function ghlOpportunityName(lead: LeadDeliveryPayload): string {
  const name = leadName(lead).trim();
  if (name) return `${name} - Website inquiry`;
  if (lead.email) return `${lead.email} - Website inquiry`;
  return `Website inquiry ${lead.ticketId}`;
}

async function findExistingGhlOpportunity({
  contactId,
  locationId,
  pipelineId,
  headers,
}: {
  contactId: string;
  locationId: string;
  pipelineId: string;
  headers: Record<string, string>;
}): Promise<{ id: string } | null> {
  const params = new URLSearchParams({
    location_id: locationId,
    contact_id: contactId,
    pipeline_id: pipelineId,
    status: "open",
    limit: "20",
  });

  const response = await fetch(`${GHL_BASE_URL}/opportunities/search?${params}`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error(`GHL opportunity search returned ${response.status}.`);
  }

  const body = (await response.json().catch(() => null)) as
    | { opportunities?: Array<{ id?: unknown }> }
    | null;
  const opportunity = body?.opportunities?.find(
    (item) => typeof item.id === "string",
  );
  const opportunityId = opportunity?.id;
  return typeof opportunityId === "string" ? { id: opportunityId } : null;
}

async function createGhlOpportunity({
  lead,
  contactId,
  locationId,
  pipelineId,
  pipelineStageId,
  token,
}: {
  lead: LeadDeliveryPayload;
  contactId: string;
  locationId: string;
  pipelineId: string;
  pipelineStageId: string;
  token: string;
}): Promise<string> {
  const response = await fetch(`${GHL_BASE_URL}/opportunities/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Version: GHL_OPPORTUNITY_API_VERSION,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pipelineId,
      locationId,
      name: ghlOpportunityName(lead),
      pipelineStageId,
      status: "open",
      contactId,
      monetaryValue: 0,
    }),
  });

  const body = (await response.json().catch(() => null)) as
    | { opportunity?: { id?: unknown }; id?: unknown; message?: unknown }
    | null;

  if (!response.ok) {
    const detail =
      typeof body?.message === "string" ? ` ${body.message}` : "";
    throw new Error(`GHL opportunity create returned ${response.status}.${detail}`);
  }

  const id = body?.opportunity?.id || body?.id;
  return typeof id === "string" ? id : "created";
}

async function sendLeadToGhl(
  lead: LeadDeliveryPayload,
): Promise<LeadDeliveryChannelResult> {
  const config = getGhlConfig();
  if (!config.token || !config.locationId) {
    return {
      channel: "ghl",
      status: "skipped",
      detail: "Missing GHL_BERMAN_API_TOKEN or GHL_BERMAN_LOCATION_ID.",
    };
  }

  const headers = {
    Authorization: `Bearer ${config.token}`,
    Version: GHL_API_VERSION,
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  try {
    const response = await fetch(`${GHL_BASE_URL}/contacts/upsert`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        locationId: config.locationId,
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email,
        phone: lead.phone,
        source: "Berman website lead form",
        customFields: ghlCustomFields(lead),
      }),
    });

    let responseBody: unknown = null;
    try {
      responseBody = await response.json();
    } catch {
      responseBody = null;
    }

    if (!response.ok) {
      return {
        channel: "ghl",
        status: "failed",
        target: "Jennifer R. Berman, MD",
        detail: `GHL contact upsert returned ${response.status}.`,
      };
    }

    const contactId = extractGhlContactId(responseBody);
    const details: string[] = [];
    if (contactId) {
      const tagResponse = await fetch(
        `${GHL_BASE_URL}/contacts/${encodeURIComponent(contactId)}/tags`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ tags: ghlTags(lead) }),
        },
      );
      if (!tagResponse.ok) {
        details.push(`Contact tag add returned ${tagResponse.status}.`);
      }

      if (shouldCreateGhlOpportunity(lead)) {
        const opportunityHeaders = {
          Authorization: `Bearer ${config.token}`,
          Version: GHL_OPPORTUNITY_API_VERSION,
          Accept: "application/json",
        };
        const existingOpportunity = await findExistingGhlOpportunity({
          contactId,
          locationId: config.locationId,
          pipelineId: config.pipelineId,
          headers: opportunityHeaders,
        });

        if (existingOpportunity) {
          details.push(`Opportunity ${existingOpportunity.id} already open.`);
        } else {
          const opportunityId = await createGhlOpportunity({
            lead,
            contactId,
            locationId: config.locationId,
            pipelineId: config.pipelineId,
            pipelineStageId: config.pipelineStageId,
            token: config.token,
          });
          details.push(`Opportunity ${opportunityId} created.`);
        }
      }
    }

    return {
      channel: "ghl",
      status: "sent",
      target: "Jennifer R. Berman, MD",
      detail: contactId
        ? `Contact ${contactId} upserted. ${details.join(" ")}`.trim()
        : "Contact upserted without returned id.",
    };
  } catch (err) {
    return {
      channel: "ghl",
      status: "failed",
      target: "Jennifer R. Berman, MD",
      detail: err instanceof Error ? err.message : "GHL request failed.",
    };
  }
}

async function sendLeadWebhooks(
  lead: LeadDeliveryPayload,
): Promise<LeadDeliveryChannelResult[]> {
  const urls = getLeadWebhookUrls();
  if (urls.length === 0) {
    return [
      {
        channel: "webhook",
        status: "skipped",
        detail: "No GHL/contact intake webhook configured.",
      },
    ];
  }

  return Promise.all(
    urls.map(async (url) => {
      const target = describeWebhookTarget(url);
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "berman.website_lead.created",
            ...lead,
            lead,
          }),
        });

        if (!response.ok) {
          return {
            channel: "webhook" as const,
            status: "failed" as const,
            target,
            detail: `Webhook returned ${response.status}.`,
          };
        }

        return {
          channel: "webhook" as const,
          status: "sent" as const,
          target,
        };
      } catch (err) {
        return {
          channel: "webhook" as const,
          status: "failed" as const,
          target,
          detail: err instanceof Error ? err.message : "Webhook request failed.",
        };
      }
    }),
  );
}

async function sendLeadNotificationEmail(
  lead: LeadDeliveryPayload,
): Promise<LeadDeliveryChannelResult> {
  const config = getEmailConfig();
  if (!config.apiKey || !config.from || config.to.length === 0) {
    return {
      channel: "email",
      status: "skipped",
      detail:
        "Missing RESEND_API_KEY, LEAD_NOTIFICATION_FROM, or LEAD_NOTIFICATION_TO.",
    };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: config.from,
        to: config.to,
        cc: config.cc.length > 0 ? config.cc : undefined,
        reply_to: lead.email,
        subject: notificationSubject(lead),
        text: renderNotificationText(lead),
        html: renderNotificationHtml(lead),
      }),
    });

    if (!response.ok) {
      return {
        channel: "email",
        status: "failed",
        target: config.to.join(", "),
        detail: `Resend returned ${response.status}.`,
      };
    }

    return {
      channel: "email",
      status: "sent",
      target: config.to.join(", "),
    };
  } catch (err) {
    return {
      channel: "email",
      status: "failed",
      target: config.to.join(", "),
      detail: err instanceof Error ? err.message : "Email request failed.",
    };
  }
}

export async function deliverLead(
  lead: LeadDeliveryPayload,
): Promise<LeadDeliveryResult> {
  const [ghl, webhook, email] = await Promise.all([
    sendLeadToGhl(lead),
    sendLeadWebhooks(lead),
    sendLeadNotificationEmail(lead),
  ]);
  return { ghl, webhook, email };
}

export function hasFailedDelivery(result: LeadDeliveryResult): boolean {
  const requirements = getLeadDeliveryRequirements();
  return (
    (requirements.requireGhl && result.ghl.status === "failed") ||
    (requirements.requireWebhook &&
      result.webhook.some((item) => item.status === "failed")) ||
    (requirements.requireEmail && result.email.status === "failed")
  );
}

export function hasSentGhl(result: LeadDeliveryResult): boolean {
  return result.ghl.status === "sent";
}

export function hasSentWebhook(result: LeadDeliveryResult): boolean {
  return result.webhook.some((item) => item.status === "sent");
}

export function hasSentEmail(result: LeadDeliveryResult): boolean {
  return result.email.status === "sent";
}

export function missingRequiredDelivery(result: LeadDeliveryResult): string[] {
  const requirements = getLeadDeliveryRequirements();
  const missing: string[] = [];
  if (requirements.requireGhl && !hasSentGhl(result)) {
    missing.push("ghl");
  }
  if (requirements.requireWebhook && !hasSentWebhook(result)) {
    missing.push("webhook");
  }
  if (requirements.requireEmail && !hasSentEmail(result)) {
    missing.push("email");
  }
  return missing;
}

export function summarizeLeadDelivery(result: LeadDeliveryResult) {
  return {
    ghl: {
      status: result.ghl.status,
      target: result.ghl.target,
      detail: result.ghl.detail,
    },
    webhook: result.webhook.map((item) => ({
      status: item.status,
      target: item.target,
      detail: item.detail,
    })),
    email: {
      status: result.email.status,
      target: result.email.target,
      detail: result.email.detail,
    },
  };
}
