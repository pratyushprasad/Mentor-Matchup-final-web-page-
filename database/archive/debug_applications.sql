-- Debug Script for Mentor Applications

-- 1. Check if the table exists and has data
SELECT count(*) as total_applications FROM public.mentor_applications;

-- 2. Show the most recent applications (to see if the new one is there)
SELECT id, user_id, full_name, email, status, created_at 
FROM public.mentor_applications 
ORDER BY created_at DESC 
LIMIT 5;

-- 3. Check if the RPC function exists
SELECT routine_name, routine_definition 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'submit_mentor_application';

-- 4. Check RLS status of the table
SELECT relname, relrowsecurity 
FROM pg_class 
WHERE relname = 'mentor_applications';

-- 5. Check policies on the table
SELECT * FROM pg_policies WHERE tablename = 'mentor_applications';
