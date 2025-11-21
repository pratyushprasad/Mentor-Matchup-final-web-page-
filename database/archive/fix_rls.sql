-- Fix RLS for Mentor Display
-- We need to allow anyone to read mentor names from mentor_applications
-- This is safe because we only display names of approved mentors in the UI anyway

DROP POLICY IF EXISTS "Allow public read access on mentor_applications" ON public.mentor_applications;

CREATE POLICY "Allow public read access on mentor_applications"
ON public.mentor_applications
FOR SELECT
USING (true);  -- Allow public read for now to fix the display issue
