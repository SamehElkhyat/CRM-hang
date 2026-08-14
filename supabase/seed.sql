-- Sample data for local development / testing.

insert into public.hotels (name, hotline, reservation_email, sales_email, finance_email, room_types, child_policy)
values (
  'فندق النيل الذهبي',
  '+20 100 000 0000',
  'reservations@example-hotel.com',
  'sales@example-hotel.com',
  'finance@example-hotel.com',
  '[
    {"name": "Standard Room", "base_rate": 1200},
    {"name": "Deluxe Room", "base_rate": 1800},
    {"name": "Suite", "base_rate": 2800}
  ]'::jsonb,
  '{
    "currency": "EGP",
    "free_age_limit": 6,
    "extra_bed": {"min_age": 7, "max_age": 12, "charge": 300},
    "adult_extra_bed_charge": 500
  }'::jsonb
);
