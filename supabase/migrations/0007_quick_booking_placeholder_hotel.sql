-- Quick Booking (حجز سريع) now collects nothing but the pasted text — no
-- hotel, guest name, or dates in the UI. The `bookings` table still
-- requires all of those (not null, hotel_id is a real FK), so rather than
-- relaxing those constraints — which would ripple into duplicate-check,
-- the cost calculator, and the Team-by-hotel reports — a single fixed
-- placeholder hotel absorbs every quick booking that doesn't specify one.
-- It's inactive so it never appears in the normal hotel picker.

insert into public.hotels (id, name, is_active, room_types, child_policy)
values (
  '00000000-0000-0000-0000-000000000001',
  'غير محدد (حجز سريع)',
  false,
  '[]'::jsonb,
  '{}'::jsonb
)
on conflict (id) do nothing;
