// Sends confirmed bookings to Privyr, the practice's mobile CRM.
//
// Privyr renders a lead as ONE flat "Lead Source Details" list. The keys of
// `other_fields` are flattened into the same list as the top-level `notes` and
// `source`, each shown as a bold "Key: value" line — verified against a live
// lead. So there is no nesting to design around: every line competes for the
// same space, and duplicating a value costs a line and buys nothing.
//
// That rules out the long notes block this used to send, which repeated
// everything `other_fields` already carried. `notes` is now one human sentence,
// and the structured detail lives in `other_fields` in reading order — the list
// is truncated with "View full info" on the lead screen, so the appointment
// itself goes first.
//
// `notes` and `source` are absent from Privyr's published spec but are accepted
// and render correctly.
//
// The appointment time also rides in the NAME, because the name is the only
// field visible in Privyr's lead LIST. It reads slightly oddly as a name, but
// staff seeing "Thu, Sep 10, 2:30 PM" without opening the record is worth more
// than tidiness.
//
// This must never affect the patient's booking: Privyr is an alerting layer,
// and the appointment is already safe in Calendly and GHL by the time we get
// here.

const PRACTICE_TZ = "America/Los_Angeles";
const PRIVYR_TIMEOUT_MS = 8_000;

export type PrivyrBooking = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  startTime: string;
  endTime?: string;
  consultId: string;
  /** Mapped reason labels — NOT the patient's free-text note. */
  reasonLabels?: string[];
  rescheduleUrl?: string;
  cancelUrl?: string;
  /** The consult happens here. Safe to send the patient. */
  zoomJoinUrl?: string;
};

function url(): string {
  return (process.env.PRIVYR_WEBHOOK_URL || "").trim();
}

export function isPrivyrConfigured(): boolean {
  return url().startsWith("https://");
}

/**
 * Privyr stores the phone only when it arrives in E.164. It accepts anything at
 * the HTTP level — every format returns {"success":true} — and then silently
 * drops what it cannot parse, which is why real bookings landed with a name and
 * an email and no way to call the patient back. Calendly and GHL both keep the
 * raw string, so the number was never lost, just missing where the practice
 * actually looks.
 *
 * Deliberately NOT applied to the GHL write: GHL upserts on phone, so changing
 * the format of a number already on file would create a duplicate contact.
 */
export function toE164(raw: string): string {
  const trimmed = raw.trim();

  if (trimmed.startsWith("+")) {
    const digits = trimmed.slice(1).replace(/D/g, "");
    return digits ? `+${digits}` : trimmed;
  }

  const digits = trimmed.replace(/D/g, "");

  // 00 is the international access prefix across most of the world.
  if (digits.startsWith("00") && digits.length > 10) return `+${digits.slice(2)}`;
  // A bare 10-digit number is US/Canada without its country code — by far the
  // most common thing a patient types, and the case that was breaking.
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  // Longer than a US number and typed without a +: assume they omitted it.
  if (digits.length > 11) return `+${digits}`;

  // Shorter than any bookable number. The route already rejects fewer than 10
  // digits, so this is unreachable in practice — send it through untouched
  // rather than inventing a country code.
  return trimmed;
}

function fmt(iso: string, opts: Intl.DateTimeFormatOptions): string {
  return new Date(iso).toLocaleString("en-US", { timeZone: PRACTICE_TZ, ...opts });
}

export function buildPrivyrPayload(b: PrivyrBooking) {
  const shortWhen = `${fmt(b.startTime, {
    weekday: "short",
    month: "short",
    day: "numeric",
  })}, ${fmt(b.startTime, { hour: "numeric", minute: "2-digit" })}`;

  const fullDate = fmt(b.startTime, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const from = fmt(b.startTime, { hour: "numeric", minute: "2-digit" });
  // Calendly's booking response does not carry the end time, and a range reads
  // far better than a bare start. The event type is 15 minutes.
  const endIso =
    b.endTime || new Date(new Date(b.startTime).getTime() + 15 * 60_000).toISOString();
  const to = fmt(endIso, { hour: "numeric", minute: "2-digit" });

  const patient = `${b.firstName} ${b.lastName}`.trim();

  // Insertion order is the order staff read, and the list truncates — so the
  // appointment leads and the bookkeeping trails.
  const other: Record<string, string> = {
    Appointment: fullDate,
    Time: `${from} - ${to} Pacific Time`,
    Consult: "15 minutes by Zoom video",
  };
  // Directly under the time, because it is the thing staff reach for.
  if (b.zoomJoinUrl) other["Join the Zoom consult"] = b.zoomJoinUrl;
  if (b.reasonLabels?.length) other["Interested in"] = b.reasonLabels.join(", ");
  if (b.rescheduleUrl) other["Reschedule (send to patient)"] = b.rescheduleUrl;
  if (b.cancelUrl) other["Cancel (send to patient)"] = b.cancelUrl;
  other["Doctor's calendar"] = "https://calendly.com/app/scheduled_events/user/me";
  other["Reference"] = b.consultId;
  other["Booked via"] = "bermansexualhealth.com";

  return {
    // The time rides in the name so it shows in the lead list.
    name: `${patient} - ${shortWhen}`,
    display_name: b.firstName,
    email: b.email,
    phone: toE164(b.phone),
    source: "Berman website - online booking",
    // One sentence. Everything structured is in other_fields, on its own line.
    notes: b.zoomJoinUrl
      ? `15-minute Zoom consult on ${fullDate} at ${from} Pacific. Join: ${b.zoomJoinUrl}`
      : `15-minute consult on ${fullDate} at ${from} Pacific.`,
    other_fields: other,
  };
}

/**
 * Fire-and-forget. Returns whether it landed, and never throws: a CRM alerting
 * failure must not turn a confirmed appointment into an error for the patient.
 */
export async function sendBookingToPrivyr(b: PrivyrBooking): Promise<boolean> {
  if (!isPrivyrConfigured()) return false;
  try {
    const res = await fetch(url(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildPrivyrPayload(b)),
      signal: AbortSignal.timeout(PRIVYR_TIMEOUT_MS),
      cache: "no-store",
    });
    const body = (await res.json().catch(() => null)) as { success?: boolean } | null;
    const ok = res.ok && body?.success !== false;
    if (!ok) console.warn("[privyr-send-failed]", { status: res.status });
    return ok;
  } catch (err) {
    console.warn("[privyr-send-error]", {
      reason: err instanceof Error ? err.message : "unknown",
    });
    return false;
  }
}
