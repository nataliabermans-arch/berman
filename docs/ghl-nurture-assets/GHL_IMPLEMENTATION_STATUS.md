# GHL Implementation Status

Last updated: May 29, 2026

## Completed By API

- Confirmed the Berman production GHL pipeline/stage before mutation.
- Created/confirmed 16 A2P/contact custom fields.
- Created/confirmed 8 workflow tags.
- Created 40 custom HTML email templates in GHL, not generic builder templates.
- Verified after creation that all 16 fields, all 8 tags, and all 40 templates exist.

## Email Template Naming

Templates are named:

`Berman Nurture | [Branch] | [Step]`

Example:

`Berman Nurture | Menopause & Hormones | 00 Immediate`

## Workflow Assembly

The public HighLevel workflow API supports workflow read/enrollment style operations, but not workflow definition creation/update. The workflow should be assembled in the GHL UI using `GHL_UI_BUILD_SHEET.md`.

SMS actions must remain disabled or guarded until A2P is approved and the contact has opted in.

## Cleanup

The temporary production setup endpoint and its temporary Vercel environment variables were removed after the API setup run. The cleanup deploy should leave `/api/internal/ghl-setup/` unavailable.
