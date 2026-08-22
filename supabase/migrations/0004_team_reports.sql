-- Admin "Team" reports: per-agent booking totals, and the hotels each
-- agent has booked at with a per-hotel count. Read-only aggregation on top
-- of existing tables — no schema changes, nothing else touched.
--
-- Both functions are gated by public.is_admin() (from 0001_init_schema.sql):
-- a non-admin caller gets an empty result set rather than an error, since
-- the page itself already redirects non-admins away before ever reaching
-- this call — this is defense in depth, not the primary gate.

create or replace function public.get_agent_booking_counts()
returns table (
  agent_id uuid,
  full_name text,
  role public.user_role,
  booking_count bigint
)
language sql
security invoker
stable
set search_path = ''
as $$
  select
    p.id as agent_id,
    p.full_name,
    p.role,
    count(b.id) filter (where b.deleted_at is null) as booking_count
  from public.profiles p
  left join public.bookings b on b.created_by = p.id
  where public.is_admin()
  group by p.id, p.full_name, p.role
  order by count(b.id) filter (where b.deleted_at is null) desc, p.full_name;
$$;

create or replace function public.get_agent_hotel_counts(p_agent_id uuid)
returns table (
  hotel_id uuid,
  hotel_name text,
  booking_count bigint
)
language sql
security invoker
stable
set search_path = ''
as $$
  select
    h.id as hotel_id,
    h.name as hotel_name,
    count(b.id) as booking_count
  from public.hotels h
  join public.bookings b on b.hotel_id = h.id
  where b.created_by = p_agent_id
    and b.deleted_at is null
    and public.is_admin()
  group by h.id, h.name
  order by count(b.id) desc, h.name;
$$;
