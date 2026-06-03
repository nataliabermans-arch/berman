Berman website. Locked stack: Next.js 14 + TypeScript + Tailwind + Motion + Vercel.

This repository is already rooted at the deployable Next.js app. When importing
into Vercel, use the repository root as the project root.

## Vercel

- Framework preset: Next.js
- Install command: `npm install` or Vercel default
- Build command: `npm run build` or Vercel default
- Output directory: Vercel default
- Root directory: repository root

## Initial Deployment

For the initial public website deployment, set:

- `NEXT_PUBLIC_SITE_URL=https://bermansexualhealth.com`

Then import this repo into Vercel and verify the preview before changing
Cloudflare DNS.

See `docs/DEPLOYMENT_NOW.md` for the immediate launch checklist.

## Later Integrations

Supabase, GoHighLevel, Resend, Anthropic, admin auth, and commerce persistence
are later integration work. They are not blockers for deploying the public
website shell.

See `docs/AI_CONCIERGE_BUILD_PLAN.md` for the AI concierge/Supabase setup plan.
