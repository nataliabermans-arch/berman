// Maps a GoHighLevel workflow-webhook body onto Privyr's incoming-lead schema.
//
// Lives in lib/ (not the route file) because Next.js route modules may only
// export HTTP handlers, and because the mapping is the part worth testing on
// its own: GHL's standard Webhook action and a hand-built Custom Webhook put the
// same person under different keys, and the phone must leave here in E.164 —
// the only format Privyr stores.
import { toE164 } from "@/lib/booking/privyr";

const SOURCE_DEFAULT = "consult.bermansexualhealth.com form";

/** Keys that are GHL plumbing, not lead attributes. Never forwarded. */
const NOISE = new Set([
  "id",
  "contact_id",
  "contactid",
  "location",
  "location_id",
  "locationid",
  "workflow",
  "triggerdata",
  "trigger_data",
  "customdata",
  "attributionsource",
  "attribution_source",
  "contact",
  "user",
  "owner",
  "assigned_to",
  "assignedto",
  "timezone",
  "date_updated",
  "dateupdated",
  "formaction",
  "sessionid",
  "eventdata",
  "funneeventdata",
  "key",
  "dry",
]);

/** Identity keys consumed into the top-level Privyr fields. */
const IDENTITY = new Set([
  "first_name",
  "firstname",
  "last_name",
  "lastname",
  "full_name",
  "fullname",
  "name",
  "contactname",
  "email",
  "email_address",
  "phone",
  "phone_number",
  "phonenumber",
  "mobile",
  "mobile_phone",
]);


function str(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v.trim();
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (Array.isArray(v)) return v.map(str).filter(Boolean).join(", ");
  return "";
}

/** "utm_campaign" / "smsConsent" / "date_created" -> "Utm campaign" / "Sms consent" / "Date created". */
function label(key: string): string {
  const spaced = key
    .replace(/[_\-.]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .trim()
    .toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

type Flat = Map<string, unknown>;

/**
 * Flattens one level of the nested objects GHL uses (contact, customData,
 * attributionSource) so a lead attribute is found wherever GHL put it. Keys are
 * lower-cased for lookup; the original key is kept for labelling.
 */
function flatten(body: Record<string, unknown>): { lookup: Flat; original: Map<string, string> } {
  const lookup: Flat = new Map();
  const original = new Map<string, string>();
  const put = (k: string, v: unknown) => {
    const lk = k.toLowerCase();
    if (!lookup.has(lk)) {
      lookup.set(lk, v);
      original.set(lk, k);
    }
  };
  for (const [k, v] of Object.entries(body)) {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      const lk = k.toLowerCase();
      if (lk === "contact" || lk === "customdata" || lk === "attributionsource" || lk === "attribution_source") {
        for (const [ik, iv] of Object.entries(v as Record<string, unknown>)) put(ik, iv);
        continue;
      }
    }
    put(k, v);
  }
  return { lookup, original };
}

function pick(lookup: Flat, ...keys: string[]): string {
  for (const k of keys) {
    const v = str(lookup.get(k.toLowerCase()));
    if (v) return v;
  }
  return "";
}

export function mapGhlToPrivyr(body: Record<string, unknown>) {
  const { lookup, original } = flatten(body);

  const first = pick(lookup, "first_name", "firstName", "firstname");
  const last = pick(lookup, "last_name", "lastName", "lastname");
  const full =
    pick(lookup, "full_name", "fullName", "fullname", "name", "contactName") ||
    `${first} ${last}`.trim();
  const displayName = first || full.split(/\s+/)[0] || "";
  const email = pick(lookup, "email", "email_address").toLowerCase();
  const phoneRaw = pick(lookup, "phone", "phone_number", "phoneNumber", "mobile", "mobile_phone");
  const phone = phoneRaw ? toE164(phoneRaw) : "";

  const source = pick(lookup, "contact_source", "source", "lead_source") || SOURCE_DEFAULT;
  const submitted = pick(lookup, "date_created", "dateCreated", "created_at", "createdAt", "timestamp");

  // Everything else that carries a value becomes a labelled attribute, in a
  // stable order: consent first (staff need it), then attribution, then the
  // rest alphabetically. Bounded so a runaway payload can't bloat the lead.
  const other: Record<string, string> = {};
  const consentKeys = [...lookup.keys()].filter((k) => /consent|opt.?in|sms|tcpa/.test(k));
  for (const k of consentKeys) {
    const v = str(lookup.get(k));
    if (v) other[label(original.get(k) || k)] = v;
  }
  const page = pick(lookup, "url", "page_url", "pageUrl", "landing_page", "sessionSource");
  if (page) other["Page"] = page;
  for (const [k, lab] of [
    ["utm_source", "UTM source"],
    ["utmsource", "UTM source"],
    ["utm_medium", "UTM medium"],
    ["utmmedium", "UTM medium"],
    ["utm_campaign", "UTM campaign"],
    ["utmcampaign", "UTM campaign"],
    ["referrer", "Referrer"],
    ["medium", "Medium"],
  ] as const) {
    const v = str(lookup.get(k));
    if (v && !other[lab]) other[lab] = v;
  }
  if (submitted) other["Submitted"] = submitted;
  other["Source"] = source;

  const rest: Array<[string, string]> = [];
  for (const [lk, v] of lookup) {
    if (NOISE.has(lk) || IDENTITY.has(lk) || consentKeys.includes(lk)) continue;
    if (/^(utm|url|page_url|pageurl|landing_page|referrer|medium|sessionsource|date_created|datecreated|created_at|createdat|timestamp|contact_source|source|lead_source)$/.test(lk)) continue;
    if (/token|secret|password|api[_-]?key/.test(lk)) continue;
    const s = str(v);
    if (!s) continue;
    rest.push([label(original.get(lk) || lk), s.slice(0, 500)]);
  }
  rest.sort((a, b) => a[0].localeCompare(b[0]));
  for (const [lab, v] of rest.slice(0, 25)) if (!other[lab]) other[lab] = v;

  const contactId = pick(lookup, "contact_id", "contactId", "id");
  if (contactId) other["GHL contact"] = contactId;

  const notes = [
    `Lead from ${source}.`,
    submitted ? `Submitted ${submitted}.` : "",
    consentKeys.length ? `Consent: ${consentKeys.map((k) => `${label(original.get(k) || k)} = ${str(lookup.get(k))}`).join("; ")}.` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return {
    payload: {
      name: full || email || phone || "Website lead",
      display_name: displayName || full || "Lead",
      email,
      phone,
      source,
      notes,
      other_fields: other,
    },
    diagnostics: {
      keysReceived: [...lookup.keys()],
      hadName: Boolean(full),
      hadEmail: Boolean(email),
      phoneRaw: Boolean(phoneRaw),
      phoneNormalised: phone !== "" && /^\+[1-9]\d{6,15}$/.test(phone),
      otherFieldCount: Object.keys(other).length,
    },
  };
}

