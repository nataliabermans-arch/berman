// Minimal GoHighLevel helpers for keeping the CRM in step with Calendly.
//
// The main lead delivery lives in lib/leads/delivery.ts and is left alone.
// This is only what the webhook needs.

const GHL_BASE_URL = "https://services.leadconnectorhq.com";

// Every outbound call needs a deadline: without one a slow dependency
// consumes the whole serverless invocation before the booking is attempted.
const GHL_TIMEOUT_MS = 10_000;
const GHL_API_VERSION = "2021-07-28";

function envValue(...names: string[]): string {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) return value;
  }
  return "";
}

function config() {
  return {
    token: envValue("GHL_BERMAN_API_TOKEN", "BERMAN_GHL_API_TOKEN"),
    locationId: envValue("GHL_BERMAN_LOCATION_ID", "BERMAN_GHL_LOCATION_ID"),
  };
}

export function isGhlConfigured(): boolean {
  const { token, locationId } = config();
  return token.length > 20 && locationId.length > 10;
}

function headers(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    Version: GHL_API_VERSION,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

export async function findContactIdByEmail(
  email: string,
): Promise<string | null> {
  const { token, locationId } = config();
  if (!token || !locationId) return null;

  try {
    const res = await fetch(`${GHL_BASE_URL}/contacts/search`, {
      signal: AbortSignal.timeout(GHL_TIMEOUT_MS),
      method: "POST",
      headers: headers(token),
      body: JSON.stringify({
        locationId,
        pageLimit: 5,
        filters: [{ field: "email", operator: "eq", value: email }],
      }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { contacts?: Array<{ id?: string }> };
    return body.contacts?.[0]?.id || null;
  } catch {
    return null;
  }
}

/** The mutually exclusive lifecycle states a booking can be in. */
export const BOOKING_STATUS_TAGS = [
  "booking-confirmed",
  "booking-failed",
  "booking-unconfirmed",
  "booking-canceled",
] as const;

export type BookingStatusTag = (typeof BOOKING_STATUS_TAGS)[number];

async function removeContactTags(
  contactId: string,
  tags: string[],
): Promise<void> {
  const { token } = config();
  if (!token || !contactId || tags.length === 0) return;
  try {
    await fetch(`${GHL_BASE_URL}/contacts/${contactId}/tags`, {
      signal: AbortSignal.timeout(GHL_TIMEOUT_MS),
      method: "DELETE",
      headers: headers(token),
      body: JSON.stringify({ tags }),
      cache: "no-store",
    });
  } catch {
    // Best effort. A stale tag is untidy; a failed booking is not.
  }
}

/**
 * Set the booking's status as a mutually exclusive tag.
 *
 * GHL's tag endpoint only ADDS, so writing statuses directly left contacts
 * carrying `booking-confirmed` and `booking-failed` and `booking-canceled` at
 * once — staff had no way to read the current state. This clears the other
 * three first.
 */
export async function setBookingStatus(
  contactId: string,
  status: BookingStatusTag,
): Promise<boolean> {
  const stale = BOOKING_STATUS_TAGS.filter((t) => t !== status);
  await removeContactTags(contactId, stale);
  return addContactTags(contactId, [status]);
}

/**
 * Adding a tag is idempotent, which matters: Calendly retries webhook
 * deliveries for 24 hours and sends no delivery id to dedupe on.
 */
export async function addContactTags(
  contactId: string,
  tags: string[],
): Promise<boolean> {
  const { token } = config();
  if (!token || !contactId || tags.length === 0) return false;

  try {
    const res = await fetch(`${GHL_BASE_URL}/contacts/${contactId}/tags`, {
      signal: AbortSignal.timeout(GHL_TIMEOUT_MS),
      method: "POST",
      headers: headers(token),
      body: JSON.stringify({ tags }),
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}
