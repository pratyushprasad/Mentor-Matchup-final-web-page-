-- Update all existing bookings to have a duration of 15 minutes
UPDATE public.bookings
SET duration_minutes = 15;
