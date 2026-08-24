-- "حجوزات الفريق" is no longer admin-only — every signed-in team member
-- (agent or admin) can see the full team's last-24h activity, not just
-- their own. This only relaxes the RPC's own gate; it doesn't grant any
-- new table access, since profiles_select_authenticated and
-- bookings_select_authenticated (0001_init_schema.sql) already let any
-- authenticated user read every row of both tables — the RPC was simply
-- adding a stricter gate on top for what was, until now, an admin-only page.

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
  group by p.id, p.full_name, p.role
  order by
    count(b.id) filter (
      where b.deleted_at is null and b.created_at >= now() - interval '24 hours'
    ) desc,
    p.full_name;
$$;
