# Job Match

Mobile-first web app that helps international students and immigrants in Ireland find work
in **Dublin City, Dublin county, Cork and Limerick**.

## Why it's different
Job boards don't tell you what matters most to a newcomer. Every listing on Job Match shows,
when known — and says so clearly when it isn't:
- whether the role accepts Stamp 2 (student) visa holders
- the English level actually required
- whether a PPSN is needed before starting

## How jobs get in (hybrid model)
| Source | Apply flow | Application status |
|---|---|---|
| **Native** — employers post directly | One-click apply inside the app | Real status (Applied → Reviewing → Interview → Rejected / Hired) |
| **External** — imported from the Careerjet API (Ireland only) | Redirects to the original listing | Not tracked |

Signals found in external listings (e.g. "Stamp 2") are shown as *"found in the listing"*, never as a guarantee.

## Stack
- Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- Supabase — Postgres, Auth (magic link), Storage (CVs)
- Vercel — hosting

## Security
All access control lives in the database via Postgres Row Level Security
(`supabase/migrations/0001_initial_schema.sql`). Covered by `supabase/tests/rls_test.sql`
(31 scenarios: candidates can't see each other, employers only see applicants to their own
jobs, only the employer can change an application's status, etc.).

## Roadmap
1. ✅ Project setup, database schema, security rules
2. ✅ Passwordless sign-up (email link), onboarding for candidates and employers, profile
3. ✅ Jobs list with search and filters, job detail with visa / English / PPSN and Stamp 2 hours check (demo data clearly labelled)
4. Applications and employer dashboard
5. Careerjet import, visa/English signal detection, matching

## Running locally
```bash
cp .env.example .env.local   # fill in Supabase keys
npm install
npm run dev
```
