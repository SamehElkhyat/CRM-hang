# منصة الحجوزات والعمليات (Reservation & Operations Platform)

Enterprise internal tool for a hotel reservations & operations team: paste raw Arabic
booking text, get structured extraction via Claude, automatic duplicate-booking
detection, deterministic cost calculation from stored hotel policies, and an AI-assisted
email drafting/proofreading/audit workflow before sending.

## Stack

- Next.js (App Router) + TypeScript + Tailwind + shadcn/ui, RTL-first Arabic UI
- Supabase (Postgres + Auth, Row Level Security everywhere)
- Claude (`@anthropic-ai/sdk`) for extraction, proofreading, and draft/audit comparison
- Resend for outbound email

## 1. Create the Supabase project

1. Create a new project at [supabase.com](https://supabase.com).
2. In the SQL Editor, run the migration files in order:
   - `supabase/migrations/0001_init_schema.sql`
   - `supabase/migrations/0002_indexes.sql`
   - (optional, for sample data) `supabase/seed.sql`

   Or, if you have the Supabase CLI linked to the project: `supabase db push`.
3. Copy **Project URL**, **anon public key**, and **service_role key** from
   Settings → API.

### Bootstrap the first admin

New sign-ups default to the `agent` role (see `handle_new_user()` in the migration).
After creating your first user (via the app's login flow — an account must already
exist in Supabase Auth, e.g. created from the Auth panel in the dashboard), promote it
to admin from the SQL Editor:

```sql
update public.profiles set role = 'admin' where id = '<user-uuid>';
```

Only admins can manage the hotel directory (contacts, room rates, child policy).

## 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
  — from the Supabase project above.
- `ANTHROPIC_API_KEY` — from [console.anthropic.com](https://console.anthropic.com).
  Powers the Arabic extraction, proofreading, and draft/audit-comparison features.
- `RESEND_API_KEY` and `RESEND_FROM_EMAIL` — from
  [resend.com/api-keys](https://resend.com/api-keys). `RESEND_FROM_EMAIL` must be an
  address on a domain you've verified with Resend.

The **Settings** page in the app (admin + non-admin visible) shows live status of
whether each integration is configured, without exposing the key values.

## 3. Run locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`, sign in, and:

1. **دليل الفنادق (Hotels)** — add at least one hotel with room types/base rates and a
   child policy (admin only).
2. **تحليل الحجز (Parse)** — paste raw Arabic booking text, review the extracted
   fields, run the duplicate check, confirm the calculated cost, and save.
3. **استوديو البريد (Email Studio)** — generate a reply draft, run the AI proofreader
   and the original-vs-draft audit comparison, then send.

## Testing

```bash
npm test        # cost calculator unit tests (vitest)
npm run lint     # eslint
npm run build    # type-check + production build
```

## Project structure

```
supabase/migrations/   SQL schema, RLS policies, triggers, indexes
supabase/seed.sql       sample hotel for local testing
src/app/(dashboard)/    authenticated app: parse, bookings, hotels, settings
src/app/api/            AI + email Route Handlers (server-only secrets)
src/lib/ai/             Claude orchestration, prompts, zod schemas
src/lib/cost/           pure deterministic cost calculator (+ unit tests)
src/lib/duplicates/     duplicate-booking RPC wrapper
src/lib/email/          Resend wrapper
src/lib/supabase/       browser/server/middleware Supabase clients
```

## Notes on the duplicate-check engine

Guest-name matching uses Postgres `pg_trgm` trigram similarity against a normalized
column (diacritics/alef-forms/tatweel stripped) combined with a `daterange` overlap
check, scoped to the same hotel. It surfaces ranked candidates for staff review — it
never auto-blocks a save.
