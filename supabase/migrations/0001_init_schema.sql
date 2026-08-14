-- Reservation & Operations Platform — initial schema
-- Extensions, enums, tables, functions, triggers, RLS policies.

-- ============================================================
-- Extensions
-- ============================================================
create extension if not exists pg_trgm;
create extension if not exists btree_gist;

-- ============================================================
-- Enums
-- ============================================================
create type public.user_role as enum ('admin', 'agent');
create type public.booking_status as enum ('pending', 'confirmed', 'sent', 'cancelled');
create type public.draft_status as enum ('draft', 'proofread', 'audited', 'sent');

-- ============================================================
-- Arabic name normalization (used for duplicate-detection matching)
-- Strips diacritics/tatweel, unifies alef forms, unifies taa marbuta/haa.
-- ============================================================
create or replace function public.normalize_arabic_name(input text)
returns text
language plpgsql
immutable
as $$
declare
  result text;
begin
  result := coalesce(input, '');
  result := replace(result, 'أ', 'ا');
  result := replace(result, 'إ', 'ا');
  result := replace(result, 'آ', 'ا');
  result := replace(result, 'ى', 'ي');
  result := replace(result, 'ة', 'ه');
  result := replace(result, 'ـ', ''); -- tatweel
  -- Arabic diacritics (harakat): fathatan, dammatan, kasratan, fatha, damma, kasra, shadda, sukun, superscript alef
  result := regexp_replace(result, '[ًٌٍَُِّْٰ]', '', 'g');
  result := regexp_replace(result, '\s+', ' ', 'g');
  result := trim(result);
  return result;
end;
$$;

-- ============================================================
-- profiles
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role public.user_role not null default 'agent',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
security invoker
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- ============================================================
-- hotels
-- ============================================================
create table public.hotels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  hotline text,
  reservation_email text,
  sales_email text,
  finance_email text,
  room_types jsonb not null default '[]'::jsonb,
  child_policy jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- bookings
-- ============================================================
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.hotels(id),
  guest_name text not null,
  normalized_guest_name text generated always as (public.normalize_arabic_name(guest_name)) stored,
  guest_phone text,
  check_in date not null,
  check_out date not null,
  room_category text,
  meal_plan text,
  children_ages int[] not null default '{}',
  rate numeric(12,2) not null default 0,
  total_cost numeric(12,2) not null default 0,
  raw_arabic_text text not null,
  status public.booking_status not null default 'pending',
  created_by uuid references public.profiles(id),
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint check_out_after_check_in check (check_out > check_in),
  constraint rate_nonnegative check (rate >= 0),
  constraint total_cost_nonnegative check (total_cost >= 0)
);

-- ============================================================
-- email_drafts (single source of truth for reply-email history/thread)
-- ============================================================
create table public.email_drafts (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  subject text not null default '',
  body text not null default '',
  audit_comparison jsonb not null default '{"discrepancies": [], "overall_risk": "none", "summary": ""}'::jsonb,
  proofread_issues jsonb not null default '[]'::jsonb,
  status public.draft_status not null default 'draft',
  resend_message_id text,
  sent_at timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- audit_logs (append-only; writes only via trigger, never client)
-- ============================================================
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  change_type text not null,
  old_data jsonb,
  new_data jsonb,
  modified_by uuid references public.profiles(id),
  "timestamp" timestamptz not null default now()
);

-- ============================================================
-- updated_at maintenance
-- ============================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger trg_hotels_updated_at before update on public.hotels for each row execute function public.set_updated_at();
create trigger trg_bookings_updated_at before update on public.bookings for each row execute function public.set_updated_at();
create trigger trg_email_drafts_updated_at before update on public.email_drafts for each row execute function public.set_updated_at();

-- ============================================================
-- Auto-create a profile row when a new auth user signs up.
-- New users default to 'agent'; promote the first admin manually
-- (see README) via: update public.profiles set role = 'admin' where id = '<uuid>';
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.email), 'agent');
  return new;
end;
$$;

create trigger trg_handle_new_user
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Prevent self-service role escalation (agent -> admin) on profiles.
-- ============================================================
create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_role public.user_role;
begin
  if new.role is distinct from old.role then
    select role into caller_role from public.profiles where id = auth.uid();
    if caller_role is distinct from 'admin' then
      raise exception 'Only admins can change user roles';
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_prevent_role_escalation
  before update on public.profiles
  for each row execute function public.prevent_role_escalation();

revoke execute on function public.prevent_role_escalation() from public, anon, authenticated;

-- ============================================================
-- Audit trail trigger on bookings (insert + update).
-- SECURITY DEFINER so it can write to audit_logs, which has no
-- client-facing insert policy. EXECUTE revoked so it cannot be
-- invoked directly as an RPC (only fires as a table trigger).
-- ============================================================
create or replace function public.log_booking_changes()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.audit_logs (booking_id, change_type, old_data, new_data, modified_by)
    values (new.id, 'insert', null, to_jsonb(new), auth.uid());
  elsif tg_op = 'UPDATE' then
    if old is distinct from new then
      insert into public.audit_logs (booking_id, change_type, old_data, new_data, modified_by)
      values (new.id, 'update', to_jsonb(old), to_jsonb(new), auth.uid());
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_log_booking_changes
  after insert or update on public.bookings
  for each row execute function public.log_booking_changes();

revoke execute on function public.log_booking_changes() from public, anon, authenticated;

-- ============================================================
-- Duplicate-booking candidate search.
-- SECURITY INVOKER (read-only, caller already has SELECT on bookings).
-- Returns ranked candidates for staff review — never auto-blocks.
-- ============================================================
create or replace function public.check_duplicate_booking(
  p_hotel_id uuid,
  p_guest_name text,
  p_check_in date,
  p_check_out date,
  p_similarity_threshold real default 0.35
)
returns table (
  booking_id uuid,
  guest_name text,
  check_in date,
  check_out date,
  status public.booking_status,
  similarity_score real
)
language sql
security invoker
stable
set search_path = ''
as $$
  select
    b.id as booking_id,
    b.guest_name,
    b.check_in,
    b.check_out,
    b.status,
    similarity(b.normalized_guest_name, public.normalize_arabic_name(p_guest_name)) as similarity_score
  from public.bookings b
  where b.hotel_id = p_hotel_id
    and b.deleted_at is null
    and daterange(b.check_in, b.check_out, '[]') && daterange(p_check_in, p_check_out, '[]')
    and similarity(b.normalized_guest_name, public.normalize_arabic_name(p_guest_name)) >= p_similarity_threshold
  order by similarity_score desc;
$$;

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.profiles enable row level security;
alter table public.hotels enable row level security;
alter table public.bookings enable row level security;
alter table public.email_drafts enable row level security;
alter table public.audit_logs enable row level security;
alter table public.audit_logs force row level security;

-- profiles: staff directory readable by all authenticated; self-update only (role guarded by trigger above).
create policy "profiles_select_authenticated" on public.profiles for select to authenticated using (true);
create policy "profiles_update_self" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- hotels: readable by all authenticated staff; writes admin-only.
create policy "hotels_select_authenticated" on public.hotels for select to authenticated using (true);
create policy "hotels_insert_admin" on public.hotels for insert to authenticated with check (public.is_admin());
create policy "hotels_update_admin" on public.hotels for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "hotels_delete_admin" on public.hotels for delete to authenticated using (public.is_admin());

-- bookings: shared ops queue — any authenticated staff member can read/create/update.
-- No delete policy: bookings are soft-deleted via `deleted_at`, never hard-deleted through the API.
create policy "bookings_select_authenticated" on public.bookings for select to authenticated using (true);
create policy "bookings_insert_authenticated" on public.bookings for insert to authenticated with check (created_by = auth.uid());
create policy "bookings_update_authenticated" on public.bookings for update to authenticated using (true) with check (true);

-- email_drafts: shared ops queue, same pattern as bookings.
create policy "email_drafts_select_authenticated" on public.email_drafts for select to authenticated using (true);
create policy "email_drafts_insert_authenticated" on public.email_drafts for insert to authenticated with check (created_by = auth.uid());
create policy "email_drafts_update_authenticated" on public.email_drafts for update to authenticated using (true) with check (true);

-- audit_logs: read-only for staff; all writes happen exclusively via the SECURITY DEFINER trigger above.
create policy "audit_logs_select_authenticated" on public.audit_logs for select to authenticated using (true);
