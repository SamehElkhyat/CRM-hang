-- Real-time deal communication: per-booking chat between agents and admins,
-- a personal follow/watch-list, read-tracking, and a single unread-summary
-- function that both the notification bell and any "needs attention" view
-- can rely on.

-- ============================================================
-- booking_comments — the chat thread. Immutable (no update/delete policy),
-- same tamper-evidence posture as audit_logs.
-- ============================================================
create table public.booking_comments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  author_id uuid references public.profiles(id),
  message text not null,
  is_system boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_booking_comments_booking_id on public.booking_comments (booking_id, created_at);

alter table public.booking_comments enable row level security;

create policy "booking_comments_select_authenticated" on public.booking_comments
  for select to authenticated using (true);
create policy "booking_comments_insert_own" on public.booking_comments
  for insert to authenticated with check (author_id = auth.uid());

-- ============================================================
-- booking_followers — a personal watch-list. Does NOT gate visibility
-- (bookings RLS already grants full read access to all staff); it only
-- drives who gets notified.
-- ============================================================
create table public.booking_followers (
  booking_id uuid not null references public.bookings(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (booking_id, user_id)
);

alter table public.booking_followers enable row level security;

create policy "booking_followers_select_own" on public.booking_followers
  for select to authenticated using (user_id = auth.uid());
create policy "booking_followers_insert_own" on public.booking_followers
  for insert to authenticated with check (user_id = auth.uid());
create policy "booking_followers_delete_own" on public.booking_followers
  for delete to authenticated using (user_id = auth.uid());

-- ============================================================
-- booking_reads — per-user last-read marker per booking, for unread counts.
-- ============================================================
create table public.booking_reads (
  booking_id uuid not null references public.bookings(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  last_read_at timestamptz not null default now(),
  primary key (booking_id, user_id)
);

alter table public.booking_reads enable row level security;

create policy "booking_reads_select_own" on public.booking_reads
  for select to authenticated using (user_id = auth.uid());
create policy "booking_reads_insert_own" on public.booking_reads
  for insert to authenticated with check (user_id = auth.uid());
create policy "booking_reads_update_own" on public.booking_reads
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============================================================
-- Unread summary: bookings the caller created, follows, or (as admin)
-- all of, that have at least one comment newer than their last read —
-- authored by someone else. Single source of truth for the notification
-- bell and any "needs my attention" list.
-- ============================================================
create or replace function public.get_unread_booking_comments()
returns table (
  booking_id uuid,
  guest_name text,
  hotel_name text,
  unread_count bigint,
  last_message text,
  last_message_at timestamptz
)
language sql
security invoker
stable
set search_path = ''
as $$
  select
    b.id as booking_id,
    b.guest_name,
    h.name as hotel_name,
    count(c.id) filter (
      where c.created_at > coalesce(r.last_read_at, 'epoch'::timestamptz)
        and c.author_id is distinct from auth.uid()
    ) as unread_count,
    (array_agg(c.message order by c.created_at desc))[1] as last_message,
    max(c.created_at) as last_message_at
  from public.bookings b
  join public.hotels h on h.id = b.hotel_id
  join public.booking_comments c on c.booking_id = b.id
  left join public.booking_reads r on r.booking_id = b.id and r.user_id = auth.uid()
  where b.deleted_at is null
    and (
      b.created_by = auth.uid()
      or exists (
        select 1 from public.booking_followers f
        where f.booking_id = b.id and f.user_id = auth.uid()
      )
      or public.is_admin()
    )
  group by b.id, b.guest_name, h.name
  having count(c.id) filter (
    where c.created_at > coalesce(r.last_read_at, 'epoch'::timestamptz)
      and c.author_id is distinct from auth.uid()
  ) > 0
  order by max(c.created_at) desc;
$$;

-- ============================================================
-- Realtime: required for postgres_changes subscriptions to fire.
-- RLS still governs what each subscribed client actually receives.
-- ============================================================
alter publication supabase_realtime add table public.booking_comments;
alter publication supabase_realtime add table public.bookings;
