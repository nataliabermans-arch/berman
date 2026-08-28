# Rollback references

## Production git state before the booking work

- Tag: `pre-booking-deploy`
- Commit: `5d1270a05ba65a0ec05df13c0a32bd86277a4549`
- To roll back: `git revert` the booking commits, or reset `main` to this tag
  and force-push. Vercel redeploys `main` automatically.

## Calendly event type

`2026-08-28-calendly-event-type.json` is the full API representation of the
single 15-minute event type as it stood on 2026-08-28, before any changes.

Note that `custom_questions` cannot be restored through the API — they are
read-only there (`PATCH /event_types/{uuid}` accepts only `active`, `name`,
`color`, `description`, `duration`, `duration_options`, `locale`, `locations`).
This file is a reference for restoring them **by hand in the Calendly UI**.

## Not backed up here

- GHL contacts and opportunities — live CRM data, not exportable to git
- Vercel environment variables — never commit these
