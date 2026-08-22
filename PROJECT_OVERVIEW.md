# Reservation & Operations Platform — What This Project Does

This is an internal web application for a hotel reservations & operations team. It replaces a manual, error-prone workflow — staff typing booking details into a spreadsheet by hand, eyeballing whether a booking is a duplicate, calculating the price themselves, and writing a reply email from scratch — with a single system that handles the duplicate-checking and math for them, and gives management visibility into who's doing what.

The interface is Arabic-first and right-to-left (RTL), since the team works in Arabic day-to-day. It's built as a Next.js app on top of Supabase (Postgres + Auth), with Resend sending the actual emails. There is no AI in this system — every check, calculation, and draft is done by explicit code and typed in by hand, by design.

---

## 1. Who uses it

There are exactly two roles, enforced both in the UI and at the database level (Postgres Row-Level Security — not just hidden buttons):

- **Agent** — the default role for every new account. Can create bookings, see every booking in the system, chat about any booking, follow deals they didn't create, and use the Email Studio. Cannot edit the hotel directory.
- **Admin** — everything an agent can do, plus: manage the hotel directory (contacts, room rates, child policy), change other users' roles, and see the **Team** performance section (who booked what, where).

New Supabase Auth users always start as `agent` (there's no self-signup flow — admins provision accounts and manually promote the first admin via SQL, documented in `README.md`). A database trigger blocks a user from ever changing their own `role` column, so an agent can't self-promote even by calling the API directly.

---

## 2. The core workflow, end to end

1. **An agent enters a booking** using the booking form. See §3.
2. **The system checks for duplicates** — same hotel, similar guest name, overlapping dates — before the booking is saved. See §4.
3. **Cost is calculated automatically** from the hotel's stored room rates and child policy. See §5.
4. **The booking is saved**, and from that point it's visible to the whole team, with a live chat thread attached to it (§6) so an admin negotiating with the hotel can tell the agent "confirmed" or "still pending" in real time.
5. **A reply email gets drafted by hand**, then sent. See §7.
6. Every change to a booking (creation, status change, edits) is written to an **immutable audit log**, and admins can see **team-wide performance**: which agent booked how much, at which hotels. See §8–9.

---

## 3. Getting a booking into the system (`/bookings/new`)

A straightforward form: pick the hotel from the directory (this pre-fills its room categories and rates as quick-select chips), enter the guest's name, and optionally their phone number, room category, meal plan, children's ages, and a free-text description. Only the hotel and guest name are required.

**Files:** `src/components/bookings/booking-form-fields.tsx` (the field set), `src/components/bookings/manual-booking-form.tsx` (the page logic), `src/hooks/use-booking-draft.ts` (shared duplicate-check + cost-calc + save logic), `src/app/(dashboard)/bookings/new/page.tsx`.

---

## 4. Duplicate Check

Before a booking is saved, the system searches existing bookings at the **same hotel** whose date ranges **overlap**, and ranks them by how similar the guest name is — using Postgres's trigram similarity (`pg_trgm`). Arabic names are normalized first (diacritics, alef variants, and tatweel stripped) so "أحمد" and "احمد" are recognized as the same name.

This never blocks a save automatically — it surfaces candidates for a human to glance at and decide. A hotel-scoped GiST index on the date range plus a trigram index on the normalized name keep this fast even as the bookings table grows.

**Files:** migration `0001_init_schema.sql` (`check_duplicate_booking()` function), `src/lib/duplicates/check-duplicate-booking.ts`, `src/app/api/duplicate-check/route.ts`, `src/components/bookings/duplicate-warning-card.tsx`.

---

## 5. Rate & Policy Engine (the cost calculator)

Every hotel in the directory stores its own room categories with base nightly rates, and a child policy (free-stay age limit, an age bracket that needs an extra bed at a set charge, and a fallback charge for anyone older). Given check-in/out dates, a room's rate, and a list of children's ages, `calculateBookingCost()` works out nights stayed, the room subtotal, and a line-by-line breakdown of what each child costs — free, extra-bed child rate, or extra-bed adult rate.

This is a **pure deterministic function**, unit-tested (`calculate-cost.test.ts`, 7 passing tests) — plain arithmetic, nothing probabilistic.

**Files:** `src/lib/cost/calculate-cost.ts`, used from both the booking form and the booking detail page.

---

## 6. Real-time collaboration on a booking

Every booking has a **live chat thread** (visible on its detail page), because the person who takes the initial booking request (an agent) usually isn't the person who actually calls the hotel and closes the deal (an admin) — they need a way to hand off and stay updated.

- Any team member can post a message on any booking.
- Changing a booking's status (pending → confirmed → sent → cancelled) **automatically posts a system message** into that same thread ("Ahmed changed the status to: Confirmed"), so the outcome of a negotiation lives in the same place as the conversation about it.
- Agents can **follow** a deal they didn't create, to keep getting updates on it.
- A **notification bell** in the top bar shows a live, real-time unread count (Supabase Realtime, no page refresh) for any booking you created, follow, or — if you're an admin — any booking at all, with a toast when a new message arrives.

**Files:** migration `0003_deal_communication.sql` (three tables + a `get_unread_booking_comments()` function), `src/components/bookings/comment-thread.tsx`, `src/components/bookings/follow-toggle.tsx`, `src/hooks/use-booking-notifications.ts`, `src/components/notifications/notification-bell.tsx`.

---

## 7. Email Studio

Reached from a booking's detail page. A draft is just a subject and a body, typed by hand:

- **"مسودة جديدة"** starts a blank draft in the editor.
- **Save** persists your edits; **Send** (via Resend, to the hotel's reservation email, cc'd to sales if on file) is blocked if the subject or body is empty, or if you have unsaved changes.
- **Thread history** — every draft ever created for a booking (including ones that were never sent) stays listed on the side, so there's a full record of what was proposed and what actually went out.

**Files:** `src/components/email/email-studio-workspace.tsx`, `src/components/email/active-draft-panel.tsx`, `src/components/email/draft-editor.tsx`, `src/components/email/thread-history.tsx`, `src/app/(dashboard)/bookings/[id]/email/actions.ts`, `src/app/api/email/send/route.ts`.

---

## 8. Audit trail

A database trigger (not application code — so it can't be skipped by a bug) writes an entry to `audit_logs` every time a booking is inserted or updated, capturing the full before/after row. The booking detail page renders this as a timeline: who created the booking, and a field-by-field diff of every subsequent edit (old value struck through, new value next to it). This table has no update/delete policy for any role — it's append-only by construction.

**Files:** migration `0001_init_schema.sql` (`log_booking_changes()` trigger), `src/components/bookings/audit-log-timeline.tsx`.

---

## 9. Team performance (admin only)

A three-level drill-down, reachable only by admins (hidden from the sidebar entirely for agents, and redirected server-side if someone tries the URL directly):

1. **`/team`** — every team member with their total booking count.
2. **`/team/[agent]`** — the hotels that specific agent has booked at, with a count per hotel.
3. **`/team/[agent]/[hotel]`** — the actual list of bookings for that agent at that hotel, linking straight into the normal booking detail page.

Backed by two small read-only SQL functions rather than pulling every booking into the app to count them client-side, and gated by an `is_admin()` check inside the functions themselves as a second layer of defense beyond the page-level redirect.

**Files:** migration `0004_team_reports.sql`, `src/app/(dashboard)/team/**`.

---

## 10. Hotel directory (CRM)

The source of truth every other module depends on: each hotel's contact emails (reservation, sales, finance), hotline, room categories with rates, and child policy. Read-only for agents, fully editable for admins. This is what the cost engine reads its rates from, and where the Email Studio gets the "send to" address.

**Files:** `src/components/hotels/*`, `src/app/(dashboard)/hotels/**`.

---

## 11. Data model (Postgres / Supabase)

| Table | Purpose |
|---|---|
| `profiles` | One row per user, mirrors `auth.users`; holds `role` (`admin`/`agent`) |
| `hotels` | Contacts, room categories (JSON), child policy (JSON) |
| `bookings` | The core record — guest, dates, room, calculated cost, description, status, soft-delete flag |
| `email_drafts` | Every draft ever created for a booking, and its send status |
| `audit_logs` | Append-only change history, written only by trigger |
| `booking_comments` | The live chat thread per booking (system messages included) |
| `booking_followers` | An agent's personal "watching this deal" list |
| `booking_reads` | Per-user last-read marker, drives the unread badge |

Every table has Row-Level Security enabled. Migrations live in `supabase/migrations/`, numbered and run in order — `0001` (schema + RLS + duplicate-check + audit trigger), `0002` (indexes), `0003` (chat/follow/notifications), `0004` (team reports).

> Note: `email_drafts` still has two JSON columns (`audit_comparison`, `proofread_issues`) left over from an earlier AI-assisted drafting feature that has since been removed. They're unused and harmless — left in place rather than dropped to avoid a destructive schema change on a live database.

---

## 12. Tech stack

- **Next.js (App Router) + TypeScript + Tailwind** — server components fetch data directly from Supabase; client components handle the interactive bits (chat, forms, realtime)
- **Supabase** — Postgres, Auth, Row-Level Security, and Realtime (used for the live chat/notifications)
- **Resend** — outbound email delivery
- **shadcn/ui (Base UI primitives) + Framer Motion** — the component layer and animation
- **Vitest** — unit tests for the cost calculator

---

## 13. Design notes

The visual language (dark/light themes, a single restrained wine-red/navy accent pair, glass-panel surfaces, hairline borders, staggered entrance animations) was modeled after a real travel-industry reference site rather than invented from scratch — deliberately kept to two brand colors plus neutrals so it reads as considered rather than "a lot of colors." Arabic typography uses Cairo (supports both Arabic and Latin), and the whole UI is RTL by default.
