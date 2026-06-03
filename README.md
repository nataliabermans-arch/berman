Berman website. Locked stack: Next.js 14 + TypeScript + Tailwind + Motion + Vercel.

This repository is already rooted at the deployable Next.js app. When importing
into Vercel, use the repository root as the project root.

## Vercel

- Framework preset: Next.js
- Install command: `npm install` or Vercel default
- Build command: `npm run build` or Vercel default
- Output directory: Vercel default
- Root directory: repository root

## Production Environment Variables

The public site can build without secrets, but production functionality depends
on the relevant integrations being configured in Vercel:

- `NEXT_PUBLIC_SITE_URL`
- `ADMIN_JWT_SECRET`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `POSTGRES_URL` or Vercel Postgres integration variables
- `ANTHROPIC_API_KEY`
- `ANTHROPIC_MODEL` optional
- `GHL_BERMAN_API_TOKEN`
- `GHL_BERMAN_LOCATION_ID`
- `GHL_BERMAN_PIPELINE_ID` optional
- `GHL_BERMAN_PIPELINE_STAGE_ID` optional
- `LEAD_DELIVERY_CREATE_GHL_OPPORTUNITY` optional
- `RESEND_API_KEY`
- `LEAD_NOTIFICATION_FROM`
- `LEAD_NOTIFICATION_TO`
- `LEAD_NOTIFICATION_CC` optional
- `GHL_LEAD_WEBHOOK_URL` optional
- `CONTACT_INTAKE_WEBHOOK_URL` optional
