# Berman Website Source Of Truth

This repository is the deployable Berman website source of truth.

## Canonical Repo And Deploy Target

- GitHub repository: `nataliabermans-arch/berman`
- Production branch: `main`
- Vercel project: `berman-s-projects/berman`
- Production domain: `https://bermansexualhealth.com`
- Vercel root directory: repository root

Vercel production deployment metadata for June 3, 2026 showed:

- GitHub org/repo: `nataliabermans-arch/berman`
- GitHub branch: `main`
- GitHub commit: `d04347a13f161c5931371e78ab01d5dd96d8817e`

## Do Not Use Bryan's Reference Repo As The Deploy Source

`plugandplaypeptides/berman-website` is Bryan's reference/work repo, not the Berman-owned deploy repo.

Do not treat any of these as proof that Berman's production site has been updated:

- commits only in `plugandplaypeptides/berman-website`;
- local edits only under `/Users/bryancalcott/berman-website`;
- deploy attempts from `/Users/bryancalcott/berman-website/build`;
- Vercel links that target `bryan-5616s-projects/berman-website`.

If a fix is needed on the live Berman site, apply it to this repo and push it to the deploy branch.

## Local Verification

Before working, run:

```bash
npm run check:source
```

The check fails if the local Git remote is not `nataliabermans-arch/berman`.

Before pushing, run:

```bash
npm run typecheck
npm run build
```

For GHL health after deployment, run:

```bash
npm run verify:ghl -- --live-url https://bermansexualhealth.com
```

## Signed-Scope Closeout Reminder

The signed-scope closeout requires more than a public website shell:

- GHL lead intake and opportunity tracking must work on production.
- Office routing/notification and approved follow-up/nurture must be proven.
- GA/GSC tracking/verification/submission/indexing proof must be completed.
- LegitScript badge/certification proof must be completed.
- Covered account/source/build/access handoff must be documented.

Do not expand this into unrelated June 4 punchlist items such as full GHL calendar rebuilds, Google Calendar sync, NextTech scheduling APIs, Meta cleanup, GBP optimization, or moving preserved legacy URLs into `/blog/` or `/journal/`.
