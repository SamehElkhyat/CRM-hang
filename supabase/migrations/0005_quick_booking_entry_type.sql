-- Quick Booking (حجز سريع): a second, lighter booking-entry flow where an
-- agent pastes raw text instead of filling the full structured form. This
-- column only distinguishes which layout the detail page renders — the row
-- itself is a normal booking, so duplicate-check, chat, follow,
-- notifications, audit log, status control, and Email Studio all keep
-- working unchanged. Existing rows and existing insert call sites are
-- unaffected since this defaults transparently to 'detailed'.

alter table public.bookings
  add column entry_type text not null default 'detailed'
  check (entry_type in ('detailed', 'quick'));
