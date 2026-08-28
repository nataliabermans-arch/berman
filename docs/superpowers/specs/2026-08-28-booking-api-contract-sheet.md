# API Contract Reference — Berman Booking Integration

**Status:** research + adversarial verification pass complete. Not implementation-ready until the UNRESOLVED section is closed against live tokens.
**Date of research:** 2026-08-28. Re-verify anything version-dated before writing code.

## How to read this sheet

| Marker | Meaning |
|---|---|
| `[OK]` | Quoted/checked against a primary source and corroborated by the adversarial verifier. Safe to build on. |
| `[FIX]` | Original research was wrong or imprecise; the verifier's corrected version is what appears here. |
| `[CONFLICT]` | Two primary sources from the same vendor disagree. Do not pick one silently — code defensively and verify. |
| `[INFER]` | Sound engineering practice, but NOT documented. Never cite as a contract guarantee. |
| `[REFUTED]` | Appeared in research, was shown false. Listed so it does not get re-introduced. |

Anything not carrying one of these markers in Sections 1-5 does not exist in this sheet — it is in Section 6 (UNRESOLVED).

---

## 1. Calendly — availability + programmatic booking

Overall verifier verdict for this area: **sound**. Highest-value correction: **build on a Personal Access Token, not an OAuth app.**

### 1.1 Auth and plan gating

| Item | Value |
|---|---|
| Base | `https://api.calendly.com` |
| Auth header | `Authorization: Bearer <token>` |
| Token type | **Personal Access Token** for own-practice/own-org use `[FIX]` |
| Scope for booking | `scheduled_events:write` `[OK]` |
| Scope for availability | `[CONFLICT]` — see below |
| Plan gate | Any paid tier `[FIX]` |

`[FIX]` **PAT is explicitly documented for this exact case.** The Schedule-Events-with-AI-Agents guide states verbatim: *"The host or admin of the Calendly account can also use a Personal Access Token to leverage the API for their respective Calendly organization."* The original research quoted only the OAuth half of that same paragraph and declared the PAT path unresolved. **Do not budget an OAuth application build** unless the practice later books on behalf of third-party practices.

`[FIX]` **There is no spec-level `security` block anywhere in the Calendly OpenAPI document.** `grep '^security:'` returns nothing; zero operation-level `security` keys exist. The two `securitySchemes` (`oauth2`, `personal_access_token`, both `type: http, scheme: bearer`) are declared under `components` but never applied. Every operation instead declares a bare `Authorization` header **parameter** whose description is literally `"OAuth 2.0"` — including the availability GET. PAT support is asserted by the rendered docs page and the AI-agents guide, **not** by the machine-readable spec. Treat PAT as documented-by-prose.

`[OK]` **New tokens start with zero access.** *"Legacy OAuth apps and Personal Access Tokens issued before the introduction of scoped permissions retain full access... For newly created OAuth apps and new Personal Access Tokens, no API access is granted until scopes are explicitly requested and approved."* A PAT minted today 403s unless its scopes were selected. A `:write` scope implicitly includes the matching `:read`.

`[CONFLICT]` **Scope for `GET /event_type_available_times`.** The endpoint reference page and the OpenAPI spec say `availability:read`. The Scopes catalog assigns that endpoint to `event_types:read` (and assigns `availability:read` only to `/user_busy_times`, `/user_availability_schedules`, `/event_type_availability_schedules`). **Request both.**

`[CONFLICT]` **Plan-name gate.** The Create Event Invitee endpoint page says *"paid plans (Standard and above)"*; the Help Center enumerates *"Professional, Standard, Standard Plus, Teams, Teams Plus, or Enterprise"* — Professional being a legacy tier outside a "Standard and above" ordering. `[FIX]` **Treat the gate as "any paid tier" and detect the 403 message at runtime. Do not pre-check a plan name.** Create Event Invitee is NOT Enterprise-only (Enterprise-only endpoints are: List activity log entries, Delete invitee data, Delete scheduled event data).

### 1.2 Step 1 — list slots

```
GET https://api.calendly.com/event_type_available_times
    ?event_type=https://api.calendly.com/event_types/{UUID}
    &start_time=2026-09-01T00:00:00Z
    &end_time=2026-09-30T00:00:00Z
```

`[OK]` All three query params are **required**. `start_time` cannot be in the past. `end_time` must be in the future and **no greater than 31 days from `start_time`**. *"This endpoint does not support traditional keyset pagination."* A rolling 90-day view therefore costs 3+ sequential requests.

`[OK]` 200 response:
```json
{ "collection": [
  { "status": "available",
    "invitees_remaining": 1,
    "start_time": "2026-09-02T20:00:00.000000Z",
    "scheduling_url": "https://calendly.com/..." } ] }
```
`invitees_remaining` is `>1` only for Group event types.

### 1.3 Step 1b — discover custom-question strings

`[OK]` `GET /event_types/{uuid}` returns `resource.custom_questions[]` = `{ name, type, position, enabled, required, answer_choices[], include_other }`, where `type` ∈ `string | text | phone_number | single_select | multi_select`.

`[OK]` The `question` string you POST **must match `custom_questions[].name` exactly, case-sensitively**. Spec note: *"Required questions must be included in the body and match on the question string exactly."* **Read the question text at runtime** — an admin renaming the question in the Calendly UI silently breaks bookings with a 400.

### 1.4 Step 2 — create the booking

```
POST https://api.calendly.com/invitees
Authorization: Bearer <PAT>
Content-Type: application/json
```
Scope: `scheduled_events:write`. Shipped Apr 15 2026 (operationId `create-event-invitee`).

```jsonc
{
  "event_type": "https://api.calendly.com/event_types/AAAA",  // * full URI, NOT a bare UUID
  "start_time": "2026-09-02T20:00:00Z",                       // * UTC date-time
  "invitee": {                                                // * object
    "email": "patient@example.com",                           // *
    "timezone": "America/New_York",                           // * IANA
    "name": "Jordan Lee",                                     //   required if first_name absent
    "first_name": "Jordan",                                   //   required if name absent
    "last_name": "Lee",                                       //   optional
    "text_reminder_number": "+14155551234"                    //   optional
  },
  "location": { "kind": "physical", "location": "123 Main St" },
  "questions_and_answers": [
    { "question": "<exact custom_questions[].name>", "answer": "...", "position": 1 }
  ],
  "tracking": { "utm_campaign": null, "utm_source": null, "utm_medium": null,
                "utm_content": null, "utm_term": null, "salesforce_uuid": null },
  "event_guests": ["caregiver@example.com"]                   //   max 10
}
```

`[FIX]` **`start_time` alignment is a documented client obligation, not an open question.** The AI-agents guide's General Limitations section states verbatim: *"Timeslot accuracy: `start_time` must correspond to a valid open slot at booking time."* **Always POST a `start_time` copied byte-for-byte from a `collection[].start_time`** — never a locally rounded or reconstructed timestamp. Only the failure *status code* for an off-grid time is undocumented.

`[FIX]` **`location` rules, corrected.** `kind` enum: `physical | inbound_call | outbound_call | zoom_conference | google_conference | gotomeeting_conference | microsoft_teams_conference | webex_conference | ask_invitee | custom`.
- The sibling `location` string is required for **exactly four** kinds: `physical`, `outbound_call`, `ask_invitee`, `custom`.
- `InviteeInboundCall` has `required: [kind]` and **defines no `location` property at all** — inbound_call cannot carry a phone number. `[REFUTED]` The community-thread claim that a 400 was caused by "an inbound_call missing its phone number" is wrong; the real cause was a `kind` that did not match the event type's configured location.
- Governing rule: *"Location must match location specified on the EventType."* **Read the event type's configured location at runtime rather than guessing a kind.**
- **Omit `location` entirely** when the event type specifies no location, and **omit it entirely for `round_robin` pooling_type** event types.

`[OK]` `questions_and_answers[]` items require all three of `question`, `answer`, `position` (integer). Omitting `position` is a validation error.

`[OK]` `tracking` carries all six keys (`utm_campaign`, `utm_source`, `utm_medium`, `utm_content`, `utm_term`, `salesforce_uuid`), all nullable.

`[FIX]` `text_reminder_number` — the spec says only *"Must be a valid phone number (e.g. +14155551234)"*. **Do not assert strict E.164 validation**; the same community thread showed Calendly accepting `+1 203-999-9999` for a location string, suggesting looser parsing.

`[OK]` 201 returns `{ "resource": { uri, email, first_name, last_name, name, status, questions_and_answers[], timezone, event, created_at, updated_at, tracking, text_reminder_number, rescheduled, old_invitee, new_invitee, cancel_url, reschedule_url, routing_form_submission, payment, no_show, reconfirmation, scheduling_method, invitee_scheduled_by, cancellation? } }`. `scheduling_method` ∈ `instant_book | api`.

`[OK]` **Bookings made this way fire the full notification stack** — confirmation emails, calendar invites, SMS reminders, workflows — *"as if booked via the Calendly UI."* **Do not use production event types for integration testing.**

### 1.5 Errors

`[OK]` Documented responses for `POST /invitees`: **201, 400, 401, 403, 404, 500**. 429 is global (rate-limits page), not listed on the operation.

`[OK]` Error body: `{ "title": string, "message": string, "details"?: [{ "parameter"?, "message", "code"? }] }`. The insufficient-scope 403 additionally returns `required_scopes: [string]`.

`[FIX]` **In `ErrorResponseDetailsItem` only `message` is required — `parameter` and `code` are both optional.** Do not make them the sole branch key; fall back to HTTP status.

`[OK]` **Do not pattern-match `title`/`message` for 400/401/404/500.** These share a single auto-generated enum whose title is literally `"Internal Server Error"`. Branch on HTTP status.

`[OK]` The **403 free/unpaid variant is a real enum** and is safe to string-match: title `"Permission Denied"`, message one of `"You do not have permission to access this resource."` / `"You do not have permission"` / `"The Scheduling API is only available on paid Calendly plans. Upgrade your plan to access this feature."` Detect this and surface "upgrade required", not a generic auth failure.

`[OK]` Agent guide error table: 400 = validation error → re-collect inputs; 401 = unauthorized token; 403 = forbidden (policy or scope); **404 = "Not found (event type or time slot)" → re-query availability and propose alternatives**; 5xx = transient → retry with backoff. This 404 row is the only documented handling for an unavailable slot.

### 1.6 Idempotency — THERE IS NONE

`[OK]` **Verified by full-text search of the 615 KB published OpenAPI 3.1 spec and of the Create Event Invitee, API Conventions, Rate Limits, and AI-agents pages: zero occurrences of "idempot", "dedup", or "duplicate".**
- No `Idempotency-Key` header.
- No client-supplied request id.
- No `409 Conflict` on `POST /invitees` (409 exists in the spec only for `POST /contacts`, `PATCH /contacts/{uuid}`, `POST /webhook_subscriptions`).
- No hold / lock / reserve primitive on slots.

`[INFER]` **Required client-side guard.** Persist a booking-intent row keyed on `(event_type, start_time, invitee.email)` **before** the POST. On any ambiguous failure (timeout, connection reset), **reconcile via `GET /scheduled_events?invitee_email=...&min_start_time=...` before retrying — never blind-retry.** A retried POST after a network timeout creates a second real booking that fires patient emails and calendar invites.

### 1.7 Rate limits

| Scope | Limit |
|---|---|
| Global, paid plans `[OK]` | 500 req / user / minute |
| Global, free plan `[OK]` | 50 req / user / minute |
| OAuth token issuance `[OK]` | 8 tokens / user / minute |
| **`POST /invitees`, Trial** `[OK]` | **5 / user / DAY** |
| **`POST /invitees`, paid non-Enterprise** `[OK]` | **10/min AND 50/hour AND 100/DAY** |
| `POST /invitees`, Enterprise `[OK]` | 500 / user / minute |

`[OK]` 429 on breach. `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` (seconds until reset, typically 60) are on **all** responses.

**The 100/user/DAY cap is the binding architectural constraint** for a single-provider practice on a paid non-Enterprise plan.

### `[REFUTED]` — do not reintroduce
- "PAT support on POST /invitees is unresolved / may require OAuth." It is documented.
- "start_time alignment is not documented." It is.
- "No operation-level `security` overrides exist" implying a global default. There is no `security` block at all.
- "inbound_call needs a phone number in `location`." The schema has no `location` property for that kind.
- "`text_reminder_number` is E.164-validated."

---

## 2. Calendly webhooks

Overall verifier verdict: **partly wrong**. Several schema details in the original research were fabricated. Corrected below.

`[FIX]` **Source URLs.** Seven of eight cited `developer.calendly.com` URLs are dead (Stoplight → Fern migration). Current canonical:
- Machine-readable spec (authority for every schema claim): `https://developer.calendly.com/api-docs/openapi/calendly-api.json` (index at `/openapi.json`)
- Create: `/api-docs/calendly-api/webhooks/create-webhook-subscription`
- Signatures: `/api-docs/overview/webhooks/webhook-signatures`
- Errors/retries: `/api-docs/overview/webhooks/webhook-errors`
- Timeouts: `/api-docs/overview/webhooks/webhook-timeouts`
- Rate limits: `/api-docs/overview/rate-limits`
- FAQ: `/docs/getting-started/frequently-asked-questions`

`[FIX]` **Re-verification trap:** developer.calendly.com A/B-splits on a `dp_bucket` cookie. Some buckets serve the retired Gatsby shell (a contentful-looking 200 with none of the documentation in it) for the new URLs. Send `-b "dp_bucket=5"` to force the new Fern portal.

### 2.1 Create subscription

```
POST https://api.calendly.com/webhook_subscriptions
Authorization: Bearer <token>
Content-Type: application/json
```
Auth scope: `webhooks:write`, plus `scheduled_events:read` to subscribe to `invitee.*`.

`[OK]` `required: [url, events, organization, scope]`. `user`, `group`, `signing_key` are optional in the schema's required array.

```json
{
  "url": "https://berman.example.com/api/calendly/webhook",
  "events": ["invitee.created", "invitee.canceled"],
  "organization": "https://api.calendly.com/organizations/AAAA",
  "scope": "organization",
  "signing_key": "<generate and store>"
}
```

`[OK]` `scope` enum is exactly three values: `organization | user | group`.

`[OK]` `events` enum in the **POST request body** (11 values, this exact ordering): `invitee.canceled`, `invitee.created`, `invitee_no_show.created`, `invitee_no_show.deleted`, `meeting_recap.created`, `meeting_recap.updated`, `meeting_recap.deleted`, `routing_form_submission.created`, `contact.created`, `contact.updated`, `contact.deleted`.

`[REFUTED]` **`events` is NOT `uniqueItems: true`.** Fabricated. The `events` property has exactly three keys: `type`, `items`, `description`. The string `uniqueItems` does not appear anywhere in the entire Calendly OpenAPI document. Do not build a validator or dedupe assumption on it.

`[OK]` **Real, reproducible spec inconsistency:** `event_type.created` / `.deleted` / `.updated` appear in the endpoint's scope table, in the `WebhookPayloadEvent` enum, and in the `/sample_webhook_data` enum — but are **missing from the POST body `events` enum**. Do not assume either reading; test against live API if you need them. (Not needed for booking.)

`[OK]` Event → allowed scopes → auth scope:

| Event | Scopes | Auth scope |
|---|---|---|
| `invitee.created` | organization, user, group | `scheduled_events:read` |
| `invitee.canceled` | organization, user, group | `scheduled_events:read` |
| `invitee_no_show.*` | organization, user, group | `scheduled_events:read` |
| `routing_form_submission.created` | **organization ONLY** | `routing_forms:read` |
| `meeting_recap.*` | **user ONLY** | `meeting_recaps:read` |
| `contact.*` | organization, user, group | `contacts:read` |

`[OK]` *"Create separate Webhook Subscriptions for events with different subscription scopes."*

`[OK]` `organization` URI is **required in all three scopes**, including `scope: "user"`, because a user can belong to multiple organizations over time.

`[INFER]` When `scope: "user"` supply `user`; when `scope: "group"` supply `group`. The OpenAPI `required` array omits them but the List endpoint documents the same conditional requirement.

`[OK]` 201 body:
```json
{ "resource": {
  "uri": "...", "callback_url": "...", "created_at": "...", "updated_at": "...",
  "retry_started_at": null, "state": "active",
  "events": ["invitee.created","invitee.canceled"],
  "scope": "organization", "organization": "...", "user": null, "group": null,
  "creator": "..." } }
```
`state` ∈ `active | disabled`.

`[FIX]` **Read `resource.uri` from the 201 body, not the `Location` header.** The header is documented as `Location` / `string` / **Optional**, with no description and no example value, and is **entirely absent from the published OpenAPI JSON** (the document has zero `headers` keys). `[REFUTED]` The example `Location: https://api.calendly.com/webhook_subscriptions/AAAAAAAAAAAAAAAA` was invented.

`[OK]` Errors: 400 INVALID_ARGUMENT; 401 UNAUTHENTICATED; 403 `{"title":"Permission Denied", ...}` or `{"title":"Insufficient scope","required_scopes":["webhooks:write"]}`; 404; **409 `{"title":"Already Exists","message":"Hook with this url already exists"}`** — callback URLs must be unique.

`[FIX]` **403 message enum has THREE values, not two:** `"Please upgrade your Calendly account to Standard"`, `"You do not have permission to access this resource."`, `"You do not have permission"`. Title enum is `["Permission Denied"]`.

`[FIX]` **"Basic or Essentials tier" are retired plan names.** Current tiers: Free, Standard, Standard Plus, Teams, Teams Plus, Enterprise (Professional is legacy).

`[CONFLICT]` **Plan requirement for webhooks.** Developer FAQ: *"a paid subscription on the Standard, Teams, or Enterprise plan."* Help Center: *"Available on the Professional, Standard, Standard Plus, Teams, Teams Plus, and Enterprise plans."* The Help Center string was confirmed verbatim in page source; the narrower developer-FAQ list is unreconciled.

`[OK]` Companion endpoints: `GET /webhook_subscriptions?organization=<uri>&scope=<...>` (both `organization` and `scope` are `required: true`; needs `webhooks:read`), `GET /webhook_subscriptions/{uuid}`, `DELETE /webhook_subscriptions/{uuid}`. **Only post/get/delete exist on the subscription paths — there is genuinely no re-enable endpoint.**

`[FIX]` `GET /sample_webhook_data?event=&organization=&scope=` returns a **synthetic sample**, not live account data (its own description is *"Test your webhook subscription"*). It returns `WebhookPayload` **bare — not wrapped in a `resource` envelope**. Requires `webhooks:read`. Cheap way to exercise handler parsing.

### 2.2 Payload

`[OK]` Envelope `WebhookPayload`, `required: [event, created_at, created_by, payload]`:
```json
{ "event": "invitee.created",
  "created_at": "2020-11-23T17:51:19.000000Z",
  "created_by": "https://api.calendly.com/users/AAAA",
  "payload": { /* InviteePayload */ } }
```

`[OK]` `InviteePayload` required list (verified in full): `uri, email, first_name, last_name, name, status, questions_and_answers, timezone, event, created_at, updated_at, tracking, text_reminder_number, rescheduled, old_invitee, new_invitee, cancel_url, reschedule_url, routing_form_submission, payment, no_show, reconfirmation, scheduled_event, scheduling_method, invitee_scheduled_by`. **`cancellation` is NOT in the required list** — it appears on cancel.

`[OK]` **`start_time` / `end_time` are NOT top-level.** They live on `payload.scheduled_event.start_time` / `.end_time` (UTC ISO-8601). No extra API call needed.

`[FIX]` **`scheduling_method` enum is exactly `["instant_book", "api"]`. `null` is NOT an enum member.** Nullability comes from a wrapper: `{"oneOf": [{"$ref": "InviteePayloadSchedulingMethod"}, {"type": "null"}]}`. Feeding `null` into the enum produces a wrong generated type or a spurious validation failure.

`[OK]` `first_name` / `last_name` are null when the event type uses a single combined name field — **always fall back to `name`**.

`[OK]` `payload.tracking` has **exactly six required, nullable** fields: `utm_campaign`, `utm_source`, `utm_medium`, `utm_content`, `utm_term`, `salesforce_uuid`. There are no other tracking fields.

`[OK]` `questions_and_answers[]`: `question`, `answer`, `position` — all required.

`[OK]` `cancellation` (present on `invitee.canceled`): `canceled_by` (name string), `reason` (nullable), `canceler_type` ∈ `host | invitee`, `created_at` — all four required.

`[OK]` `invitee.canceled` is identical in shape except `status: "canceled"`, `payload.cancellation` populated. `scheduled_event.status` **stays `active`** when only one of several invitees cancels.

`[REFUTED]` "`payload.uri` in the OpenAPI example is missing the `api.` subdomain." This evidence no longer exists. **The current published spec contains ZERO `example` and ZERO `examples` keys anywhere in the document**, and the substring `https://calendly.com/scheduled_events` does not occur in it. It was an artifact of the decommissioned Stoplight renderer's auto-generated placeholders.

`[REFUTED]` "Checkbox answers arrive as a single newline-delimited string." **Not documented by any Calendly primary source.** `InviteeQuestionAndAnswer.answer` is documented only as `{type: string, description: "The invitee's response to the question"}`. The behavior may be real empirically — **it is in UNRESOLVED, not here.**

### 2.3 Signature verification

`[OK]` Header name, exact: **`Calendly-Webhook-Signature`**
`[OK]` Format, exact: `t=1492774577,v1=5257a869e7ecebeda32affa62cdca3fa51cad7e77a0e56ff536d0ce8e108d8bd`
- `t` = UNIX timestamp in **SECONDS** (multiply by 1000 before comparing to `Date.now()`).
- `v1` = lowercase hex HMAC-SHA256 digest.

`[OK]` Algorithm:
1. Split on `,` then `=` → `t`, `v1`. Reject if either missing.
2. `signed_payload = t + "." + <RAW request body>`
3. `expected = HMAC_SHA256(signing_key, signed_payload).hexdigest()`
4. Constant-time compare against `v1`.
5. Reject if `t` is older than tolerance — **Calendly's own examples use 180 seconds**.

`[OK]` `signing_key` is documented as *"Optional secret key shared between your application and Calendly."* **For a PAT you set it yourself at creation time.** For OAuth apps a key is auto-generated per app, retrievable only via `support+developer@calendly.com`. **If no signing_key was set, no signature is sent.** Set one.

`[OK]` **Calendly's own Node example is unsafe and must not be copied verbatim.** It literally uses `JSON.stringify(req.body)` and `expectedSignature !== signature`. Both warnings are therefore well-founded:
- **HMAC the raw body buffer**, not a re-serialization (`express.json({ verify: (req,_res,buf) => { req.rawBody = buf } })`). Key ordering, unicode escaping, or float formatting differences silently break it.
- Use `crypto.timingSafeEqual`, not `!==`.

`[OK]` **No delivery-id, event-id, or idempotency header is documented** on the webhook POST. `[INFER]` Cross-delivery dedupe must key on payload contents (`payload.uri` + `event` + `created_at`). Retries mean the handler MUST be idempotent.

### 2.4 Retries and timeouts

`[OK]` Verbatim: *"If a webhook begins to return errors 3xx/4xx/5xx server responses, it will continue to try to deliver for 24 hours with an exponential back-off... After 24 hours, the webhook is disabled if another message was not delivered successfully and the hook needs to be recreated."* Retries also stop 24 hours after the booked event passes. A single failed message does not block others.

`[OK]` **3xx counts as a delivery failure.** An endpoint that 301-redirects http→https, or redirects a missing/extra trailing slash, fails every delivery and gets the subscription disabled after 24h. **Register the exact final URL.** (Note: this repo sets `trailingSlash: true` — see §5.)

`[OK]` Timeouts: **connection 10s, read 15s.** Return 2xx immediately, process async.

`[OK]` A disabled webhook **cannot be re-enabled** — DELETE then re-POST. Because callback URLs must be unique (409), the recreate is delete-then-create, not create-then-delete. Monitor `state` and `retry_started_at` via `GET /webhook_subscriptions` on a schedule.

`[OK]` Organization-scoped webhooks survive their creator being removed from the org or demoted. **User-scoped webhooks STOP WORKING when that user is removed.** Prefer `scope: "organization"` for anything load-bearing.

### 2.5 UTM passthrough (the ad-click correlation channel)

`[OK]` UTM values on the scheduling link land in `payload.tracking`. Calendly FAQ verbatim: *"to send unique or custom query parameters into your scheduled event, you can use UTM parameters on your scheduling link to pass in your custom data values... this data will then be associated with the event and available in webhook payload (tracking)"* and *"you're welcome to use other values in these such as a userID or anything else you need to track."*

`[OK]` **Only the five standard UTM names are captured.** `?gclid=`, `?fbclid=`, `?click_id=` on a Calendly link are **dropped**. Map your identifier into a `utm_*` slot (`utm_term` / `utm_content` are the usual spares) before redirecting.

`[OK]` **UTM values must be ≤255 characters** or *"they may not be tracked"* — silent drop. Store a short lookup key rather than a raw click id.

`[OK]` `salesforce_uuid` is a first-class field for Calendly's Salesforce integration; not settable via URL param.

`[OK]` Same values readable later via `GET /scheduled_events/{uuid}/invitees` (`tracking`) for backfill/reconciliation.

---

## 3. Conversion tracking — the single-ID dedup scheme

**The scheme:** one server-generated opaque booking ID string governs deduplication on all three platforms. Generate it **once**, server-side, at booking creation. Render it into the page for the browser tags. Reuse the identical string in every server call. Never derive it independently on two sides.

### 3.1 Exact field names — the authoritative table

| Platform | Surface | **Exact field name** | Status |
|---|---|---|---|
| Meta | Pixel, browser | **`eventID`** (camelCase) — key inside the **4th** argument object to `fbq` | `[OK]` |
| Meta | Pixel, image fallback | **`eid`** query param | `[OK]` |
| Meta | Conversions API, server | **`event_id`** (snake_case), top-level on each event object | `[OK]` |
| GA4 | gtag / GTM, browser | **`transaction_id`** | `[OK]` |
| GA4 | GTM dataLayer | **`ecommerce.transaction_id`** | `[OK]` |
| GA4 | Measurement Protocol, server | **`events[].params.transaction_id`** | `[OK]` |
| Google Ads | gtag conversion, browser | **`transaction_id`** | `[OK]` |
| Google Ads | CSV offline import | column **`Order ID`** | `[OK]` |
| Google Ads | Google Ads API `ClickConversion` (UPLOAD_CLICKS) | **`order_id`** | `[OK]` |
| Google Ads | Data Manager API `events.ingest` (multi-source, beta) | **`transactionId`** (camelCase) | `[FIX]` |
| Google Ads | `ConversionAdjustmentUploadService` | **`order_id`** — must equal the original | `[OK]` |

`[OK]` **Meta: key names differ, values must be byte-identical.** Verbatim: *"1. In corresponding events, a Meta Pixel's `eventID` must match the Conversion API's `event_id`. 2. In corresponding events, a Meta Pixel's `event` must match the Conversion API's `event_name`."*

`[FIX]` **`event_name` case-sensitivity is `[INFER]`, not documented.** Meta states only that the values must match. Enforce exact-string equality anyway by generating the event name from **one shared constant** used by both the server payload and the rendered `fbq` call — which also satisfies the requirement to keep the event name a single config value in case `Schedule` is restricted for this dataset (see §4).

### 3.2 Meta dedup window and semantics

`[OK]` **48 hours**, stated twice: *"If we find the same server key combination (`event_id` and `event_name`) and browser key combination (`eventID` and `event`) sent to the same Pixel ID within 48 hours, we discard the subsequent events."* The window **starts when the FIRST event with that `event_id` is received** — not at `event_time`. Match is scoped to the **same Pixel ID**.

`[OK]` *"If server and browser events do not differ meaningfully in their content, we generally prefer the event that is received first."* Sending both is safe; it is not a race you need to win.

`[INFER]` **Cap server retry queues well inside 48h.** A retry that redelivers 3 days later double-counts.

`[OK]` Fallback dedup (no `event_id`): match `event_name` + `fbp` and/or `external_id` on both sides. Limitation, verbatim: *"it only works for deduplicating events sent first from the browser and then through the server. Server events will not be discarded if a browser event has not been received in the past 48 hours."* It never dedupes browser-only or server-only duplicates.

`[OK]` Best practice, verified verbatim: *"ensure that both events use the identical `event_name` and that either `event_id` or a combination of `external_id` and `fbp` are included."* `[REFUTED]` The trailing *"Include all of these parameters."* could not be located on that page — do not quote it.

Browser:
```js
fbq('track', 'Schedule', {}, { eventID: 'BK-2026-00123' });
// trackSingle form: fbq('trackSingle', PIXEL_ID, 'Schedule', {...}, { eventID: '...' })
```
Server:
```json
{ "event_name": "Schedule", "event_id": "BK-2026-00123" }
```

### 3.3 Meta CAPI request contract

```
POST https://graph.facebook.com/v26.0/{PIXEL_ID}/events
```
`[FIX]` **Graph API version resolved — this is no longer an open question.** Current is **v26.0, released 2026-07-29**. v25.0 (released 2026-02-18) is available until 2028-07-29; v24.0 until 2028-02-18. Meta's CAPI examples still show v25.0. **Pin explicitly.** Either v25.0 (long runway, matches doc examples) or v26.0 is defensible.

`[OK]` Access token as query param or form field. **Never ship it to the browser.**
`[OK]` Batch max **1000** events in `data`. **"If any event you send in a batch is invalid, we reject the entire batch."** Validate per-event or send small batches.
`[OK]` No CAPI-specific rate limit; calls count as Marketing API calls.

`[OK]` Required server-event fields: `event_name`, `event_time`, `user_data`, `action_source`.
`[OK]` `event_time` = Unix **SECONDS**, GMT.
`[FIX]` The all-or-nothing 7-day rule — *"If any `event_time` in `data` is greater than 7 days in the past, we return an error for the entire request and process no events"* — **is genuine Meta text but lives on the offline-events page** (`developers.facebook.com/documentation/ads-commerce/conversions-api/offline-events`), not `using-the-api`. The `using-the-api` page carries only *"The `event_time` can be up to 7 days before you send an event to Meta."*
`[FIX]` Meta has restructured CAPI docs under `/documentation/ads-commerce/conversions-api/...`. The legacy `/docs/marketing-api/conversions-api/...` paths still resolve; the newer tree is authoritative.

`[OK]` `action_source` enum: `email | website | app | phone_call | chat | physical_store | system_generated | business_messaging | other`. *"By using the Conversions API, you agree that the `action_source` parameter is accurate to the best of your knowledge."*

`[CONFLICT]` **`event_source_url`.** The parameters **overview** page says verbatim: *"Website events shared using the Conversions API require the `client_user_agent`, `action_source`, and `event_source_url` parameters, while non-web events require only `action_source`."* The server-event **parameter reference** lists `event_source_url` under **Optional**. `[FIX]` **Practical reading: required for good matching/attribution, not enforced as batch-invalidating validation.**
> **Design rule for this build:** always send it, but **the client must NOT hard-fail or refuse to enqueue an event that lacks it.** Because `event_source_url` is simultaneously the most likely health-data leak (§4), the safe design is a condition-neutral URL plus a client that degrades to omitting the field. **Never couple "we could not produce a safe URL" to "we drop the conversion."**

`[OK]` **SHA-256 hex, applied AFTER normalization**, required for: `em`, `ph`, `fn`, `ln`, `db`, `ge`, `ct`, `st`, `zp`, `country`. `external_id`: hashing recommended.

`[FIX]` **NEVER hash (complete list, `madid` added):** `client_ip_address`, `client_user_agent`, `fbc`, `fbp`, `subscription_id`, `fb_login_id`, `lead_id`, `anon_id`, **`madid`**, `page_id`, `page_scoped_user_id`, `ctwa_clid`, `ig_account_id`, `ig_sid`. *"The `client_ip_address` user data parameter must never be hashed."*

`[OK]` Normalization:

| Field | Rule | Worked example |
|---|---|---|
| `em` | trim, lowercase. **Meta does NOT instruct stripping Gmail dots or `+` suffixes.** | `John_Smith@gmail.com` → `john_smith@gmail.com` → `62a14e44f765419d10fea99367361a727c12365e2520f32218d505ed9aa0f62f` |
| `ph` | strip symbols/letters/leading zeros, prepend country code, **digits only, no `+`** | `(650)555-1212` → `16505551212` → `e323ec626319ca94ee8bff2e4c87cf613be6ea19919ed1364124e16807ab3176` |
| `fn`/`ln` | lowercase, no punctuation, UTF-8; **accents preserved** | `Valéry` → `valéry` (not `valery`) |
| `db` | `YYYYMMDD` | `2/16/1997` → `19970216` |
| `ge` | single lowercase initial | `f` / `m` |
| `ct` | lowercase, no punctuation/spaces | `New York` → `newyork` |
| `st` | lowercase 2-char ANSI | `California` → `ca` |
| `zp` | lowercase, no spaces/dashes, US first 5 | `94035` |
| `country` | lowercase ISO 3166-1 alpha-2 | `us` |

`[OK]` `em` and `ph` accept **lists** of hashed strings. `client_ip_address` and `client_user_agent` are single strings.

`[OK]` **Baseline matching rejection** (Graph v13.0+): an event is INVALID if its only `user_data` is one of, or a subset of: `ct`+`country`+`st`+`zp`+`ge`+`client_user_agent`; `db`+`client_user_agent`; `fn`+`ge`; `ln`+`ge`.

### 3.4 fbc / fbp

`[OK]` `fbp` = `_fbp` cookie. Format `fb.{subdomain_index}.{creation_time_ms}.{random_number}`. **Real Meta example: `fb.1.1596403881668.1116446470`.**
`[FIX]` `fbc` = `_fbc` cookie. Format `fb.{subdomain_index}.{creation_time_ms}.{fbclid}`. **Meta's real documented example is `fb.1.1554763741205.IwAR2F4-dbP0l7Mn1IawQQGCINEz7PYXQvwjNwB_qa2ofrHyiLjcbCRxTDMgk`.**
`[REFUTED]` The example `fb.1.1554763741205.AbCdEfGhIjKlMnOpQrStUvWxYz1234567890` was fabricated — the timestamp was kept and the fbclid replaced with a placeholder alphabet string. **Any regex derived from it (alphanumeric-only) will reject live click IDs**, which are long and contain `-` and `_`.
`[INFER]` Validate only the envelope: `^fb\.\d\.\d{13}\.` and pass the fbclid segment through **byte-for-byte unmodified**.

`[OK]` `subdomain_index`: `com`=0, `example.com`=1, `www.example.com`=2. Use 1 when generating server-side.
`[OK]` **`creation_time` inside fbc/fbp is MILLISECONDS. `event_time` is SECONDS.** Mixing these produces events silently rejected as >7 days old, or malformed cookies that never match.
`[OK]` **fbclid is CASE SENSITIVE**: *"ClickID value is case sensitive - do not apply any modifications before using, such as lower or upper case."*
`[OK]` Set `_fbc` as an HTTP cookie, **90-day expiry**, refreshing only when the URL `fbclid` differs from the segment after the last `.` in the current cookie value.
`[OK]` *"We recommend that you always send `_fbc` and `_fbp`... These values are subject to change over multiple browser sessions, so we recommend refreshing a user's profile with the latest value whenever possible."*

### 3.5 Meta response handling

`[FIX]` **`events_received`, `messages`, `fbtrace_id` ARE the real field names** — the original hedge can be relaxed. But docs commit only to *"If the event payload is valid, a 2xx HTTP response code is returned. If invalid, a 4xx HTTP response code is returned, with minimal error details in the response body,"* so **key success detection on HTTP status, and log the raw body plus `fbtrace_id`.**
`[FIX]` **Some third-party writeups show a `success: true` field. That is not part of Meta's CAPI response. Do not key on it.**

`[OK]` **`test_event_code` traffic is live traffic:** *"Events sent with `test_event_code` are not dropped. They flow into Events Manager and are used for targeting and ads measurement purposes."* **Never rehearse with real patient data.** Remove before production payloads.

### 3.6 GA4 — Measurement Protocol

```
POST https://www.google-analytics.com/mp/collect?measurement_id=G-XXXXXXX&api_secret=SECRET
EU:  https://region1.google-analytics.com/mp/collect?...
Validate: https://www.google-analytics.com/debug/mp/collect?...   (returns validationMessages)
```
`[OK]` `api_secret` from GA Admin → Data streams → Measurement Protocol API secrets. **Server-side only.**
`[OK]` **A 2xx from `/mp/collect` means nothing** — the endpoint accepts malformed payloads silently. Only `/debug/mp/collect` validates.

`[OK]` Required body: `client_id` (string), `events[]` (max 25).
`[OK]` Optional top-level: `user_id`, `timestamp_micros`, `user_properties`, `consent`, `user_data`, `non_personalized_ads` (**deprecated** — *"Use the `ad_personalization` field of consent instead"*), `user_location`, `ip_override`, `device`, `user_agent`, `validation_behavior` (`RELAXED` | `ENFORCE_RECOMMENDATIONS`, defaults `RELAXED`).
`[OK]` `consent` subfields: `ad_user_data`, `ad_personalization`, each `GRANTED` | `DENIED`.

`[FIX]` **Do not parse GA cookies. Use the documented API.**
```js
gtag('get', 'G-XXXXXXXXXX', 'client_id',      cb);
gtag('get', 'G-XXXXXXXXXX', 'session_id',     cb);
gtag('get', 'G-XXXXXXXXXX', 'session_number', cb);
```
`[REFUTED]` "Read `session_id` from the `_ga_<STREAM_ID>` cookie (`GS1.1.<session_id>...`), first numeric segment after `GS1.1`." **GA4 migrated to the GS2 format around May 2025** — `$`-delimited labelled key-value pairs where `s` prefixes the session ID (e.g. `GS2.1.s1746825440$o3$g1$t...`). The old parse returns a wrong value or nothing on current GA4. **Google has never documented either cookie value structure** — `support.google.com/analytics/answer/11397207` documents only the cookie *names*. The `_ga` middle segment also varies with cookie domain depth.

`[FIX]` **MP eligibility — four distinct use cases, not one table.** These gate different outcomes:

| Use case | `session_id` | Deadline | Extra |
|---|---|---|---|
| Assign User-ID | Required | Same business day | |
| **Session attribution** (source / medium / **campaign** / geo inheritance) | **Required** | **≤ session start + 24 hours** | |
| Export events to advertising platforms | Not required | ≤ **63 days** after latest online event **AND within the key event's attribution window** | `timestamp_micros` within last 72h |
| Audience creation | Not required | Web ≤ **30 days**; App ≤ **42 days** after latest online event | `timestamp_micros` within last 72h |

`[FIX]` The 24-hour gate covers **source, medium and campaign — not only geo/device**: *"Measurement Protocol events that meet specific requirements appear in reports with the same session attributes (such as geographic information, source, medium, and campaign) as online events from the same session."*
`[FIX]` The 63-day rule has a **second binding condition the original research truncated**: *"...even if the key event's attribution window is more than 63 days. **The event must also arrive within the key event's attribution window.**"*

> **Consequence for this clinic:** a booking confirmed more than 24h after the ad click gets **NO session source/medium/campaign inheritance** — which is exactly the scenario a booking flow produces. Plan on losing session attribution and keeping only the 63-day ads-export path.

`[OK]` MP carries **no campaign/source/medium fields**. Attribution is inherited: *"Advertising identifiers and privacy settings are joined with Measurement Protocol events using `client_id` or `app_instance_id`."* A wrong or missing `client_id` credits the booking to `(direct)/(none)` and **does not fail loudly**.
`[OK]` Omitting `session_id` starts a **new session**, reported as `(not set) / (not set)`. Support doc: *"When session-based Measurement Protocol events are reported as '(not set) / (not set),' send the `session_id` parameter with a valid value from the client-side event."*

`[FIX]` **Complete MP limits** (original omitted the per-name/value caps the contract depends on):
- 25 events / request; 25 parameters / event; 25 user properties
- Event name ≤ **40** chars, `[a-zA-Z0-9_]`
- **Parameter NAME ≤ 40 chars**
- Parameter value ≤ **100** chars (**500 on Analytics 360**)
- **User property NAME ≤ 24 chars; user property VALUE ≤ 36 chars** (silent truncation)
- POST body < **130 kB**
- `timestamp_micros` = **MICROseconds**, backdating capped at **72 hours**
- 100 million non-conversion requests / hour / property

`[OK]` **Event-creation and event-modification rules do NOT fire on MP events.** Any renaming or synthesis configured in the GA4 UI silently does not apply to server-sent events. Some event/parameter names are reserved and cannot be sent via MP.

`[OK]` **GA4 `transaction_id` dedup applies to `purchase` events on web streams only.** *"Don't send an empty string as the transaction ID. Google Analytics will deduplicate all purchase events that have `transaction_id=""`."* **An empty string is worse than omitting the field.**

### 3.7 Google Ads — the architecture warning

`[REFUTED — ARCHITECTURE NOT IMPLEMENTABLE AS ORIGINALLY WRITTEN]`
The original contract said: *"OCI keyed on GCLID, on a single conversion action, deduplicated by `order_id` against the browser tag's `transaction_id` (Google's 'multi-source conversions' shape)"* via `ConversionUploadService.UploadClickConversions`. **These are two different products and cannot be combined:**
- `upload-clicks` docs: *"The conversion action must have a type of `UPLOAD_CLICKS`"* — it cannot be the website-tag action.
- Multi-source docs: *"Connecting an additional data source is currently only available for Google Ads website conversion actions that are set up manually using code via the Google tag or Google Tag Manager."*
- **Multi-source runs through the DATA MANAGER API (`events.ingest`), not `ConversionUploadService`, and its dedup field is `transactionId` (camelCase), not `ClickConversion.order_id`.**

**Two viable architectures — pick one deliberately:**

**(A) Multi-source conversions via Data Manager API** — one website conversion action fed by both tag and server.
- Created via Google tag / GTM code (not "from a template").
- Request: `destinations[]`, `events[]`, `encoding`, `validateOnly`, `consent{adUserData, adPersonalization}`.
- Each `Event`: `eventTimestamp`, **`transactionId`** (dedup key), `conversionValue`, `currency`, `adIdentifiers{gclid, ...}`, `userData`, `eventSource`.
- `[FIX]` **Beta, allowlist-only.** Documented 14-day trial: *"your additional data source will automatically enter an initial 14-day trial period... After 14 days, the conversions from the additional source will automatically become biddable."* (Reporting-only until then.)
- `[FIX]` **55-day cap on value updates:** *"If your upload includes updated conversion values for transactions already recorded by your tag, these updates will only be processed for conversions that occurred up to 55 days in the past"*, plus guidance to upload *"within 24 hours of the conversion event occurring."* **This directly constrains any "booking made → booking attended" restatement design.**
- `[FIX]` **The GA4-import route is explicitly ruled out:** *"Imported Google Analytics conversions: This feature is currently designed specifically for Google Ads web tags."*

**(B) Separate `UPLOAD_CLICKS` conversion action via `ConversionUploadService`** — the fallback if not allowlisted.
- **There is then NO cross-action dedup.** The browser tag action and the upload action are two different conversion actions.
- **Only one may be in campaign goals / bidding**, or every booking counts twice.

`[FIX]` **Correct dedup wording** (the original quote was fabricated — grep of the live page returns zero occurrences of *"only removes duplicate data"* or *"not across two different conversion actions"*). The page actually says: **"Google Ads prevents double-counting by matching the Transaction IDs from both data sources within the same conversion action."** The underlying idea (dedup is scoped to one conversion action) survives; the quotation does not.

### 3.8 Google Ads — `ClickConversion` (option B) fields

`[OK]` `ConversionUploadService.UploadClickConversions`, `partial_failure: true`.
- `gclid` | `gbraid` | `wbraid` (exactly one)
- `conversion_action`: `customers/{cid}/conversionActions/{id}`, type `UPLOAD_CLICKS`
- `conversion_date_time`: **`"yyyy-mm-dd HH:mm:ss+|-HH:mm"` — timezone offset REQUIRED**, a naive datetime is rejected
- `conversion_value`, `currency_code` (ISO 4217)
- `order_id` — *"optional, but strongly recommended"*; **"If you set it during the import, you must use it for any adjustments"**. Plan the ID scheme before go-live.
- `user_identifiers` (max 5) — **OMIT for this clinic, see §4**
- `consent { ad_user_data, ad_personalization }`

`[OK]` **`UserIdentifier` is a protobuf `oneof`** — only ONE of `hashed_email`, `hashed_phone_number`, `mobile_id`, `third_party_user_id`, `address_info` per identifier. Setting a second **clears the first**. They must be separate array entries. (Moot here given the policy blocker, but a frequent bug.)

### 3.9 Transaction ID rules (all Google surfaces)

`[OK]` Must match **byte-exactly** across sources: *"The ID from your new data source must exactly match the `transaction_id` captured by your conversion tag"* — differing prefixes, suffixes, or extra spaces prevent deduplication, **with no error surfaced at upload time.**
`[OK]` Max **64 characters**; numbers, letters, dashes, spaces.
`[OK]` Must be **dynamically generated by the backend** and unique per transaction.
`[FIX]` **"The transaction IDs must not include any information that could be used to identify individual customers."** — a real policy line reinforcing the opaque-ID rule.
`[FIX]` **A non-unique ID has TWO failure modes, not one.** Original claimed undercounting only. Actual doc: *"if transaction IDs are incorrectly coded, conversions can be marked as invalid or Google Ads may skip the deduplication process if it finds the same transaction ID used by multiple customers."* **Skipped dedup produces OVERcounting.**
`[FIX]` **Dedup failure is not silent — there is a diagnostic surface.** Conversion Diagnostics (Goals → Conversions → Summary → Diagnostics) surfaces *"Your conversions may be overcounted"* and *"Google tag is missing transaction ID."* Use it to verify.
`[OK]` A matched ID with a new value **updates** the existing conversion rather than counting a new one.

### 3.10 Click-ID capture

`[OK]` `gclid` — standard, user-level, deterministic. `gbraid` — web-to-app iOS 14.5+. `wbraid` — app-to-web iOS 14.5+. Both braid types *"measure conversions in a non-unique fashion (like Campaign ID) without linking them to individual users or events."*
`[FIX]` **Source correction:** the ATT quote — *"`&gclid={GCLID}` will not be appended to ad clicks and the `{gclid}` ValueTrack parameter will be set to empty text"* — is from `support.google.com/google-ads/answer/10635155` (*Supporting partners through the rollout of Apple's new ATT policies*), **not** `answer/16297842` (which is titled "GBRAID URL parameter" and contains no ATT/gclid/ValueTrack reference).
`[FIX]` **`GBRAID` is case sensitive and shouldn't be converted to upper or lower case.** The capture/storage layer must not normalise case.
`[OK]` Google's own guidance: capture the gclid URL parameter into a hidden field and store in a cookie or local storage for **90 days**.
`[OK]` **Documented restriction:** *"Google Ads does not support custom conversion variables in combination with `wbraid` or `gbraid`."*

`[FIX]` **`ads_data_redaction` was overstated.** Doc: *"When `ads_data_redaction` is true and `ad_storage` is denied, ad click identifiers sent in network requests by Google Ads and Floodlight tags will be redacted."* It redacts identifiers in **outbound Google tag pings**. **The `gclid` in the landing-page URL is untouched and remains capturable first-party.** The real consent-driven capture loss is upstream (auto-tagging / ATT), not `ads_data_redaction`.

### 3.11 OCI prerequisites

`[OK]` **Auto-tagging must be ON** in Google Ads or offline conversion import does not work at all.
`[FIX]` **The 4-6 hour rule is a reporting delay, not a rejection.** Doc: *"After creating a new conversion action, wait 4-6 hours before uploading conversions for that conversion action. **If you upload conversions during the first 4-6 hours, it might take 2 days for those conversions to appear on your reports.**"* A team debugging "rejected uploads" would chase a fault that does not exist.
`[FIX]` **The "14 days or 90 days" figures are Data Manager IMPORT LOOKBACKS, not click-to-conversion attribution windows** — and they are enumerated in the same sentence the original research called unenumerated: *"For Google Cloud Storage (GCS), Amazon S3, HTTP, SFTP, and gSheets, Google Ads Data Manager imports conversions from 90 days ago in every run. For Salesforce and HubSpot, Data Manager imports the last 14 days of data in the first successful run... For BigQuery, Amazon Redshift, Snowflake, MySQL, and PostgreSQL, Data Manager imports the last 14 days of data in every run."*

### 3.12 Consent Mode v2

`[OK]` Four parameters, each `granted` | `denied`: `ad_storage`, `analytics_storage`, `ad_user_data` (*"Sets consent for sending user data related to advertising to Google"*), `ad_personalization` (*"Sets consent for personalized advertising"*). Set via `gtag('consent','default',{...})` **before tags fire**, then `gtag('consent','update',{...})`.
`[OK]` **Mandatory for EEA traffic:** *"To keep using applicable tags/SDKs for measurement, and for ad personalization, and remarketing features, you must collect consent for use of personal data from end users based in the EEA."* Without it, *"only end users outside the EEA will be included in audience segments"* and unconsented EEA data *"will not be processed and cannot be used for ad personalization using Customer Match."*
`[OK]` Blocking Google tags until banner interaction is **worse** than consent mode: *"Google won't be able to verify user consent choices and this may lead to loss in data."*
`[OK]` Mirror the decision server-side: GA4 MP `body.consent{ad_user_data, ad_personalization}` as `GRANTED`/`DENIED`; Ads `ClickConversion.consent{...}`; Data Manager `consent{adUserData, adPersonalization}`.
`[OK]` Meta's Business Tools Terms §3.b separately require prominent notice and, where applicable, consent before storing/accessing cookies. **The CAPI payload must degrade gracefully when the visitor declines — send the event without `fbc`/`fbp` rather than fabricating them.**

---

## 4. Health / medical data policy — a sexual-health clinic

**This section is a hard constraint on the integration design, not advice.** Read it before writing any tracking code.

### 4.1 Meta — the legally operative text (verified verbatim)

`[OK]` **Business Tools Terms §1.h:** *"You represent and warrant that you will not share Business Tool Data with us that (i) you know or reasonably should know is from or about children under the age of 13, (ii) includes Contact Information not hashed in accordance with Section 1.a.i, (iii) includes identifiers we do not permit, such as social security or credit card numbers, or (iv) **includes or is based on, directly or otherwise, health information**, financial information, consumer report information, or other categories of sensitive information (including any information defined as sensitive under applicable laws, regulations and applicable industry guidelines)."*

`[OK]` **Naming clause, same section:** *"The names you choose and criteria you establish for your events, conversions, and any custom audiences you create must not reflect, imply or be based on any category of information described in this Section 1.h."*

> **"directly or otherwise" is the operative phrase.** The prohibition is about **inference, not just explicit fields**. An event that fires only on `/book/hiv-testing` communicates a health fact about an identified person even though no field says "HIV". **The event's existence, tied to a hashed email, is the disclosure.** Hashing is NOT anonymization and does not cure this — §1.h treats hashing as a separate requirement (clause ii) from the health prohibition (clause iv).

`[CONFLICT / UNVERIFIABLE]` **The five Help Center health citations are directionally reliable but NOT quotable.** Every `facebook.com/business/help/*` URL is client-rendered and returns only its page title to a fetcher, so none of the enumerated prohibited-information list, the three restriction-tier definitions, the Core Setup strip behavior, the "Health and wellness" category definition, or the Meta-assigned-category rule could be checked against the primary page. Two specific wording problems surfaced:
- `help/361948878201809` is currently titled **"About Sensitive Health Information"**, not a "prohibited-information list".
- The circulating Meta text for the Health and wellness category is **materially shorter** than the version originally quoted (*"associated with medical conditions, specific health statuses, or provider/patient relationships (for example, a patient portal or wellness tracker for depression)"*). The extension covering *"services for accessing personal health information... telemedicine platform, pharmacy, health insurance marketplace, or condition-specific support group"* **could not be corroborated.**

**Do not quote these in the implementation spec. Read the actual assigned category and restriction tier off this practice's own Events Manager instead.**

`[OK]` **Custom conversions enforcement (verified verbatim, on developers.facebook.com):** *"Beginning September 2, 2025, we will start to roll out more proactive restrictions on custom conversions that may suggest information not permitted under our terms"* — including any suggesting specific health conditions. When flagged, **"the `is_unavailable` field will be set to true."**
`[FIX]` **Corrected blocked-write error string** (original mis-quoted the first word): **"This custom conversion is blocked because it may contain information (e.g., health, financial) not allowed under Meta's terms. Visit the events manager to appeal this decision, edit your custom conversion and remove prohibited information, or choose a different custom conversion."**

### 4.2 Google — verified policy

`[OK]` **Blocking rule:** *"Conversions related to sensitive categories can't be used for measurement in enhanced conversions or store sales (uploads)."* Health/medical information and sexual behavior/orientation are both enumerated sensitive categories.
`[OK]` **The same page (`adspolicy/answer/7475709`) also carries an unqualified line:** *"You may not upload conversion information related to sensitive categories."*
`[OK]` **Health personalized-advertising policy** (`adspolicy/answer/16701855`) explicitly covers *"Physical or mental health conditions, including diseases, **sexual health**, and chronic health conditions"* and *"Any health issues associated with intimate body parts or functions, including genital, bowel, or urinary health"*, **naming STI treatments as a worked example.**
`[OK]` **Prohibited targeting for health advertisers:** advertiser-curated audiences, **Customer Match**, your-data segments, audience expansion, lookalike segments. *"Advertisers promoting products and services that fall within sensitive interest categories are unable to use advertiser-curated audiences."*
`[OK]` **Allowed:** predefined Google audiences (sensitive signals auto-excluded), in-market segments, affinity, demographics, life events, location targeting, custom segments with restrictions.
`[OK]` **Standing obligations on any upload:** disclose to customers that you share their information with third parties for ad measurement; obtain consent where legally required; comply with applicable data protection law and Google's EU User Consent Policy.
`[OK]` **Enforcement is account-level:** *"you'll be contacted with a request for corrective action, and if you fail to make the requested corrections within the time period given, you may be denied use of these products or your access to your Google Ads accounts may be suspended."*

### 4.3 MUST NOT be sent — explicit list

**Never transmit to Meta or Google, in any field, on any surface:**

1. **Service, procedure, test panel, or screening type** — not in `item_name`, `item_category`, `item_id`, `content_name`, `content_category`, `content_ids`, `contents`, `search_string`, `custom_properties`, GA4 custom dimensions, or Ads custom conversion variables.
2. **Reason for visit, symptom, condition, diagnosis, medication, or clinician specialty.**
3. **Condition-bearing URL paths or query strings** in `event_source_url` / GA4 `page_location` / Ads page URL rules. A URL like `/book/sti-screening/confirmation` ships a diagnosis-adjacent fact on every call. **Fix this in the site's information architecture, not in the tracking layer** — route all bookings through one generic path (`/book`, `/appointment/confirmed`). Strip query strings and UTMs before sending; Meta warns about UTMs specifically.
4. **Per-procedure prices.** A distinct `value` is a fingerprint for the procedure. Use a flat blended value or **omit `value`/`currency` entirely** — Meta's `Schedule` requires neither.
5. **Any custom event or custom conversion name that reflects, implies, or is based on health.** `HIVTestBooked`, `STIScreeningScheduled` violate §1.h **on the name alone**, before any payload. Since Sept 2 2025 Meta proactively flags such custom conversions, sets `is_unavailable=true`, blocks their use in new campaigns, and blocks edits.
6. **Anything from authenticated clinical surfaces.** Do not place the Pixel, GA4, or Ads tags on patient portals or logged-in clinical pages at all. Confine tracking to the public marketing funnel and the booking confirmation step.
7. **Conversion action names carrying clinical meaning.** Google Ads conversion action names are visible in the Ads UI and inherited by MCC/agency users.
8. **Transaction/booking IDs derived from identifying information.** *"The transaction IDs must not include any information that could be used to identify individual customers."*
9. **Real patient data in any test payload** — Meta `test_event_code` events are not dropped and flow into Events Manager for targeting and measurement.
10. **Hashed patient identifiers to Google Ads.** Enhanced conversions (web AND leads) and store-sales uploads are prohibited for sensitive categories. **Leave `ClickConversion.user_identifiers` empty. Do not enable Enhanced Conversions for Web. Do not use ECL.**
11. **GA4 remarketing audiences built from booking behavior, exported to Ads.** Prohibited targeting surface. Do not enable Google Signals / ads personalization on segments derived from service-specific behavior.

### 4.4 Event naming — the safe choice

`[OK]` **Meta: use the standard event `Schedule`.** Definition: *"When a person books an appointment to visit one of your locations."* Server enum `SCHEDULE`. All its object properties are Optional. `Lead` = *"When a sign up is completed"* (correct only for a pre-booking enquiry). `CompleteRegistration` = *"When a registration form is completed."*
The reason to prefer a standard name here is a **policy** reason: `Schedule` is condition-neutral and carries no clinical meaning, and under any data restriction **custom events are auto-blocked until manually reviewed**.
`[INFER]` **Keep the event name as ONE config constant** shared by the server payload and the rendered `fbq` call, so it can be swapped if `Schedule` is restricted for this dataset. Fallback: another condition-neutral standard event (`Contact`, `CompleteRegistration`, `Lead`) or upper-funnel events — **never a descriptive custom event.**

### 4.5 Liability — this is not boilerplate

`[OK]` Meta: *"you are ultimately responsible for the data you share with Meta. You are in the best position to ensure your integration does not share prohibited information... Meta's systems are not a substitute for your own compliance mechanisms."* After a takedown notice: *"You must not attempt to send data that has previously been detected and removed."* Consequences escalate to *"suspension or termination."*

**Meta is not a HIPAA business associate.** The 2022-2024 wave of pixel litigation against US health systems targeted exactly this pattern. There is a defensible conservative design (upper-funnel events only, no identified conversion events) that trades measurement for risk. **That is a decision for the practice's counsel, not for the integration.**

`[FIX] [INFER]` **The "use GCLID-only OCI instead" recommendation is an INFERENCE, not documented-safe.** The documented prohibition is narrow (enhanced conversions / store sales uploads) but the same page also carries the unqualified *"You may not upload conversion information related to sensitive categories."* **No Google page reviewed states that GCLID-only offline import is exempt.** Present this to legal as an open risk, not as a cleared path.

---

## 5. Existing repo contracts we must not break

Working directory: `C:\Users\Xavier\Documents\Med projects\berman`. Next.js 14 App Router, TypeScript.

`[FIX]` **This IS a git repo** (`git rev-parse --is-inside-work-tree` returns true; the session env header saying otherwise is wrong).
`[FIX]` **Line citations across this section drift by up to ~8 lines.** Corrected anchors: contacts/upsert at `delivery.ts:551`, tags at `:585`, opportunity search fetch at `:464`, create at `:498`, `deliverLead` at `:752`, `LeadDeliveryPayload` at `:8-33`. Every anchor resolves to the right code.

### 5.1 GHL constants and calls (`lib/leads/delivery.ts`)

`[OK]` All verified verbatim:
```
GHL_BASE_URL                = "https://services.leadconnectorhq.com"
GHL_API_VERSION             = "2021-07-28"      // contacts + tags
GHL_OPPORTUNITY_API_VERSION = "2023-02-21"      // opportunity search + create
BERMAN_MARKETING_PIPELINE_ID = "eLqGD6YG5VkNOXYqrlux"
BERMAN_NEW_LEADS_STAGE_ID    = "e3f01ead-c51c-425f-a182-512d88c320bb"
```
Both IDs are duplicated in `app/api/health/ghl/route.ts:7-8` as `DEFAULT_PIPELINE_ID` / `DEFAULT_STAGE_ID`.

| # | Call | Version | Notes |
|---|---|---|---|
| 1 | `POST /contacts/upsert` (`:551`) | 2021-07-28 | Body: `locationId, firstName, lastName, email, phone, source: "Berman website lead form", customFields`. Headers include `Content-Type`. |
| 2 | `POST /contacts/{id}/tags` (`:585`) | 2021-07-28 | Body `{ tags: [...] }`. **Failure is NON-FATAL** — only appends a detail string. |
| 3 | `GET /opportunities/search?location_id=&contact_id=&pipeline_id=&status=open&limit=20` (`:464`) | 2023-02-21 | **snake_case params. Deliberately no `Content-Type`.** Non-2xx **throws**. |
| 4 | `POST /opportunities/` (`:498`, trailing slash) | 2023-02-21 | **camelCase body**: `pipelineId, locationId, name, pipelineStageId, status:"open", contactId, monetaryValue: 0`. |
| 5 | `GET /opportunities/pipelines?locationId=` (`health/ghl/route.ts:79-91`) | **2021-07-28** | `cache: "no-store"` |

`[FIX]` **The version and casing splits are VENDOR-IMPOSED, not repo defects.** Every pairing matches HighLevel's own per-version docs: search under 2023-02-21 IS documented with snake_case `location_id` (required); create under 2023-02-21 IS documented with camelCase; pipelines under 2021-07-28 IS the documented version for that endpoint. `[REFUTED]` The "mixed versions / copy-paste hazard" gotcha.

`[OK]` Corroborated against HighLevel primary docs (these looked like the most likely hallucinations and are all correct): base URL; `POST /contacts/upsert` under 2021-07-28 returning `{new, contact, traceId}` — so `extractGhlContactId`'s `body.contact.id` → `body.id` order is right; `POST /contacts/{contactId}/tags` with `{tags:[...]}`; 2023-02-21 is a genuine version with its own docs tree; search returns `opportunities[]`/`meta`/`aggregations`; create with trailing slash and `status: "open"`; pipelines returning `pipelines[].stages[]`; Resend `POST https://api.resend.com/emails` using snake_case `reply_to` with `to`/`cc` as string arrays.

`[OK]` Control flow (`sendLeadToGhl`): missing token/locationId → `status:"skipped"`, no network. Then upsert → tags (if contactId) → opportunity search+create (if `config.createOpportunity && !isNewsletterLead(lead)`). Whole block in one try/catch. `deliverLead()` runs ghl + webhooks + email in `Promise.all`.

`[OK]` **A tag-add failure and an already-open opportunity are BOTH reported as `status: "sent"`** with an explanatory `detail`. Only an upsert non-2xx or a thrown error yields `"failed"`. `hasFailedDelivery` / `missingRequiredDelivery` will not surface partial CRM failures.

### 5.2 CRITICAL — custom-field delivery is UNVERIFIED IN PRODUCTION

`[FIX]` **HIGHEST-RISK ITEM IN THIS SHEET.**

The code sends (`delivery.ts:319-396`):
```ts
customFields: [{ key: "berman_website_lead_ticket_id", field_value: "..." }, ...]
```
**HighLevel's current primary docs for `POST /contacts/upsert` (and create/update contact) document the item as `{ id, key, fieldValue }` — camelCase `fieldValue`.** Four independent lookups (2021-07-28 upsert page, 2021-07-28 create-contact page, current upsert page, search corroboration) all show `fieldValue`. **`field_value` appears in no current primary doc.** Combined with the documented identifier being `id` (the code sends only `key`), **there are two independent reasons all 16 `berman_website_*` custom fields may be silently dropped by GHL today.**

**Before building anything on these fields:**
1. Switch the payload to `fieldValue`.
2. Resolve real custom-field IDs via `GET /locations/{locationId}/customFields` and send `id`.
3. **Add a health check that lists custom fields** — `/api/health/ghl` today checks only pipeline + stage, so a 100% silent custom-field drop looks green.

`[OK]` The 16 key strings and both prefixes are verified as present in code:
`berman_website_lead_*`: `ticket_id`, `source`, `submitted_at`, `reasons`, `reason_values`, `issue_summary`
`berman_website_*`: `preferred_contact`, `visit_type`, `preferred_window`, `requested_date`, `requested_time_window`, `form_acknowledgment`, `sms_consent`, `sms_consent_text`, `source_url`, `user_agent`

`[OK]` **Empty values are not omitted** — `formatValue` writes the literal string `"Not specified"` and `formatYesNo` writes `"Not captured"`. `truncate` default max 2000 (500 for `sourceUrl`/`userAgent`), appending `"..."` at `max-3`.

`[OK]` `berman_website_requested_time_window` holds the **human LABEL** (e.g. `"Morning, 9 AM-12 PM"`), because the route sends `requestedTimeWindowLabel(body.requestedTimeWindow)`.
`[FIX] [REFUTED]` "The raw slug is never delivered anywhere." **It is.** `LeadCaptureModal.tsx:178-183` synthesizes `message` as `... Requested time window: ${form.requestedTimeWindow}` using the **raw slug** whenever the note is empty — the default path, since the modal exposes no UI for that field. That message reaches GHL as `berman_website_lead_issue_summary`, the webhook as `message`, and the Resend email body.

### 5.3 `LeadDeliveryPayload`

`[FIX]` **25 fields, not 24.** Interface at `delivery.ts:8-33`. Required: `ticketId`, `source`, `receivedAt`, `firstName`, `lastName`, `email`, `phone`. All others optional/nullable: `preferredContact`, `visitType`, `preferredWindow`, `requestedDate`, `requestedTimeWindow`, `reasons[]`, `reasonLabels[]`, `message`, `formAcknowledgment`, `formAcknowledgmentText`, `smsConsent`, `consent`, `smsConsentText`, `sourceUrl`, `userAgent`, `conversationId`, `recommendedSpecialty`, `conversationSummary`.

`[OK]` `LeadDeliveryStatus = "sent" | "skipped" | "failed"`. `LeadDeliveryResult = { ghl: ChannelResult; webhook: ChannelResult[]; email: ChannelResult }` — **note `webhook` is an ARRAY**.
`[OK]` `LeadDeliverySource` declares `"website_contact_form"` which is **never emitted**, and does not declare the two sources actually in use (`"website_appointment_request_form"`, `"homepage_berman_brief"` / `"footer_berman_brief"`). The trailing `| string` makes the union non-enforcing.

### 5.4 Existing IDs

`[OK]` **Three unrelated ticketId generators, no shared helper:**
- `app/api/contact/route.ts` → `tkt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,6)}`
- `app/api/newsletter/route.ts` → `nl_${...}`
- `lib/supabase/leads.ts` → `lead_${Date.now().toString(36)}_${rand6()}`; mock-mode fallback `lead_mock_${Date.now()}`. The AI concierge reuses this Supabase row id **verbatim as `ticketId`** (`lib/concierge/tools.ts:187-188`).

`[OK]` **`ticketId` is NOT usable as a dedup or booking key today.** It is generated fresh per POST, **never persisted server-side**, never sent back by the client, never queried. Sinks: JSON response, GHL custom field, opportunity name fallback, webhook body, Resend email, legacy Gravity Forms `input_999`, and UI (`Reference {ticketId}` in the modal; `Reference · {success.ticketId}` on the contact page; the appointment-request page **parses it but never displays it**).

`[OK]` **Idempotency today is entirely GHL-side:** `/contacts/upsert` email/phone matching, plus the open-opportunity search. **Double-submitting creates a second upsert call and a second webhook/email; only the opportunity is suppressed.** The `status=open` search suppresses a second opportunity **indefinitely** — including a genuine second inquiry months later.

`[OK]` **Supabase `leads` is concierge-only and cannot hold a website-form lead as-is:** `conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE`, `conversation_summary TEXT NOT NULL`. No column for `ticketId`, `source`, `reasons`, consent flags, `sourceUrl`, `userAgent`, requested date/time, `preferredContact`, or any GHL id. RLS enabled with **no policies** (service-role only).
`[OK]` **Mock-mode hazard:** with `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` absent, `createLead` persists nothing and returns `lead_mock_${Date.now()}` — but the concierge still hands that id to `deliverLead` as the `ticketId`, so GHL receives a ticket id resolving to no row.

### 5.5 Spam protection — the fake-200 contract

`[OK]` Three checks in `app/api/contact/route.ts`, **all before field validation**, all returning **HTTP 200 `{ok:true, ticketId: makeTicketId()}`** with a throwaway id and silently dropping the lead:
1. **Honeypot** — `body.website` non-empty → `console.warn("[contact-intake-spam-honeypot]")`
2. **Origin** — missing OR not matching `bermansexualhealth.com` / `*.bermansexualhealth.com` / `localhost` / `127.0.0.1` / `*.vercel.app` → `[contact-intake-spam-origin]`
3. **Timing** — `elapsedMs >= 0 && elapsedMs < 1500` → `[contact-intake-spam-timing]`. Client-supplied; **a bot that omits `elapsedMs` entirely (-1) passes.**

`[FIX]` **The missing-Origin drop is deliberate and documented at the check site.** There are two comments; the stale one is at `route.ts:78-82`. The comment at the actual check (`route.ts:328-333`) states current behavior explicitly: *"A foreign OR missing Origin means a script/bot hitting the endpoint directly. Drop it the same quiet way. (The AI concierge does NOT use this route...)"*. `[REFUTED]` "undocumented behavior contradicting the only comment."

> **Consequence for a booking integration:** any consumer treating `200 + ticketId` as "a lead exists in GHL" is wrong for every spam drop, and any booking flow keyed on that id points at nothing. **Any server-to-server caller of `/api/contact` is silently dropped** unless it sets an allowed `Origin`.

`[OK]` **NOT PRESENT ANYWHERE IN THE REPO:** CAPTCHA / reCAPTCHA / Turnstile, HMAC or nonce token, **rate limiting** (grep for `rateLimit`/`ratelimit`/`rate-limit` returns zero hits), IP checks, Referer validation. `middleware.ts` matches only `/admin/:path*` (guarded by a `bermn_admin` JWT cookie).
`[OK]` **`/api/newsletter` has ZERO spam protection** — no honeypot, no origin check, no timing — yet reaches the same `deliverLead()` → GHL contact-upsert path.

`[OK]` Client-side pattern, **byte-identical and copy-pasted in all three forms** (`components/lead/LeadCaptureModal.tsx`, `app/appointment-request/_form-client.tsx`, `app/contact/_contact-client.tsx`): `useState("")` for `website`, `useRef(Date.now())` for `renderedAtRef`, hidden `<div aria-hidden style={{position:"absolute", left:"-9999px", width:1, height:1, overflow:"hidden"}}>` wrapping `<input type="text" name="website" tabIndex={-1} autoComplete="off">`, and `elapsedMs: Date.now() - renderedAtRef.current` in the POST body.

### 5.6 `/api/contact` response contract + routing

`[FIX]` **`next.config.js:2698` sets `trailingSlash: true`.** All three lead forms POST to `"/api/contact"` (no slash), so the deployed request is a **308 redirect to `/api/contact/`** before the handler runs. (Evidence: the newsletter client already posts to `"/api/newsletter/"` with the slash, `app/_home-client.tsx:577`.) Browsers replay POST bodies on 308, but **any server-to-server caller added for the booking integration must follow 308 and preserve the body.** Treat `/api/contact/` as the canonical path.

`[OK]` Responses:
```
200 { ok: true,  ticketId: string }   // real success OR silently-dropped spam
400 { ok: false, error: string }      // validation; message text is user-facing
502 { ok: false, error: "We couldn't send your message. Please call (310) 772-0072." }
503 { ok: false, error: "Online intake is not fully configured. Please call (310) 772-0072." }
503 { ok: false, error: "Online intake is not configured. Please call (310) 772-0072." }
```
`[OK]` Success path order: `deliverLead` → `hasFailedDelivery` (502) → `missingRequiredDelivery` (503) → `hasSentGhl || hasSentWebhook` (200) → `VERCEL_ENV === "production"` ? `submitLegacyGravityForm` → `NODE_ENV === "production"` ? 503 → dev stub 200.
`[OK]` Route config: `export const runtime = "nodejs"; export const dynamic = "force-dynamic";`
`[OK]` **The legacy Gravity Forms fallback is still live code on the success path** — it scrapes `https://bermansexualhealth.com/contact/` for gform hidden fields and POSTs with a DNS lookup **pinned to the hardcoded IP `50.62.141.127`**.

`[OK]` Server validation (400s): `firstName`/`lastName` required; `EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/`; phone digit count ≥ 10; `preferredContact` ∈ {phone,email,either}; `visitType` ∈ {in-person,telehealth,either}; `reasons` non-empty with every value in `REASON_VALUES`; `message` required and ≤ 800 chars; `requestedDate` matches `/^\d{4}-\d{2}-\d{2}$/`; `requestedTimeWindow` ∈ `REQUESTED_TIME_WINDOWS`; `hasFormAcknowledgment(body) = formAcknowledgment === true || consent === true`.

`[OK]` **Reason-slug sets disagree across layers:** the server accepts 9 values **including `body-contouring`**; the modal and contact-page chip lists offer only 8 (**no `body-contouring`**); and **`berman-brief` is a valid `REASON_LABELS`/tagging key but is REJECTED by the `/api/contact` validator** (400 "Invalid reason value") — it only reaches `deliverLead` via `/api/newsletter`.

`[FIX]` `splitName` (`LeadCaptureModal.tsx:83-88`): the `"Not provided"` fallback applies **ONLY to `lastName`**. `firstName` falls back to the **empty string**, which the server rejects with 400 "First name is required". A single-word name succeeds; a whitespace-only name 400s.

### 5.7 Analytics as it exists today

`[OK]` **Exactly ONE custom dataLayer push site-wide** (`components/lead/LeadCaptureModal.tsx:226-237`):
```js
w.dataLayer.push({ event: "lead_submit", lead_source: "website_lead_modal" });
```
`lead_source` is a **hardcoded literal**, not form state. Fired only on the success branch, in `try/catch`, immediately before a **900ms `setTimeout` redirect to `CALENDLY_URL = "https://calendly.com/nataliabermans/30-min-session"`**.

`[OK]` **Nothing fires from** `appointment-request/_form-client.tsx`, `contact/_contact-client.tsx`, the newsletter form in `app/_home-client.tsx`, or any server route. **Three of four intake paths are invisible in GTM/GA today. There is no purchase/booking/appointment event of any kind.**

`[OK]` `app/layout.tsx`: GTM loaded with `const gtmId = process.env.NEXT_PUBLIC_GTM_ID?.trim() || "GTM-WT38TW7"` — **hardcoded production container fallback; GTM loads on every environment including local/preview.** `NEXT_PUBLIC_GTM_ID` is read by code but is **NOT in `.env.local.example`.**
`[OK]` GA4 is separate and optional via `NEXT_PUBLIC_GA_MEASUREMENT_ID`, pushing `gtag("consent","default",{ad_storage:"denied", ad_user_data:"denied", ad_personalization:"denied"})`, then `js`, then `config` with `allow_google_signals: false, allow_ad_personalization_signals: false`.

> **Note vs §3/§4:** the existing GA4 config already denies ad storage/user-data/personalization by default and disables Google Signals — consistent with the §4 constraints. Any change to those defaults is a policy decision, not a tracking tweak.

### 5.8 Compliance drift risk in the forms

`[OK]` **The A2P SMS consent paragraph is hand-written as JSX in all three forms**, while `SMS_CONSENT_TEXT` in `lib/leads/a2p.ts` is used **server-side only** (attached to the payload and to legacy Gravity Forms `input_10.2`). Only `FORM_ACKNOWLEDGMENT_TEXT` is actually imported and rendered. **Editing the constant changes what is recorded as consent text in GHL without changing what the user actually saw.**

`[OK]` `lib/leads/a2p.ts` exports: `BERMAN_SMS_PROGRAM_NAME = "JRB Medical Wellness"`, `FORM_ACKNOWLEDGMENT_TEXT`, `SMS_CONSENT_TEXT`, `REQUESTED_TIME_WINDOWS` = `first-available` | `morning-9-12` | `midday-12-2` | `afternoon-2-5`, `requestedTimeWindowLabel()`.

`[OK]` **LeadCaptureModal carries `visitType`, `requestedDate`, `requestedTimeWindow` in state with NO UI**, so every modal lead reports `visitType: "either"`, empty `requestedDate`, `requestedTimeWindow: "first-available"` — values that look collected but are defaults.
`[OK]` The appointment-request form sends everything hardcoded: `preferredContact:"either"`, `reasons:["not-sure"]`, `visitType:"either"`, `preferredWindow:""`, `requestedDate:""`, `requestedTimeWindow:"first-available"`, `message:"Submitted via the website appointment-request form."`, `source:"website_appointment_request_form"`.
`[OK]` `appointment-request` never resets `submitting` on success (`setSubmitting(false)` exists only in the catch at `:127`).

### 5.9 Env vars

`[FIX]` **`.env.local` is NOT committed** — `.gitignore:5-7` ignores `.env` / `.env.*` and un-ignores only `.env.local.example`; `git ls-files --error-unmatch .env.local` fails. **It is not blank:** 5 values are populated locally — `LEAD_DELIVERY_REQUIRE_GHL=true`, `LEAD_DELIVERY_CREATE_GHL_OPPORTUNITY=true`, `LEAD_DELIVERY_REQUIRE_WEBHOOK=false`, `LEAD_DELIVERY_REQUIRE_EMAIL=false`, `NEXT_PUBLIC_SITE_URL=https://bermansexualhealth.com`. Only secrets/ids are blank. **The `GHL_BERMAN_*` alias is the one present in both `.env.local` and `.env.local.example`.**

`[OK]` Each GHL var read via `envValue(...names)` — **first non-blank wins, both aliases supported:**
`GHL_BERMAN_API_TOKEN | BERMAN_GHL_API_TOKEN`; `GHL_BERMAN_LOCATION_ID | BERMAN_GHL_LOCATION_ID`; `GHL_BERMAN_PIPELINE_ID | BERMAN_GHL_PIPELINE_ID`; `GHL_BERMAN_PIPELINE_STAGE_ID | BERMAN_GHL_PIPELINE_STAGE_ID`.

`[OK]` Flags (`envFlag`: `"1"/"true"/"yes"/"on"` → true; `"0"/"false"/"no"/"off"` → false; else undefined):
`LEAD_DELIVERY_CREATE_GHL_OPPORTUNITY` (default true); **`LEAD_DELIVERY_REQUIRE_GHL` (default `process.env.VERCEL_ENV === "production"`)**; `LEAD_DELIVERY_REQUIRE_WEBHOOK` / `LEAD_DELIVERY_REQUIRE_EMAIL` (must be `=== true`, default false).

`[OK]` Webhooks (both POSTed, deduped): `GHL_LEAD_WEBHOOK_URL`, `CONTACT_INTAKE_WEBHOOK_URL`. Body: `{ event: "berman.website_lead.created", ...lead, lead }` — **the lead is spread AND nested.**
`[OK]` Email (Resend): `RESEND_API_KEY`, `LEAD_NOTIFICATION_FROM`, `LEAD_NOTIFICATION_TO` (split on `/[;,]/`), `LEAD_NOTIFICATION_CC` (omitted from the request when empty).
`[OK]` Client analytics: `NEXT_PUBLIC_GTM_ID`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`, `NEXT_PUBLIC_SITE_URL`.
`[OK]` Supabase: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (both missing → mock mode).

### 5.10 GHL version-pinning risk

`[FIX]` **Not in the original findings; bears directly on this build.** HighLevel now publishes **v3 (released 2026-06-11)**, the **2023-02-21 create-opportunity page is marked deprecated** (*"may be replaced or removed in future versions"*), and **under v3 the search endpoint changed to camelCase** (`locationId` required, `pipelineId`, `contactId`) while 2023-02-21's *advanced* search is a POST with a JSON body.

> **Bumping `GHL_OPPORTUNITY_API_VERSION` without rewriting `findExistingGhlOpportunity` breaks the dedup search — and because a search throw is caught as `status: "failed"`, that would 502 patients whenever `LEAD_DELIVERY_REQUIRE_GHL` is true (its production default).**

### 5.11 Minor unflagged wire risk

`[FIX]` `/api/newsletter` builds a lead with `phone: ""` and `visitType: null` and sends it straight to `POST /contacts/upsert`. **HighLevel's behavior for a blank phone string could not be corroborated** — it may reject or ignore. The "unguarded door into the same CRM" concern may in practice be a door that 4xxs. **Worth an actual test call before relying on it either way.**

---

## 6. UNRESOLVED — must be verified against a live token / live account before implementation

Nothing below may be treated as a contract. Each item names what to run.

### 6.1 Calendly — Scheduling API

| # | Unknown | How to close |
|---|---|---|
| C1 | **Status code when a slot is consumed between availability check and POST.** Only the agent-guide row "Not found (event type or time slot) → 404" exists. 404 vs 400 for a concurrently-taken slot is undocumented. | Sandbox race test before writing retry logic. |
| C2 | **Status code for an off-grid `start_time`.** The *requirement* is documented; the failure code is not. | Empirical. |
| C3 | **Which scope truly gates `GET /event_type_available_times`** — `availability:read` (endpoint page + OpenAPI) vs `event_types:read` (Scopes catalog). `[CONFLICT]` | Mint a PAT with only one, call the endpoint. Meanwhile request both. |
| C4 | **Must `questions_and_answers[].position` equal `custom_questions[].position`,** or is it a display-order hint? | Live POST with a mismatched position. |
| C5 | **`multi_select` answer encoding** in the single `answer` string (comma? newline?) and whether `include_other` needs special handling. | Live event type test. **Prefer a `text`/`string` question for reason-for-visit to avoid this entirely.** |
| C6 | **Is the built-in Calendly prompt "Please share anything that will help prepare for our meeting" exposed in `custom_questions[]`** and therefore addressable, or must a dedicated custom question be created? | `GET /event_types/{uuid}` against the live event type. |
| C7 | **Do the Create Event Invitee per-minute / per-hour / per-day caps apply simultaneously or as tiers?** Listed as three rows for the same tier without stating interaction. | Support ticket or empirical. Assume all three enforced. |
| C8 | **Is a `Retry-After` header sent on 429 for this endpoint**, or only the `X-RateLimit-*` trio? | Empirical. |
| C9 | **Is a Trial account the same as "Free plan" for the 403 gate?** The rate-limits table grants Trial 5 req/day (implying it works); the endpoint page says Free plan gets 403. `[CONFLICT]` | Only matters if the practice is on trial. Check plan first. |
| C10 | **Which paid tier the practice is actually on**, and whether `POST /invitees` returns 201 for it. | Live PAT smoke test. **Do this first — it gates everything.** |
| C11 | **The exact `custom_questions[].name` strings on the live booking event type**, byte-for-byte. | `GET /event_types/{uuid}`. Read at runtime, never hardcode. |
| C12 | **The live event type's configured `location` kind and pooling_type** (round_robin?), which determines whether `location` must be sent, omitted, or carry a sibling string. | `GET /event_types/{uuid}`. |

### 6.2 Calendly — webhooks

| # | Unknown | How to close |
|---|---|---|
| W1 | **Checkbox / multi-select answer serialization in `questions_and_answers[].answer`.** The newline-delimited claim is `[REFUTED]` as documented — **no Calendly primary source says it.** May be true empirically. | Real test booking with a checkbox question. **Do not ship it as a verified contract detail on a medical booking flow.** |
| W2 | **Exact retry back-off schedule** (first delay, growth factor, max attempts). Only "exponential back-off over 24 hours" is stated. | Support ticket or observed. Establish before go-live. |
| W3 | **Maximum webhook subscriptions per organization / user / group.** Not documented anywhere in the portal, the OpenAPI spec, or the help center. | Empirical or support ticket if planning many. |
| W4 | **Whether webhook deliveries consume the per-user API rate-limit budget.** The Rate Limits page covers inbound calls only. | Support ticket. |
| W5 | **Whether Calendly delivers from a fixed publishable set of source IPs** for firewall allowlisting. | Support ticket. |
| W6 | **Whether more than one `v1=` signature can appear during signing-key rotation** (Stripe-style dual signing). Documented format shows a single `v1=`. | Parse defensively — accept multiple `v1=` values now. |
| W7 | **Maximum webhook body size, or a cap on `questions_and_answers` entries per invitee.** | Not documented. |
| W8 | **Whether UTM values are captured when booking happens through an EMBED with params on the parent page** rather than on the Calendly URL itself. The help center covers embed UTM tracking separately; the guarantee is not stated in the API docs. | **Decision-critical if the booking is embedded rather than a redirect.** Test. |
| W9 | **Whether the POST `events` enum genuinely rejects `event_type.*`**, given the doc table and payload enums include it. (Not needed for booking; note for completeness.) | Live API. |
| W10 | **The plan-requirement conflict for webhooks** — developer FAQ "Standard, Teams, or Enterprise" vs help center's six-plan list. `[CONFLICT]` | Resolve against the practice's actual plan. |

### 6.3 Meta

| # | Unknown | How to close |
|---|---|---|
| M1 | **What data-source CATEGORY Meta has assigned this practice's dataset**, and **which restriction tier is active** (Core Setup / standard-event restriction / full restriction). **This determines whether the integration is viable at all.** | Events Manager → data source settings. **Check BEFORE writing integration code.** Note: a Meta-assigned category cannot be changed by the advertiser (per uncorroborated Help Center text) — only a re-review can be requested. |
| M2 | **Whether `Schedule` specifically is blocked for this dataset.** Meta describes the restriction tier only as "specific mid and lower funnel events" and does not publish the list. Third-party healthcare writeups report `Schedule`, `Purchase`, `Lead`, `AddToCart`, `FindLocation` as blockable — **unconfirmed by Meta.** | Events Manager, or empirically via the Test Events tool (**with synthetic data — test events are live traffic**). |
| M3 | **The Help Center health text itself.** Every `facebook.com/business/help/*` URL is client-rendered and returns only its page title to a fetcher. The enumerated prohibited-info list, the three restriction-tier definitions, the Core Setup strip behavior, the "Health and wellness" category definition, and the Meta-assigned-category rule **could not be verified against the primary page.** | Read them in a browser session. Until then, rely only on the Business Tools Terms (§1.h, naming clause, §3.b), which were verified word for word. |
| M4 | **Whether the practice's booking URLs can be made condition-neutral.** If the site's IA routes bookings through condition-specific paths, that is a **website change, not a tracking change**, and it gates the whole integration. | Site audit. See §4.3 item 3. |
| M5 | **Whether Limited Data Use applies** — `data_processing_options`, `data_processing_options_country`, `data_processing_options_state` were not researched. Review for the relevant US states before launch. | Meta LDU docs + counsel. |
| M6 | **Meta advertising restrictions on the CREATIVE and targeting**, a separate policy surface from the Business Tools Terms. Meta's Health and Wellness ad standards require 18+ targeting for sexual and reproductive health ads and restrict certain claims. Not researched in depth. | Ads policy review. |
| M7 | **Legal sign-off on whether sending ANY identified booking event from a sexual-health practice is acceptable** under HIPAA and state health-privacy law, given Meta is not a business associate. A defensible conservative design exists (upper-funnel only, no identified conversion events) that trades measurement for risk. | **Practice's counsel. This is a business decision, not an engineering one.** |
| M8 | Which Graph API version to pin — v25.0 (long runway to 2028-07-29, matches doc examples) or v26.0 (current, released 2026-07-29). Both defensible; **pick one explicitly, do not carry this to launch.** | Decision, not research. |

### 6.4 Google

| # | Unknown | How to close |
|---|---|---|
| G1 | **Whether this account can be allowlisted for the Data Manager API multi-source conversions beta.** Without it, the single-conversion-action architecture is impossible and the fallback is two separate conversion actions with no cross-action dedup — **a substantial architecture change.** | Google Ads rep / allowlist request. **Resolve before designing the conversion pipeline.** |
| G2 | **Whether `ClickConversion.order_id` is accepted in combination with `gbraid` / `wbraid`.** Only the custom-variables restriction is documented. | `validate_only: true` against the API before relying on dedup for iOS traffic. |
| G3 | **Whether GCLID-only offline import is permissible for a sensitive-category advertiser.** `[INFER]` The enhanced-conversions/store-sales prohibition is narrow and explicit, but the same page carries the unqualified *"You may not upload conversion information related to sensitive categories."* **No Google page reviewed states GCLID-only import is exempt.** | **Legal/policy review + written confirmation from a Google rep. Do not present as documented-safe.** |
| G4 | **Whether GA4 Measurement Protocol conversions can be imported into Google Ads for a health advertiser** without tripping the sensitive-category restriction. Note the multi-source page separately rules out the GA4-import route for that feature: *"Imported Google Analytics conversions: This feature is currently designed specifically for Google Ads web tags."* | Legal/policy review before linking GA4 to Ads for conversion import. |
| G5 | **Exact deduplication lookback for `transaction_id` matching.** Partly documented — the 55-day cap on value updates and the "upload within 24 hours" guidance are real — but no general dedup lookback is stated for either Ads or GA4. | Upload as soon as possible after the tag event; do not rely on an assumed window. |
| G6 | **Maximum retention period for a stored gclid before upload.** The 90-day cookie is *implementation guidance*, not a stated policy maximum. | Set by the clinic's own data-protection assessment. |
| G7 | **Whether Google server-side scans conversion action names / `item_name` for sensitive-category violations, or whether enforcement is complaint/audit driven.** No documentation found. | Treat neutral-payload discipline as mandatory regardless. |
| G8 | **Whether UK traffic is treated as EEA for Consent Mode v2 enforcement** post-Brexit. Not addressed in the Google docs reviewed. | Clinic's DPO. |
| G9 | **The actual GS2 `_ga_<container-id>` cookie structure**, if cookie parsing is ever unavoidable. **Google has never documented either the GS1 or GS2 value structure.** | **Do not parse. Use `gtag('get', ...)`.** Listed only so nobody re-invents the parser. |

### 6.5 Repo / integration

| # | Unknown | How to close |
|---|---|---|
| R1 | **Are the 16 `berman_website_*` custom fields actually provisioned in the live GHL location, and does GHL match on `key` as the code assumes — with `field_value` rather than the documented `fieldValue`?** `[FIX]` **Two independent reasons all 16 may be silently dropped today.** | `GET /locations/{locationId}/customFields`. Then a live upsert + read-back. **Highest-priority verification in this sheet.** |
| R2 | **Is there any GHL custom field intended to hold a booking/appointment id?** None of the 16 covers appointment time, calendar id, or booking status; `berman_website_requested_date` / `_time_window` are free-text requests only. | Design decision + GHL field provisioning. |
| R3 | **Where is Calendly↔GHL correlation expected to live?** Calendly (`https://calendly.com/nataliabermans/30-min-session`) is the actual booking step after the modal, but **nothing in this repo receives a Calendly webhook or correlates a booking back to the `tkt_*` ticket id or the GHL contact.** | Architecture decision. This is the core gap the booking integration must fill. |
| R4 | **Does the GHL location have workflows keyed on `berman-website-lead` / `website-form-lead` / `sms-consent-yes` tags or on the pipeline stage?** `.env.local.example` advises preferring GHL workflow triggers over Resend for staff notification, implying automations exist outside this repo. **Changing tags could break invisible automations.** | GHL account audit. |
| R5 | **Is `LEAD_DELIVERY_REQUIRE_GHL` explicitly set in Vercel production, or relying on the `VERCEL_ENV === "production"` default?** Determines whether a GHL outage returns 502 to the patient or silently falls through to legacy Gravity Forms. | Vercel env inspection. |
| R6 | **Is the legacy Gravity Forms fallback (`bermansexualhealth.com` pinned to `50.62.141.127`) still expected to work**, or is it dead code to be treated as an always-failing branch? | Test / product decision. |
| R7 | **Should website-form leads be persisted server-side at all today?** Only concierge leads reach Supabase, and `leads.conversation_id NOT NULL` FK makes the table unusable for form leads without a schema change. **A booking-intent table is a prerequisite for Calendly idempotency (§1.6).** | Schema decision. |
| R8 | **Intended dedup window and key for a booking / reschedule** — email, phone, ticketId, or a new idempotency key? The current open-opportunity search suppresses a second opportunity **indefinitely** (`status=open`), which also suppresses a genuine second inquiry months later. | Design decision. |
| R9 | **Is the fake-200 spam response contract (200 + throwaway ticketId) already depended on downstream**, or can dropped submissions be given a distinguishable response? | Consumer audit. |
| R10 | **HighLevel's behavior for `phone: ""` on `POST /contacts/upsert`** (the `/api/newsletter` path). Could not be corroborated — may reject or ignore. | Test call. |
| R11 | **Which GHL API version to target going forward**, given v3 (2026-06-11) exists and 2023-02-21 create-opportunity is deprecated with a camelCase search signature change in v3. | Migration decision. **Do not bump the constant without rewriting `findExistingGhlOpportunity`.** |

### 6.6 Ordered gate list (what blocks what)

1. **M1** (Meta dataset category + restriction tier) and **G1** (Data Manager allowlist) — these two determine whether the conversion-tracking design in §3 is buildable at all. Check before any code.
2. **M7 / G3** (legal sign-off on identified conversion events and on GCLID-only upload) — determines whether identified conversions are sent at all.
3. **M4** (condition-neutral booking URLs) — a website IA change, not a tracking change; gates `event_source_url`.
4. **C10** (live PAT + paid plan smoke test on `POST /invitees`) — gates the entire Calendly booking path.
5. **R1** (GHL custom-field delivery actually working) — gates any data flowing back into the CRM.
6. **R3 / R7 / R8** (Calendly↔GHL correlation, booking-intent persistence, dedup key) — the architecture the spec must define, and the prerequisite for Calendly's absent idempotency.