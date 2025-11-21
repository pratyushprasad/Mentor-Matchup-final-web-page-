-- Diagnosis Script

-- 1. Check if the RPC function exists
SELECT routine_name, routine_definition 
FROM information_schema.routines 
WHERE routine_name = 'submit_mentor_application';

-- 2. Check Table Counts
SELECT 'mentor_applications' as table_name, count(*) FROM mentor_applications
UNION ALL
SELECT 'mentors', count(*) FROM mentors
UNION ALL
SELECT 'colleges', count(*) FROM colleges;

-- 3. Check RLS Policies on mentor_applications
SELECT schemaname, tablename, policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'mentor_applications';

-- 4. Check user roles (just to see if admin exists)
SELECT count(*) as admin_count FROM user_roles WHERE role = 'admin';
