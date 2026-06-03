# AI Concierge Build Plan

This is later work for the next developer. It is not required to deploy the
public website.

## Goal

Enable the AI concierge with persistent conversations, lead handoff, and safe
offline behavior.

## Accounts And Services

- Vercel project connected to this GitHub repo
- Supabase project for persistence
- Anthropic account/API key for concierge responses
- Optional GoHighLevel/LeadConnector account for CRM lead delivery
- Optional Resend account for email notifications

## Supabase Setup

1. Create a Supabase project owned by the Berman team.
2. Run the schema in `lib/supabase/schema.sql`.
3. Copy these values into Vercel environment variables:

```text
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

Keep the service-role key server-side only. Do not expose it as a
`NEXT_PUBLIC_` variable.

## Anthropic Setup

1. Create or use Berman's Anthropic account.
2. Create an API key.
3. Add these Vercel environment variables:

```text
ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=claude-sonnet-4-6
```

`ANTHROPIC_MODEL` is optional; the app has a default.

## Optional Lead Delivery

For GoHighLevel/LeadConnector:

```text
GHL_BERMAN_API_TOKEN=
GHL_BERMAN_LOCATION_ID=
GHL_BERMAN_PIPELINE_ID=
GHL_BERMAN_PIPELINE_STAGE_ID=
LEAD_DELIVERY_CREATE_GHL_OPPORTUNITY=true
```

For notification email:

```text
RESEND_API_KEY=
LEAD_NOTIFICATION_FROM=
LEAD_NOTIFICATION_TO=
LEAD_NOTIFICATION_CC=
```

## Admin Setup

If `/admin` should be enabled:

```text
ADMIN_JWT_SECRET=
ADMIN_USERNAME=
ADMIN_PASSWORD=
```

Use a long random value for `ADMIN_JWT_SECRET`.

## Verification

After configuring the variables:

1. Deploy a Vercel preview.
2. Open the concierge and send a test message.
3. Confirm a conversation row is written to Supabase.
4. Submit a test lead form.
5. Confirm lead delivery in the configured destination.
6. Confirm offline behavior is acceptable by temporarily removing
   `ANTHROPIC_API_KEY` in a preview environment.
