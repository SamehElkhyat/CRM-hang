-- File attachments (PDF/PNG/JPG/JPEG) on any booking. Metadata lives in a
-- normal table (immutable, same posture as audit_logs/booking_comments —
-- no client-side update/delete); the binary itself lives in a private
-- Supabase Storage bucket, uploaded directly from the browser and only ever
-- read back through short-lived signed URLs.

create table public.booking_attachments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  uploaded_by uuid references public.profiles(id),
  file_name text not null,
  file_path text not null,
  file_type text not null,
  file_size bigint not null,
  created_at timestamptz not null default now()
);

create index idx_booking_attachments_booking_id on public.booking_attachments (booking_id);

alter table public.booking_attachments enable row level security;

create policy "booking_attachments_select_authenticated" on public.booking_attachments
  for select to authenticated using (true);
create policy "booking_attachments_insert_own" on public.booking_attachments
  for insert to authenticated with check (uploaded_by = auth.uid());

-- ============================================================
-- Storage bucket: private, with type/size limits enforced by Storage
-- itself as a second guardrail beyond the client-side checks in the
-- uploader component.
-- ============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'booking-attachments',
  'booking-attachments',
  false,
  10485760, -- 10 MB
  array['application/pdf', 'image/png', 'image/jpeg']
)
on conflict (id) do nothing;

create policy "booking_attachments_storage_select" on storage.objects
  for select to authenticated
  using (bucket_id = 'booking-attachments');

create policy "booking_attachments_storage_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'booking-attachments');
