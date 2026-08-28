// Server-only Calendly client for native in-page booking.
//
// Every quirk encoded here was confirmed against the live account on
// 2026-08-28, not inferred from docs. See
// docs/superpowers/specs/2026-08-28-booking-integration-design.md §2.0.
//
// This module must never be imported from a client component: it reads the
// Calendly token.

const CALENDLY_BASE_URL = "https://api.calendly.com";

// Verified live: the account has exactly one event type, 15 minutes, whose
// slug is the stale string "30-min-session".
const DEFAULT_EVENT_TYPE_URI =
  "https://api.calendly.com/event_types/af8b9d05-5d98-43e0-98c9-6a348e27f587";

// Calendly rejects an availability window wider than 31 days.
const MAX_WINDOW_DAYS = 31;

// Without an explicit timeout a hung connection consumes the whole serverless
// invocation, so the booking request dies before the timeout-recovery path it
// exists for can run. Kept well inside the platform limit.
const CALENDLY_TIMEOUT_MS = 10_000;

export type AvailableSlot = {
  startTime: string;
  invitees_remaining: number;
};

export type BookingLocation = {
  kind: string;
  location?: string;
};

export type CalendlyBookingInput = {
  startTime: string;
  name: string;
  email: string;
  timezone: string;
  phone: string;
  reasons: string[];
  note?: string;
  consultId: string;
  utm?: Partial<Record<"campaign" | "source" | "medium" | "term", string>>;
};

export type CalendlyBookingResult =
  | { ok: true; eventUri: string; inviteeUri: string; startTime: string }
  | { ok: false; code: "slot_taken" | "invalid" | "auth" | "transient"; message: string };

function envValue(...names: string[]): string {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) return value;
  }
  return "";
}

function token(): string {
  return envValue("CALENDLY_API_TOKEN", "CALENDLY_PERSONAL_ACCESS_TOKEN");
}

export function eventTypeUri(): string {
  return envValue("CALENDLY_EVENT_TYPE_URI") || DEFAULT_EVENT_TYPE_URI;
}

export function isCalendlyConfigured(): boolean {
  return token().length > 20;
}

function headers(): Record<string, string> {
  return {
    Authorization: `Bearer ${token()}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

// Calendly wants microsecond-precision UTC.
function toCalendlyTime(date: Date): string {
  return date.toISOString().replace(/\.\d{3}Z$/, ".000000Z");
}

// ---------------------------------------------------------------------------
// Event type metadata
//
// Question strings must match custom_questions[].name byte-for-byte and are
// editable in the Calendly UI, so they are read at runtime rather than
// hardcoded. Cached briefly to keep this off the hot path.
// ---------------------------------------------------------------------------

type EventTypeMeta = {
  questions: Array<{
    name: string;
    type: string;
    position: number;
    required: boolean;
    answerChoices: string[];
  }>;
  locations: BookingLocation[];
};

let metaCache: { value: EventTypeMeta; expiresAt: number } | null = null;
const META_TTL_MS = 5 * 60_000;

export async function getEventTypeMeta(): Promise<EventTypeMeta> {
  if (metaCache && metaCache.expiresAt > Date.now()) return metaCache.value;

  const res = await fetch(eventTypeUri(), {
    headers: headers(),
    cache: "no-store", signal: AbortSignal.timeout(CALENDLY_TIMEOUT_MS),
  });
  if (!res.ok) {
    throw new Error(`Calendly event type lookup failed: ${res.status}`);
  }
  const body = (await res.json()) as {
    resource?: {
      custom_questions?: Array<{
        name?: string;
        type?: string;
        position?: number;
        required?: boolean;
        answer_choices?: string[];
      }>;
      locations?: BookingLocation[];
    };
  };

  const value: EventTypeMeta = {
    questions: (body.resource?.custom_questions || []).map((q) => ({
      name: q.name || "",
      type: q.type || "",
      position: typeof q.position === "number" ? q.position : 0,
      required: Boolean(q.required),
      answerChoices: q.answer_choices || [],
    })),
    locations: body.resource?.locations || [],
  };

  metaCache = { value, expiresAt: Date.now() + META_TTL_MS };
  return value;
}

// ---------------------------------------------------------------------------
// Availability
// ---------------------------------------------------------------------------

export async function listAvailableSlots(days = 14): Promise<AvailableSlot[]> {
  const span = Math.min(days, MAX_WINDOW_DAYS);
  // start_time may not be in the past; a small cushion avoids a race with
  // Calendly's own clock.
  const start = new Date(Date.now() + 60 * 60_000);
  const end = new Date(start.getTime() + span * 86_400_000);

  const url =
    `${CALENDLY_BASE_URL}/event_type_available_times` +
    `?event_type=${encodeURIComponent(eventTypeUri())}` +
    `&start_time=${toCalendlyTime(start)}` +
    `&end_time=${toCalendlyTime(end)}`;

  const res = await fetch(url, { headers: headers(), cache: "no-store", signal: AbortSignal.timeout(CALENDLY_TIMEOUT_MS) });
  if (!res.ok) {
    throw new Error(`Calendly availability failed: ${res.status}`);
  }

  const body = (await res.json()) as {
    collection?: Array<{
      status?: string;
      start_time?: string;
      invitees_remaining?: number;
    }>;
  };

  return (body.collection || [])
    .filter((s) => s.status === "available" && s.start_time)
    .map((s) => ({
      // Returned verbatim. The booking call must send this string back
      // byte-for-byte; a locally reconstructed timestamp is rejected.
      startTime: s.start_time as string,
      invitees_remaining: s.invitees_remaining ?? 1,
    }));
}

// ---------------------------------------------------------------------------
// Timeout recovery
//
// Calendly has no idempotency key and no 409 on POST /invitees, so a request
// that times out leaves us genuinely unsure whether the booking landed. Blindly
// retrying could double-book a patient. Instead we ask Calendly what actually
// happened, and adopt the booking if it exists.
// ---------------------------------------------------------------------------

let userUriCache: { value: string; expiresAt: number } | null = null;

async function currentUserUri(): Promise<string> {
  const configured = envValue("CALENDLY_USER_URI");
  if (configured) return configured;
  if (userUriCache && userUriCache.expiresAt > Date.now()) {
    return userUriCache.value;
  }
  const res = await fetch(`${CALENDLY_BASE_URL}/users/me`, {
    headers: headers(),
    cache: "no-store", signal: AbortSignal.timeout(CALENDLY_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Calendly /users/me failed: ${res.status}`);
  const uri = ((await res.json()) as { resource?: { uri?: string } }).resource
    ?.uri;
  if (!uri) throw new Error("Calendly /users/me returned no uri");
  userUriCache = { value: uri, expiresAt: Date.now() + 60 * 60_000 };
  return uri;
}

/**
 * Did a booking for this invitee at this exact time actually land?
 * Returns the event URI if so. Used only on the ambiguous path — never to
 * "verify" a response that already returned 201.
 */
export async function findExistingBooking(
  email: string,
  startTime: string,
): Promise<string | null> {
  try {
    const user = await currentUserUri();
    // A one-minute window either side of the slot: start times are exact, but
    // the filter is a range.
    const start = new Date(startTime);
    const min = new Date(start.getTime() - 60_000);
    const max = new Date(start.getTime() + 60_000);

    const url =
      `${CALENDLY_BASE_URL}/scheduled_events` +
      `?user=${encodeURIComponent(user)}` +
      `&invitee_email=${encodeURIComponent(email)}` +
      `&min_start_time=${toCalendlyTime(min)}` +
      `&max_start_time=${toCalendlyTime(max)}` +
      `&status=active`;

    const res = await fetch(url, { headers: headers(), cache: "no-store", signal: AbortSignal.timeout(CALENDLY_TIMEOUT_MS) });
    if (!res.ok) return null;

    const body = (await res.json()) as {
      collection?: Array<{ uri?: string; start_time?: string }>;
    };
    // Match the exact slot only. An `|| e.uri` fallback here would make ANY
    // returned event a match, so a patient with an unrelated upcoming
    // appointment inside the query window would have it adopted as if it were
    // this booking — reporting success for a consult that was never made.
    // Compare as instants, since the two sources may format the same moment
    // differently ("...Z" vs "...000000Z").
    const wanted = new Date(startTime).getTime();
    const hit = (body.collection || []).find((e) => {
      if (!e.uri || !e.start_time) return false;
      const got = new Date(e.start_time).getTime();
      return Number.isFinite(got) && got === wanted;
    });
    return hit?.uri || null;
  } catch {
    // If we cannot establish the truth, say so rather than guessing. The
    // caller must not retry on an unknown.
    return null;
  }
}

// ---------------------------------------------------------------------------
// Reason mapping
//
// The site's reason list and Calendly's required multi-select do not match.
// Candidates are tried in order against the live choice list, so this works
// both before and after the choices are aligned by hand in the Calendly UI.
// ---------------------------------------------------------------------------

const REASON_CANDIDATES: Record<string, string[]> = {
  "menopause-hormones": ["Hormone Replacement Therapy", "Hormones"],
  "sexual-health": ["Sexual health", "Sexual & Urinary Tract Health"],
  "pelvic-urinary": [
    "Pelvic Floor and Urinary Tract Health",
    "Sexual & Urinary Tract Health",
  ],
  "vaginal-rejuvenation": ["Vaginal rejuvenation", "Vaginal Rejuvenation"],
  "aesthetic-regenerative": [
    "Aesthetic and Regenerative Care",
    "Anti-Aging Treatments",
  ],
  "body-contouring": [
    "Body Sculpting, Fat Melting, Cellulite Treatment",
    "Skin Tight",
  ],
  "menopause-perimenopause": [
    "Menopause and Perimenopause Care",
    "Menopause & Perimenopause",
  ],
  "berman-supplements": ["Supplement and Peptide", "Hormones"],
  "not-sure": ["I am not sure yet"],
};

export function mapReasonsToChoices(
  reasons: string[],
  available: string[],
): { choice: string; unmapped: string[]; usedFallback: boolean } {
  const matched: string[] = [];
  const unmapped: string[] = [];

  for (const reason of reasons) {
    const match = (REASON_CANDIDATES[reason] || []).find((c) =>
      available.includes(c),
    );
    if (match) {
      if (!matched.includes(match)) matched.push(match);
    } else {
      unmapped.push(reason);
    }
  }

  // A single value, never a joined list. Calendly does not document a
  // separator for multi-select answers, and one live choice — "Body Sculpting,
  // Fat Melting, Cellulite Treatment" — contains commas, so a comma-joined
  // answer is ambiguous by construction. The complete set of reasons is
  // written into the free-text question instead, where it is unambiguous.
  if (matched.length > 0) {
    return { choice: matched[0], unmapped, usedFallback: false };
  }

  // Nothing mapped. The question is required, so something must be sent — but
  // inventing a clinical interest the patient never chose would be worse than
  // saying nothing. Prefer an explicitly non-committal option if the account
  // has one.
  const neutral = available.find((c) => /not sure|other|general/i.test(c));
  if (neutral) {
    return { choice: neutral, unmapped, usedFallback: false };
  }

  return {
    choice: available[0] || "",
    unmapped,
    // Signals to the caller that the answer does NOT reflect what the patient
    // selected, so the real reasons must be carried elsewhere.
    usedFallback: true,
  };
}

// ---------------------------------------------------------------------------
// Booking
// ---------------------------------------------------------------------------

export async function createBooking(
  input: CalendlyBookingInput,
): Promise<CalendlyBookingResult> {
  let meta: EventTypeMeta;
  try {
    meta = await getEventTypeMeta();
  } catch (err) {
    return {
      ok: false,
      code: "transient",
      message: err instanceof Error ? err.message : "event type lookup failed",
    };
  }

  const phoneQuestion = meta.questions.find((q) => q.type === "phone_number");
  const selectQuestion = meta.questions.find(
    (q) => q.type === "multi_select" || q.type === "single_select",
  );
  const textQuestion = meta.questions.find((q) => q.type === "text");

  const questions: Array<{ question: string; answer: string; position: number }> =
    [];

  if (phoneQuestion) {
    questions.push({
      question: phoneQuestion.name,
      answer: input.phone,
      position: phoneQuestion.position,
    });
  }

  // Whatever the select question cannot express is carried in the free-text
  // answer, so the doctor always sees what the patient actually chose.
  const freeTextParts: string[] = [];

  if (selectQuestion) {
    const { choice, unmapped, usedFallback } = mapReasonsToChoices(
      input.reasons,
      selectQuestion.answerChoices,
    );
    if (unmapped.length || usedFallback) {
      console.warn("[booking-reason-unmapped]", {
        consultId: input.consultId,
        unmapped,
        usedFallback,
      });
    }
    // The select carries one choice; the full set goes into free text below.
    if (input.reasons.length > 1 || unmapped.length || usedFallback) {
      freeTextParts.push(`Selected: ${input.reasons.join(", ")}`);
    }
    if (usedFallback) {
      freeTextParts.push(
        "(none of the Calendly options match what was selected — see above)",
      );
    }
    questions.push({
      question: selectQuestion.name,
      answer: choice,
      position: selectQuestion.position,
    });
  }

  if (input.note?.trim()) freeTextParts.push(input.note.trim());

  if (textQuestion && freeTextParts.length) {
    questions.push({
      question: textQuestion.name,
      answer: freeTextParts.join(" — ").slice(0, 1000),
      position: textQuestion.position,
    });
  }

  // `location` is mandatory in practice even though the schema omits it from
  // `required`, and its kind must match one configured on the event type.
  const configured = meta.locations[0];
  const location: BookingLocation | undefined = configured
    ? { kind: configured.kind, ...(configured.location ? { location: configured.location } : {}) }
    : undefined;

  const body = {
    event_type: eventTypeUri(),
    start_time: input.startTime,
    invitee: {
      email: input.email,
      timezone: input.timezone,
      name: input.name,
    },
    ...(location ? { location } : {}),
    questions_and_answers: questions,
    // All six keys must be present or the request is rejected outright.
    tracking: {
      utm_campaign: input.utm?.campaign ?? null,
      utm_source: input.utm?.source ?? null,
      utm_medium: input.utm?.medium ?? null,
      utm_content: null,
      utm_term: input.utm?.term ?? null,
      // Verified to round-trip, and returned on the invitee webhook.
      salesforce_uuid: input.consultId,
    },
  };

  let res: Response;
  try {
    res = await fetch(`${CALENDLY_BASE_URL}/invitees`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(body),
      cache: "no-store", signal: AbortSignal.timeout(CALENDLY_TIMEOUT_MS),
    });
  } catch (err) {
    // Calendly has no idempotency key, so a blind retry here could double-book.
    // Surface it and let the caller reconcile.
    return {
      ok: false,
      code: "transient",
      message: err instanceof Error ? err.message : "network error",
    };
  }

  if (res.status === 201) {
    const out = (await res.json().catch(() => null)) as {
      resource?: { uri?: string; event?: string };
    } | null;
    return {
      ok: true,
      eventUri: out?.resource?.event || "",
      inviteeUri: out?.resource?.uri || "",
      startTime: input.startTime,
    };
  }

  const detail = await res.text().catch(() => "");

  if (res.status === 401 || res.status === 403) {
    return { ok: false, code: "auth", message: `Calendly auth failed (${res.status})` };
  }
  if (res.status >= 500) {
    return { ok: false, code: "transient", message: `Calendly ${res.status}` };
  }

  // A taken slot does NOT come back as a clean 404. Verified against the live
  // API: booking an already-taken time returns 400 with the title "Internal
  // Server Error" and no machine-readable reason — indistinguishable by status
  // code from a genuinely malformed request.
  //
  // So don't trust the status: ask whether the slot is still free. If it has
  // gone, this is a conflict and the patient should simply pick again.
  if (res.status === 400 || res.status === 404) {
    try {
      const stillOpen = (await listAvailableSlots(MAX_WINDOW_DAYS)).some(
        (s) => new Date(s.startTime).getTime() === new Date(input.startTime).getTime(),
      );
      if (!stillOpen) {
        return {
          ok: false,
          code: "slot_taken",
          message: "That time was just taken.",
        };
      }
    } catch {
      // Availability unreachable — fall through and report the original error
      // rather than guessing that it was a conflict.
    }
  }

  return {
    ok: false,
    code: "invalid",
    message: detail.slice(0, 300) || `Calendly ${res.status}`,
  };
}
