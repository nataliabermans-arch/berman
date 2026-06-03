# Deployment Now

This repo is the deployable Berman website app. The immediate goal is to deploy
the public website through Berman's GitHub and Vercel accounts.

## Import Into Vercel

- Repository: `nataliabermans-arch/berman`
- Branch: `main`
- Framework preset: `Next.js`
- Root directory: repository root
- Install command: Vercel default
- Build command: Vercel default / `npm run build`
- Output directory: Vercel default

## Current Homepage Version

This repo includes the latest approved homepage/mobile version:

- Mobile hero background video: `/video/sizzle-mobile-v1.mp4`
- Desktop hero background video: `/video/sizzle-desktop-v1.mp4`
- Hero poster: `/video/sizzle-poster-v1.jpg`
- Welcome video: `/video/welcome-v1.mp4`
- Homepage mobile formatting fixes
- Homepage menu/footer aligned to the current site navigation
- Mobile/desktop speed work already applied

## Required For Initial Public Website Launch

Set this Vercel environment variable before connecting the production domain:

```text
NEXT_PUBLIC_SITE_URL=https://bermansexualhealth.com
```

The site will still build without the optional integrations below. Contact forms
and advanced server features may fall back, fail closed, or show offline states
until those integrations are configured.

## Later Developer Work

The following are not blockers for deploying the public website shell:

- Supabase persistence for leads and concierge conversations
- GoHighLevel lead delivery
- Resend lead notification email
- Anthropic-powered AI concierge
- Admin username/password setup
- Vercel Postgres-backed commerce/admin order storage

See `docs/AI_CONCIERGE_BUILD_PLAN.md` for the later AI/Supabase setup plan.
