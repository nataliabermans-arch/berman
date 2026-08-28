# Deploy requirements — native booking

**Read before merging `feat/booking-integration` to `main`.**

Merging deploys to `bermansexualhealth.com` automatically. The booking form
replaces the old "capture lead, then redirect to Calendly" flow with one that
books the consult in place. It needs configuration that does not exist in the
production environment yet.

**If these are missing, online booking breaks.** The current flow works today;
deploying without them is a regression, not an improvement.

## 1. Vercel environment variables

Project `berman-s-projects/berman`. Set for **Production** and **Preview**.

| Variable | Required | Notes |
|---|---|---|
| `CALENDLY_API_TOKEN` | **yes** | Calendly Personal Access Token. Needs scopes `scheduled_events:write`, `availability:read`, `event_types:read`. Without it the time picker cannot load and nobody can book. |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | **yes** | reCAPTCHA v2 site key. |
| `RECAPTCHA_SECRET_KEY` | **yes** | reCAPTCHA v2 secret key. |
| `BOOKING_SESSION_SECRET` | **yes** | 32 random bytes, generated fresh for production: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `CALENDLY_EVENT_TYPE_URI` | no | Defaults to the correct 15-minute event type. Set only to point at a different one. |

The existing `GHL_BERMAN_*` variables are already configured and unchanged.

## 2. reCAPTCHA allowed domains

In the reCAPTCHA admin console for this site key, the domain list **must**
include `bermansexualhealth.com`. The key is domain-restricted: if the
production domain is absent, the widget refuses to run and **every booking is
blocked at the first screen**.

Add also, as needed:
- the Vercel preview hostname, to test before merging
- `localhost`, for local development

## 3. Calendly — one manual edit

The site offers 8 reasons for visit; the Calendly event type's required
multi-select offers 8 different ones. The middleware maps between them, so
booking works either way, but aligning them removes the mismatch.

Custom questions are **read-only via the Calendly API** — this must be done by
hand in the Calendly UI. Target list for
"Services your are interested in (please select at least one)":

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

Leave the question's title unchanged, typo included — the code matches it
byte-for-byte and reads it at runtime.

## 4. GoHighLevel

The booking writes the CRM contact **before** it books the consult, so a CRM
failure cannot leave a phantom appointment on the calendar. The contact is
created carrying the consult reference.

If any GHL workflow notifies the patient on contact creation, gate it so it
fires on the booking being confirmed rather than on contact creation —
otherwise GHL messages people whose booking has not completed yet.

## 5. Verifying after deploy

```
curl https://bermansexualhealth.com/api/health/ghl
    -> {"ok":true, ... "pipeline":"Marketing Pipeline","stage":"New Leads"}

curl https://bermansexualhealth.com/api/booking/availability/
    -> {"ok":true,"slots":[...]}      slots present = Calendly wired
    -> {"ok":false} / 503             CALENDLY_API_TOKEN missing
```

Then book one real consult through the site and cancel it in Calendly. Use a
throwaway address such as `you+bookingtest@gmail.com` — GHL upserts contacts by
email, so testing with a real address **overwrites that person's CRM record**.

## Rollback

Production before this work: commit `5d1270a05ba65a0ec05df13c0a32bd86277a4549`,
tagged `pre-booking-deploy`. Reverting `main` to it restores the previous
booking flow; Vercel redeploys automatically. No database migration is involved,
so rollback is clean.
