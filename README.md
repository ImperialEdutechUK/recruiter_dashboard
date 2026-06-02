# Freelance Recruitment Tracker

Tracks freelance educators (Tutors, Assessors, IQA Tutors, Webinar Moderators/Tutors, Video Presenters)
from application to signed contract across three brands — **South London College**, **Aspirex**, and
**Global Edulink** — through a fixed 10-stage pipeline with role-based access and an immutable audit log.

This is a **tracker**, not an automation platform: there are no third-party API integrations. Interview
recordings are stored as OneDrive share links; contract signing status is recorded manually.

## Stack

- **Next.js 14** (App Router) — Server Components for reads, Server Actions for writes
- **Supabase** — PostgreSQL + Auth, with Row-Level Security enforcing the three roles and brand isolation
- **Tailwind CSS** with self-contained UI components
- **Resend** — best-effort email notifications
- **Recharts** — dashboard

## Prerequisites

- Node.js 18.17+
- A Supabase project (free tier is fine for a dummy-data demo) **or** Docker + the Supabase CLI for local dev

## Setup

### 1. Install

```bash
npm install
```

### 2. Database

**Option A — Supabase cloud (recommended for a real deployment):**

1. Create a project at supabase.com. **Choose the Frankfurt (EU Central) region** to satisfy the UK/EU data-residency requirement.
2. Link and push the migrations (this also runs the seed):
   ```bash
   npx supabase link --project-ref YOUR_PROJECT_REF
   npx supabase db push
   ```
3. In **Authentication → Providers → Email**, turn **off** "Confirm email" (or confirm users manually) so password login works.

**Option B — Local (needs Docker):**

```bash
npx supabase start      # boots Postgres + Auth locally and applies migrations + seed
```

### 3. Environment

Copy `.env.example` to `.env.local` and fill in the values from **Project Settings → API**
(or the values printed by `supabase start` for local):

```bash
cp .env.example .env.local
```

Email is optional — without `RESEND_API_KEY` the app simply skips notifications.

### 4. Create the first user (and make them Manager)

New accounts default to the **Director** role, so the first Manager must be promoted directly:

1. Create a user in **Authentication → Users → Add user** (tick "Auto Confirm"), or via local Studio at `http://localhost:54323`.
2. Promote them in the SQL editor:
   ```sql
   update profiles set role = 'manager' where email = 'you@yourcollege.ac.uk';
   ```

After that, the Manager can create and assign all other users from **Settings**.

### 5. Run

```bash
npm run dev
```

Open `http://localhost:3000`.

## Roles

| Role | Access |
|------|--------|
| **Manager / Admin** | Full pipeline, all brands, document checklists, adverts, dashboard, user management. |
| **Director** | Review queue only — candidates at Stage 5+ within their assigned brand(s). Approves/rejects with comments. |
| **Academic / HR** | Handover only — contracted candidates (Stage 10) within their brand(s); manages induction tasks. |

Brand isolation, stage gating, and the immutable audit log are all enforced in the database via RLS and
`SECURITY DEFINER` functions (`advance_stage`, `submit_decision`), so they cannot be bypassed from the client.

## The 10 stages

1. Applications Received → 2. Shortlisted → 3. Interview Scheduled → 4. Interview Conducted →
5. Pending Director Review → 6. Director Decision → 7. Document Collection → 8. Draft Contract →
9. Final Contract → 10. Contracted – Academic Handover.

Entering Stage 7 auto-builds the role-specific document checklist; entering Stage 10 auto-builds the induction task list.

## Project layout

```
app/(auth)/login        Sign-in
app/(app)/pipeline      Manager pipeline (list + board)
app/(app)/candidates/[id]  Candidate record (overview / documents / notes / timeline) + stage actions
app/(app)/review        Director review queue
app/(app)/dashboard     Metrics + charts
app/(app)/adverts       Indeed advert tracking
app/(app)/handover      Academic induction
app/(app)/settings      Users, brand access, templates
lib/actions             Server actions (all mutations)
lib/supabase            SSR Supabase clients + auth middleware
supabase/migrations     0001 schema · 0002 RLS + functions · 0003 seed
```

## Hosting notes

- The free **Supabase** tier pauses after a week of inactivity and has no automated backups — fine for a demo with
  dummy data, but use **Supabase Pro (~$25/mo, EU region)** for real candidate data.
- **Vercel's** free Hobby tier is licensed for non-commercial use only and may use deployed content for training;
  for a commercial app either use **Vercel Pro (~$20/mo)** or deploy free on **Cloudflare Pages / Netlify**, whose
  free tiers permit commercial use.
- Sensitive personal data (ID, Right to Work, DBS) lives in Supabase (EU). Keep it out of any logging.
