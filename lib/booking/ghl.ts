// Minimal GoHighLevel helpers for keeping the CRM in step with Calendly.
//
// The main lead delivery lives in lib/leads/delivery.ts and is left alone.
// This is only what the webhook needs.

const GHL_BASE_URL = "https://services.leadconnectorhq.com";
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
