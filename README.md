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
4. ✅ One-tap applications with status tracking; employer dashboard to post jobs (minimum wage enforced), review applicants and update status
5. ✅ Transparent matching: score, reasons and warnings (Stamp 2 hours, visa, English level) — `npm test`
6. ✅ Real listings from Careerjet (official publisher JobBox widget), filtered by the user's city and type of work

### Why a widget and not the Careerjet API
The Careerjet search API requires every call to come from a declared server IP and to carry the end user's IP and user agent.
Netlify's free plan has no static outbound IP, so the API can't be used without a paid static-IP proxy.
The official widget runs in the visitor's browser and is the compliant, zero-cost option. Trade-off: those listings
can't be scored or checked for visa/English details, and the page says so.

## Running locally
```bash
cp .env.example .env.local   # fill in Supabase keys
npm install
npm run dev
```
