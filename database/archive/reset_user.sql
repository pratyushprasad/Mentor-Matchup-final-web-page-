-- UPDATED RESET SCRIPT
-- Run this to delete your account cleanly

-- 1. Delete the role first (Fixes the error you saw)
DELETE FROM public.user_roles 
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'mjrgulmohar51@gmail.com');

-- 2. Delete the user
DELETE FROM auth.users 
WHERE email = 'mjrgulmohar51@gmail.com';

-- 3. Verify it's gone (should return 0 rows)
SELECT * FROM auth.users WHERE email = 'mjrgulmohar51@gmail.com';
