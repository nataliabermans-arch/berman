# Berman Booking Integration — Design

**Date:** 2026-08-28
**Status:** Design approved in principle; blockers open (see §9)
**Companion:** `2026-08-28-booking-api-contract-sheet.md` (verified API contracts)

## 1. Goal

Replace the current "capture lead → redirect to Calendly" handoff with a native
in-page booking flow that writes to Calendly and GoHighLevel reliably, and that
reports booking conversions to GA4, Google Ads and Meta accurately enough to
optimise ad spend.

The measurement goal is the primary business driver: unattributed bookings mean
wasted ad budget.

## 2. Verified live facts

Confirmed against the production Calendly account on 2026-08-28 with a PAT.

| Fact | Value |
|---|---|
| Account | Jennifer Berman, org `747edd2e-…ba47` |
| Event types | **Exactly one** |
| Event type URI | `.../event_types/af8b9d05-5d98-43e0-98c9-6a348e27f587` |
| Duration | **15 min** (slug `30-min-session` is a stale rename, not a bug) |
| Location | `physical`, Beverly Hills — "a patient coordinator will call you" |
| Availability endpoint | Working; returned 8 slots over 7 days |
| `POST /invitees` | **201 verified live** — booked, read back, cancelled 2026-08-28 |
| Paid-plan gate | Satisfied (the 201 proves it) |
| Cancellation | `POST {event}/cancellation` → 201, status `canceled`, attributed to host |

### 2.0 `POST /invitees` gotchas — learned from a live booking, not from docs

1. **`tracking` requires all six keys present**, nullable: `utm_campaign`,
   `utm_source`, `utm_medium`, `utm_content`, `utm_term`, `salesforce_uuid`.
   A partial object returns 400 and books nothing.
2. **`location` is mandatory** despite being absent from the schema's `required`
   list, and must match a kind configured on the event type. `physical` also
   requires the sibling address string. Omitting it returns
   `invalid_location_choice`.
3. **`salesforce_uuid` is settable via the API and round-trips**, so the consult
   ID belongs there — no need to consume `utm_content`. (It is *not* settable via
   URL param on a scheduling link; API only.)
4. `answer` is a **string** even for `multi_select`.
5. `start_time` must be byte-copied from an availability `collection[].start_time`.

### 2.1a Custom questions are READ-ONLY via API

`PATCH /event_types/{uuid}` accepts only `active`, `name`, `color`,
`description`, `duration`, `duration_options`, `locale`, `locations`.
`custom_questions` is **not in the schema**, and `required: []` means an empty
body validates — so a PATCH carrying `custom_questions` returns **200 and
silently changes nothing**. Verified against the published OpenAPI spec and twice
against the live account.

Consequence: choice-list changes must be made in the Calendly UI by a human.
Reading question strings at runtime (§2.1) still works — only writes are blocked.

### 2.1 Custom questions — must match byte-for-byte

`POST /invitees` requires each `questions_and_answers[].question` to equal the
event type's `custom_questions[].name` **exactly, case-sensitively**. Read these
at runtime; do not hardcode — an admin renaming a question in the Calendly UI
silently breaks every booking with a 400.

| # | Question (verbatim) | Type | Required |
|---|---|---|---|
| 0 | `Please share anything that will help prepare for our meeting` | text | no |
| 1 | `Please enter your phone number so that we can confirm your consultation` | phone_number | **yes** |
| 2 | `Services your are interested in (please select at least one)` | multi_select | **yes** |

Question 2 contains the typo `"Services your are"`. It must be sent verbatim.

Fixed answer choices for Q2: `Anti-Aging Treatments`, `Vaginal Rejuvenation`,
`Hormones`, `Skin Tight`, `Weight loss`, `Menopause & Perimenopause`,
`Body Sculpting, Fat Melting, Cellulite Treatment`, `Sexual & Urinary Tract Health`

## 3. Decisions

| # | Decision | Rationale |
|---|---|---|
| D1 | Native booking via `POST /invitees` | One flow, no redirect |
| D2 | Full detail on the calendar entry | Approved by the practice; exposure accepted knowingly |
| D3 | One shared `BookingFlow` for modal + `/appointment-request`; delete orphaned `ContactForm.tsx` | ~1,000 lines currently duplicate the same intake |
| D4 | Browser **and** server-side conversion reporting | Recovers the 20–40% that ad blockers eat |
| D5 | Irreversible step last; no rollback | Calendly's invitee email cannot be disabled, so cancel-after-book produces confirm-then-cancel whiplash |
| D6 | Two **separate** Google Ads conversion actions | Cross-action dedup is impossible; Data Manager multi-source is allowlist-only |
| D7 | Flat conversion value | A per-procedure value fingerprints the procedure |
| D8 | Clinical detail never enters `dataLayer` | Mechanical guarantee rather than a policy promise |

## 4. Architecture

```
components/booking/
  BookingFlow.tsx        shared by both surfaces
  TimeSlotPicker.tsx     live availability
  useBookingTracking.ts  dataLayer emitter (non-clinical only)

GET  /api/booking/availability   proxies Calendly; token never client-side
POST /api/booking                the middleware
POST /api/booking/webhook        invitee.created / invitee.canceled
```

### 4.1 Ordering — the irreversible step is last

```
1. mint CONSULT_ID, persist booking_intent       reversible
2. GHL contact + opportunity, tagged pending-booking
     fail -> STOP. nothing booked, no email,
             no phantom appointment.
3. POST /invitees                                 irreversible; sends email
     404         -> slot gone; refresh, re-pick
     timeout/5xx -> DO NOT blind-retry (see §5)
4. GHL -> confirmed + booked time
5. fire conversions server-side; return id for dataLayer
6. webhook reconciles; invitee.canceled syncs GHL
```

Step 2 before step 3 is the core of D5: everything that can fail happens before
the one thing that cannot be undone.

**Prerequisite outside the code:** any GHL workflow that notifies on contact
creation must be gated on the `confirmed` tag, or GHL notifies the patient
before the booking exists.

## 5. Idempotency — Calendly has none

Verified by full-text search of the published OpenAPI spec: no `Idempotency-Key`,
no client-supplied request id, no `409` on `POST /invitees`. A retried timeout
can double-book a patient. Protection must be ours.

New table `booking_intents`:

```
consult_id      text primary key
email           text
event_type_uri  text
start_time      timestamptz
status          pending | booked | failed
calendly_uri    text null
gclid, gbraid, wbraid, fbc, fbp   text null
created_at, updated_at
unique (email, start_time) where status in ('pending','booked')
```

Timeout path: leave the row `pending`, then query
`GET /scheduled_events?invitee_email=&min_start_time=` to establish whether the
booking landed. Adopt it if so; retry only if it did not.

`leads.conversation_id` is `NOT NULL` with an FK, so the existing `leads` table
cannot hold form leads. This is a new table, not a reuse.

## 6. The consult ID

One identifier, minted server-side, **replacing** the existing `ticketId` — which
today is generated per POST, never persisted server-side, and never queried.

| Destination | Field |
|---|---|
| Supabase | `booking_intents.consult_id` |
| GHL | custom field + opportunity name |
| Calendly | `tracking.salesforce_uuid` — **verified round-trip on the live account**. Send all six `tracking` keys (nulls where unused). Leaves `utm_*` free for real campaign data. |
| Webhook | returned in `payload.tracking` |
| Confirmation UI | `Reference {id}` (already rendered today) |
| GA4 | `transaction_id` |
| Meta | `eventID` browser (camelCase) / `event_id` server (snake_case) |
| Google Ads | `order_id` |

Must be random: transaction IDs must not encode anything identifying.

## 7. Tracking

Emit rich to `dataLayer`; GTM (`NEXT_PUBLIC_GTM_ID`, already wired) is the
allowlist boundary. Server-side calls bypass GTM with an in-code allowlist.

Funnel events: `booking_form_open`, `booking_step_complete`,
`booking_availability_shown`, `booking_slot_selected`, `booking_submitted`,
`booking_confirmed`, `booking_failed{reason}`. No clinical fields on any of them.

`booking_submitted → booking_confirmed` is the integration health metric and
should alert when it drops.

**Meta:** standard event `Schedule` — condition-neutral; health-named custom
events are auto-blocked on the name alone. The event name lives in one shared
constant used by both the server payload and the `fbq` call, since the two must
match byte-for-byte.

**Google Ads (D6):**

- `Booking` — website tag, reporting only
- `Consult Attended` — `UPLOAD_CLICKS`, **in bidding**, uploaded when staff move
  the GHL opportunity to Attended
- Only one may be in bidding, or every booking counts twice
- Enhanced Conversions **off**, `user_identifiers` empty — prohibited for
  sensitive categories
- Auto-tagging must be ON or offline import silently does nothing

Click IDs (`gclid`; `gbraid` — case-sensitive, must not be normalised; `wbraid`)
are captured at landing, persisted 90 days, and stored on `booking_intents`.
Without this the attendance stage silently degrades to stage one.

## 8. Policy constraints — enforced in code

Never sent to any ad platform, on any surface: service or procedure names, reason
for visit, condition-bearing URL paths, per-procedure values, health-named custom
events or conversion actions, hashed identifiers to Google Ads, or remarketing
audiences derived from booking behaviour.

Booking confirmation must live at a condition-neutral URL. A CI test asserts that
no clinical field name appears in any `dataLayer` push or CAPI payload.

**Legal.** Meta is not a HIPAA business associate. Sending identified conversion
events from a clinical booking flow is the pattern targeted by the 2022–24 pixel
litigation against US health systems. A conservative variant — upper-funnel
events only, no identified conversion events — exists and trades measurement for
exposure. That is a decision for the practice's counsel, not for this integration.

## 9. Blockers

| # | Blocker | Blocks |
|---|---|---|
| B1 | **Reason taxonomy mismatch** (§9.1) — resolution requires a **manual Calendly UI edit**, since custom questions are read-only via API (§2.1a) | The booking call itself — Q2 is required |
| ~~B2~~ | ~~GHL custom fields may be silently dropped~~ — **DISPROVEN 2026-08-28.** See §9.2 | — |
| ~~B3~~ | ~~Live `POST /invitees` smoke test~~ — **RESOLVED 2026-08-28.** Booked, verified, cancelled. Findings in §2.0 | — |
| B4 | Meta dataset category / restriction tier unknown | Whether the §7 Meta design is permitted at all |
| B5 | Legal sign-off on identified conversion events | Whether conversions are sent at all |

### 9.1 The taxonomy mismatch

The site collects 9 reason values; Calendly's required multi_select offers 8
different ones, and they do not map cleanly:

- `berman-supplements` and `not-sure` have **no** Calendly equivalent, yet the
  question is required
- `sexual-health` and `pelvic-urinary` both collapse to `Sexual & Urinary Tract Health`
- Calendly's `Skin Tight` and `Weight loss` have no site equivalent

**Decision: union.** The site's 8 labels become canonical (identity mapping, no
drift), and the Calendly-only services with no site equivalent are preserved so
nothing disappears from the public booking page. Target list, in order:

```
Hormone Replacement Therapy
Sexual health
Pelvic Floor and Urinary Tract Health
Vaginal rejuvenation
Aesthetic and Regenerative Care
Menopause and Perimenopause Care
Supplement and Peptide
Skin Tight
Weight loss
Body Sculpting, Fat Melting, Cellulite Treatment
I am not sure yet
```

`Anti-Aging Treatments` folds into `Aesthetic and Regenerative Care`.

**This must be entered by hand in the Calendly UI** — custom questions are
read-only via the API (§2.1a). Until it is done, the middleware needs a mapping
table with a documented fallback, because Q2 is required and `not-sure` /
`berman-supplements` have no valid Calendly value today.

Note: `body-contouring` exists in the site's `ReasonValue` union but is absent
from the rendered `REASONS` array — dead value; drop it or render it.

### 9.2 The GHL custom-field defect was not real

The contract sheet flagged as its highest-risk item that `delivery.ts` sends
`{ key, field_value }` while HighLevel's current docs document
`{ id, key, fieldValue }`, and concluded all 16 `berman_website_*` fields might
be silently discarded.

**Checked against the live location `xQCmrK9PJ28esCZ9SxzZ` on 2026-08-28:**

- all 16 fields exist in GHL (87 custom fields defined in total)
- three of the most recent website contacts carry populated values —
  `berman_website_lead_ticket_id`, `..._submitted_at`,
  `..._requested_time_window`, `..._requested_date`, `..._visit_type`,
  `..._user_agent`

GHL accepts the snake_case `field_value` form with `key` alone. **No fix is
needed and none should be applied** — "correcting" the payload to `fieldValue`
risks breaking something that demonstrably works.

Lesson worth keeping: the documentation-versus-implementation mismatch was real,
but the inference drawn from it was wrong. One live call settled what four doc
lookups could not.

Related: the site collects `visitType` (in-person / telehealth / either), which
this event type cannot express — it has one fixed physical location.

## 10. Testing

- Contract tests against recorded fixtures for Calendly, GHL and Meta — catches
  field-name drift of exactly the kind B2 describes
- Explicit timeout test: assert query-then-adopt, never blind retry, and that
  exactly one booking exists afterwards
- CI leak test: no clinical field name in any tracking payload
- Live smoke test: book and cancel one real slot before go-live

## 11. Out of scope

Rewriting `lib/leads/delivery.ts` beyond the custom-field fix; `/api/newsletter`
spam hardening and repo-wide rate limiting (both real gaps, logged separately);
the AI concierge path.
