-- Quick Booking (حجز سريع) now collects nothing but the pasted text — no
-- hotel, guest name, or dates in the UI. The `bookings` table still
-- requires all of those (not null, hotel_id is a real FK), so rather than
-- relaxing those constraints — which would ripple into duplicate-check,
-- the cost calculator, and the Team-by-hotel reports — a single fixed
-- placeholder hotel absorbs every quick booking that doesn't specify one.
-- It's inactive so it never appears in the normal hotel picker.
--
-- Uses the nil UUID (all zeros) rather than an arbitrary id: Zod's `.uuid()`
-- validator (src/lib/validations/booking.ts) rejects any all-zero-looking
-- id that isn't exactly the nil UUID, since it checks the version/variant
-- nibbles required by RFC 9562 — 00000000-0000-0000-0000-000000000001 is
-- NOT a valid UUID under that check and was rejected server-side with
-- "الرجاء اختيار الفندق", even though the client never showed a picker.

delete from public.hotels where id = '00000000-0000-0000-0000-000000000001';

insert into public.hotels (id, name, is_active, room_types, child_policy)
values (
  '00000000-0000-0000-0000-000000000000',
  'غير محدد (حجز سريع)',
  false,
  '[]'::jsonb,
  '{}'::jsonb
)
on conflict (id) do nothing;
