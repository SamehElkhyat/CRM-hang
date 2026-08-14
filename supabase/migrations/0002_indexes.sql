-- Indexes. Postgres does not auto-index foreign key columns (only the PK),
-- so these are added explicitly.

create index idx_bookings_hotel_id on public.bookings (hotel_id);
create index idx_bookings_created_by on public.bookings (created_by);
create index idx_bookings_status on public.bookings (status);

-- Fuzzy Arabic guest-name matching for the duplicate-check RPC.
create index idx_bookings_guest_name_trgm on public.bookings using gin (normalized_guest_name gin_trgm_ops);

-- Combined hotel + date-range overlap lookup (requires btree_gist for the uuid equality term).
create index idx_bookings_hotel_daterange on public.bookings using gist (hotel_id, daterange(check_in, check_out, '[]'));

create index idx_audit_logs_booking_id on public.audit_logs (booking_id);
create index idx_audit_logs_modified_by on public.audit_logs (modified_by);

create index idx_email_drafts_booking_id on public.email_drafts (booking_id);
