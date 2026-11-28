-- Lets a file uploaded by one person appear in everyone else's open booking
-- chat without a refresh, the same way booking_comments already does
-- (0003_deal_communication.sql). Row level security still decides what each
-- subscribed client receives.

alter publication supabase_realtime add table public.booking_attachments;
