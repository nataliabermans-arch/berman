// Sends confirmed bookings to Privyr, the practice's mobile CRM.
//
// Privyr's incoming-leads webhook accepts only four structured fields — name,
// email, phone, display_name — plus an `other_fields` dictionary that it
// renders into the lead's notes. There is no appointment or calendar
// primitive on this endpoint; a real dated meeting needs the token-auth
// timeline-items API, which this account does not have.
//
// So the appointment time is put into the NAME. It reads slightly oddly as a
// name, but it is the only field visible in Privyr's lead list, and staff
// seeing "Thu 10 Sep 11:00am" without opening the record is worth more than
// tidiness.
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
};

function url(): string {
  return (process.env.PRIVYR_WEBHOOK_URL || "").trim();
}

export function isPrivyrConfigured(): boolean {
  return url().startsWith("https://");
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

  // Insertion order is preserved, so this is the order staff read.
  const other: Record<string, string> = {
    Date: fullDate,
    Time: to ? `${from} - ${to} Pacific Time` : `${from} Pacific Time`,
    Consult: "15 minutes, by phone - a coordinator calls the patient",
  };
  if (b.reasonLabels?.length) other["Interested in"] = b.reasonLabels.join(", ");
  if (b.rescheduleUrl) other["Reschedule (send to patient)"] = b.rescheduleUrl;
  if (b.cancelUrl) other["Cancel (send to patient)"] = b.cancelUrl;
  other["Doctor's calendar"] = "https://calendly.com/app/scheduled_events/user/me";
  other["Reference"] = b.consultId;
  other["Booked via"] = "bermansexualhealth.com";

  // A readable block for the notes field. `notes` and `source` are absent from
  // Privyr's published spec but are accepted and render correctly — confirmed
  // against a live lead. URLs are written bare because notes is plain text, so
  // the full URL is both the label and what stays tappable on a phone.
  const notes = [
    `APPOINTMENT: ${fullDate}`,
    `${from} - ${to} Pacific Time`,
    "15-minute phone consult - a coordinator calls the patient.",
    "",
    b.reasonLabels?.length ? `Interested in: ${b.reasonLabels.join(", ")}` : "",
    b.reasonLabels?.length ? "" : "",
    "TO RESCHEDULE (send to patient):",
    b.rescheduleUrl || "-",
    "",
    "TO CANCEL (send to patient):",
    b.cancelUrl || "-",
    "",
    `Reference ${b.consultId} - booked at bermansexualhealth.com`,
  ]
    .filter((line, i, arr) => !(line === "" && arr[i - 1] === ""))
    .join("\n")
    .trim();

  return {
    // The time rides in the name so it shows in the lead list.
    name: `${patient} - ${shortWhen}`,
    display_name: b.firstName,
    email: b.email,
    phone: b.phone,
    source: "Berman website - online booking",
    notes,
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
