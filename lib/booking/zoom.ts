// Creates the Zoom meeting that a booked consult happens on.
//
// Server-to-Server OAuth, not a webhook app: a webhook-only Zoom app has no API
// credentials and cannot create anything. Credentials come from the Zoom
// Marketplace app's "App Credentials" tab and need meeting:write:admin.
//
// The ordering rule this module exists inside: Calendly is booked FIRST, then
// the Zoom meeting is created. The slot is the scarce resource — two patients
// can want the same 11:00 and only one can have it — so it gets claimed before
// anything slower happens. The consequence is that Zoom can fail on a booking
// that is already confirmed, which is why nothing here throws at the caller.
// A consult with no link is recoverable in a way that a double-booked slot is
// not: the practice sends a link by hand, and the failure is tagged in the CRM
// so somebody knows to.

const ZOOM_OAUTH_URL = "https://zoom.us/oauth/token";
const ZOOM_API_BASE = "https://api.zoom.us/v2";
const ZOOM_TIMEOUT_MS = 10_000;
// Refresh a minute early. Zoom tokens last an hour, and a token that expires
// mid-request costs a booking its link for no reason.
const TOKEN_MARGIN_MS = 60_000;

export type ZoomMeeting = {
  meetingId: string;
  joinUrl: string;
  /** Host link. Never send this to a patient — it starts the meeting as host. */
  startUrl: string;
  password?: string;
};

export type CreateZoomInput = {
  startTime: string;
  durationMinutes: number;
  /** Shown in the host's Zoom client and in the calendar entry. */
  topic: string;
  timezone: string;
  consultId: string;
};

function accountId(): string {
  return (process.env.ZOOM_ACCOUNT_ID || "").trim();
}

function clientId(): string {
  return (process.env.ZOOM_CLIENT_ID || "").trim();
}

function clientSecret(): string {
  return (process.env.ZOOM_CLIENT_SECRET || "").trim();
}

/** Whose calendar the meeting is created on. "me" is the app owner. */
function hostUser(): string {
  return (process.env.ZOOM_HOST_USER || "me").trim();
}

export function isZoomConfigured(): boolean {
  return Boolean(accountId() && clientId() && clientSecret());
}

// ---------------------------------------------------------------------------
// Token
// ---------------------------------------------------------------------------

// Module scope, so this is per serverless instance rather than global. That is
// fine: a cold instance costs one extra token call, and Zoom's rate limit is
// nowhere near a booking's volume.
let cachedToken: { token: string; expiresAt: number } | null = null;

async function accessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - TOKEN_MARGIN_MS) {
    return cachedToken.token;
  }

  const basic = Buffer.from(`${clientId()}:${clientSecret()}`).toString("base64");
  const url =
    `${ZOOM_OAUTH_URL}?grant_type=account_credentials` +
    `&account_id=${encodeURIComponent(accountId())}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(ZOOM_TIMEOUT_MS),
  });

  if (!res.ok) {
    // Never log the body: it echoes credentials on some Zoom error paths.
    throw new Error(`Zoom token request failed: ${res.status}`);
  }

  const body = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!body.access_token) throw new Error("Zoom token response had no access_token");

  cachedToken = {
    token: body.access_token,
    expiresAt: Date.now() + (body.expires_in ?? 3600) * 1000,
  };
  return cachedToken.token;
}

/** Drops the cached token so the next call re-authenticates. */
function invalidateToken(): void {
  cachedToken = null;
}

// ---------------------------------------------------------------------------
// Meetings
// ---------------------------------------------------------------------------

/**
 * Zoom wants second precision. Calendly hands back microseconds
 * ("2026-09-24T18:00:00.000000Z"), which Zoom rejects.
 */
function toZoomTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) throw new Error(`Invalid start time: ${iso}`);
  return `${d.toISOString().slice(0, 19)}Z`;
}

async function zoomFetch(
  path: string,
  init: RequestInit,
  retryOn401 = true,
): Promise<Response> {
  const token = await accessToken();
  const res = await fetch(`${ZOOM_API_BASE}${path}`, {
    ...init,
    headers: {
      ...(init.headers || {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(ZOOM_TIMEOUT_MS),
  });

  // A cached token can be revoked out from under us — the app's secret gets
  // rotated in the Marketplace and every instance still holds a dead token.
  if (res.status === 401 && retryOn401) {
    invalidateToken();
    return zoomFetch(path, init, false);
  }
  return res;
}

/**
 * Creates the meeting. Returns null rather than throwing: the booking that
 * called this is already confirmed in Calendly, and no Zoom failure may turn a
 * held appointment into an error the patient sees.
 */
export async function createZoomMeeting(
  input: CreateZoomInput,
): Promise<ZoomMeeting | null> {
  if (!isZoomConfigured()) return null;

  try {
    const res = await zoomFetch(`/users/${encodeURIComponent(hostUser())}/meetings`, {
      method: "POST",
      body: JSON.stringify({
        topic: input.topic,
        type: 2, // scheduled
        start_time: toZoomTime(input.startTime),
        duration: input.durationMinutes,
        timezone: input.timezone,
        // The consult id is the thread back to Calendly, GHL and Privyr. It is
        // deliberately the only identifier here — no patient name, no reason
        // for visit. A Zoom agenda is visible to anyone the meeting is shared
        // with and is not somewhere clinical detail belongs.
        agenda: `Ref ${input.consultId}`,
        settings: {
          // The patient waits until the practice admits them. Without this,
          // whoever holds the link walks into the previous patient's consult.
          waiting_room: true,
          join_before_host: false,
          // No registration, and no Zoom account required — a patient who has
          // to sign up to attend does not attend.
          approval_type: 2,
          meeting_authentication: false,
          // Never record a medical consult by default.
          auto_recording: "none",
          audio: "both",
          host_video: true,
          participant_video: false,
        },
      }),
    });

    if (!res.ok) {
      console.warn("[zoom-create-failed]", {
        status: res.status,
        consultId: input.consultId,
      });
      return null;
    }

    const body = (await res.json()) as {
      id?: number | string;
      join_url?: string;
      start_url?: string;
      password?: string;
    };

    if (!body.id || !body.join_url) {
      console.warn("[zoom-create-incomplete]", { consultId: input.consultId });
      return null;
    }

    return {
      meetingId: String(body.id),
      joinUrl: body.join_url,
      startUrl: body.start_url || "",
      password: body.password,
    };
  } catch (err) {
    console.warn("[zoom-create-error]", {
      consultId: input.consultId,
      reason: err instanceof Error ? err.message : "unknown",
    });
    return null;
  }
}

/**
 * Moves an existing meeting, for when a patient reschedules. Returns whether it
 * landed; the caller decides whether a stale time is worth alerting on.
 */
export async function updateZoomMeeting(
  meetingId: string,
  startTime: string,
  timezone: string,
): Promise<boolean> {
  if (!isZoomConfigured() || !meetingId) return false;

  try {
    const res = await zoomFetch(`/meetings/${encodeURIComponent(meetingId)}`, {
      method: "PATCH",
      body: JSON.stringify({ start_time: toZoomTime(startTime), timezone }),
    });
    // 204 on success. 404 means it is already gone, which for a reschedule is
    // a real failure — there is nothing left to move.
    if (!res.ok) console.warn("[zoom-update-failed]", { status: res.status, meetingId });
    return res.ok;
  } catch (err) {
    console.warn("[zoom-update-error]", {
      meetingId,
      reason: err instanceof Error ? err.message : "unknown",
    });
    return false;
  }
}

/**
 * Extracts the numeric meeting id from a join URL, which is the only handle
 * the Calendly-managed path gives us.
 */
export function meetingIdFromJoinUrl(url: string | null | undefined): string | null {
  const m = String(url || "").match(/zoom\.us\/[js]\/(\d{9,12})/);
  return m ? m[1] : null;
}

/**
 * Strips patient identity off a meeting Calendly created.
 *
 * Calendly titles its meetings "{invitee name}: {event type}", which puts a
 * patient's name — attached to a sexual-health practice — on the Zoom
 * account's meeting list, in every participant's client during the call, and
 * in anything the meeting is ever shared with. Zoom is the one system in this
 * chain that does not need to know who the patient is: the doctor has the
 * name in Calendly, the CRM and her calendar. So the topic becomes the consult
 * reference, and the agenda (where Calendly copies event details) is cleared.
 *
 * Renaming does not touch the join URL, the passcode, the time, or the
 * calendar entry Calendly issued — those live elsewhere. Best-effort: a
 * booking must never fail because a rename did.
 */
export async function maskZoomMeetingIdentity(
  meetingId: string,
  consultId?: string,
): Promise<boolean> {
  if (!isZoomConfigured() || !meetingId) return false;
  try {
    const res = await zoomFetch(`/meetings/${encodeURIComponent(meetingId)}`, {
      method: "PATCH",
      body: JSON.stringify({
        topic: consultId ? `Consult ${consultId}` : "15 min video consult",
        agenda: "",
      }),
    });
    if (!res.ok) console.warn("[zoom-mask-failed]", { status: res.status, meetingId });
    return res.ok;
  } catch (err) {
    console.warn("[zoom-mask-error]", {
      meetingId,
      reason: err instanceof Error ? err.message : "unknown",
    });
    return false;
  }
}

/**
 * Deletes a meeting whose consult was cancelled, so the practice's Zoom account
 * does not silently fill with meetings nobody is attending.
 */
export async function deleteZoomMeeting(meetingId: string): Promise<boolean> {
  if (!isZoomConfigured() || !meetingId) return false;

  try {
    const res = await zoomFetch(`/meetings/${encodeURIComponent(meetingId)}`, {
      method: "DELETE",
    });
    // 404 means someone already removed it. That is the desired end state, so
    // treat it as success rather than retrying forever.
    if (res.status === 404) return true;
    if (!res.ok) console.warn("[zoom-delete-failed]", { status: res.status, meetingId });
    return res.ok;
  } catch (err) {
    console.warn("[zoom-delete-error]", {
      meetingId,
      reason: err instanceof Error ? err.message : "unknown",
    });
    return false;
  }
}

/**
 * Proves the credentials work without creating anything — used by the health
 * endpoint, so a rotated secret is visible before a patient finds it.
 */
export async function checkZoomCredentials(): Promise<
  { ok: true; host: string } | { ok: false; reason: string }
> {
  if (!isZoomConfigured()) {
    return { ok: false, reason: "ZOOM_ACCOUNT_ID / ZOOM_CLIENT_ID / ZOOM_CLIENT_SECRET missing" };
  }
  try {
    const res = await zoomFetch(`/users/${encodeURIComponent(hostUser())}`, {
      method: "GET",
    });
    if (!res.ok) {
      return {
        ok: false,
        reason:
          res.status === 401
            ? "credentials rejected — check the Client ID/Secret and that the app is activated"
            : res.status === 404
              ? `host user "${hostUser()}" not found on this Zoom account`
              : `Zoom returned ${res.status}`,
      };
    }
    const body = (await res.json()) as { email?: string; id?: string };
    return { ok: true, host: body.email || body.id || hostUser() };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : "unknown" };
  }
}
