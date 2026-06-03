# GHL Intake Runbook

## What Broke On 2026-05-28

The public form was working in the browser: it posted to `/api/contact/` and
returned success. The failure was downstream.

The production Vercel env keys for `GHL_BERMAN_API_TOKEN`,
`GHL_BERMAN_LOCATION_ID`, and `LEAD_DELIVERY_REQUIRE_GHL` existed, but had blank
values before the repair. Because the app treated a blank
`LEAD_DELIVERY_REQUIRE_GHL` as an explicit false value, the route could report
success without required direct GHL delivery.

There was a second mismatch: direct GHL delivery only upserted a contact and
tags. Staff expected a visible lead in the GHL pipeline, so the website now also
creates an open opportunity in `Marketing Pipeline` / `New Leads`.

## Before Production Deploys

Run:

```bash
npm run typecheck
npm run build
npm run verify:ghl -- --live-url https://bermansexualhealth.com
```

The GHL check does not create a lead. It verifies:

- the deployed app can see nonblank production GHL env values
- GHL auth can read the configured location from the deployed runtime
- the Marketing Pipeline / New Leads stage exists
- the live contact API exists and rejects an invalid payload correctly

## Full End-To-End Check

Only run this when you intentionally want a diagnostic test lead in GHL.

Submit a clearly marked test lead through `/api/contact/`, then verify both:

- a GHL contact exists with `berman-website-lead` and `website-form-lead`
- an open opportunity exists in Marketing Pipeline / New Leads

Use a reserved test email and `555` phone number, and include
`DIAGNOSTIC TEST - PLEASE IGNORE` in the message.

## Vercel Env Values

Required production env:

```bash
GHL_BERMAN_API_TOKEN=<secret>
GHL_BERMAN_LOCATION_ID=<secret>
LEAD_DELIVERY_REQUIRE_GHL=true
LEAD_DELIVERY_CREATE_GHL_OPPORTUNITY=true
GHL_BERMAN_PIPELINE_ID=eLqGD6YG5VkNOXYqrlux
GHL_BERMAN_PIPELINE_STAGE_ID=e3f01ead-c51c-425f-a182-512d88c320bb
```

Never set these from `.env.local.example`; that file intentionally contains
blank placeholders. Pull/check production env with the verification script
instead of manually eyeballing secrets.
