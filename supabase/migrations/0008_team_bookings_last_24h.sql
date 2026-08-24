-- Backs the admin-only "حجوزات الفريق" (Team Bookings) page: same shape as
-- get_agent_booking_counts() from 0004_team_reports.sql, but scoped to
-- bookings created in the last 24 hours instead of all-time — a "who's
-- been active today" view rather than the existing all-time "الفريق"
-- performance drill-down. Same admin-only gating (empty result for a
-- non-admin caller; the page itself is the primary gate via a redirect).

create or replace function public.get_agent_booking_counts_last_24h()
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
    count(b.id) filter (
      where b.deleted_at is null and b.created_at >= now() - interval '24 hours'
    ) as booking_count
  from public.profiles p
  left join public.bookings b on b.created_by = p.id
  where public.is_admin()
  group by p.id, p.full_name, p.role
  order by
    count(b.id) filter (
      where b.deleted_at is null and b.created_at >= now() - interval '24 hours'
    ) desc,
    p.full_name;
$$;
