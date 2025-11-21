-- Run this to FIX "Email not confirmed" error
UPDATE auth.users
SET email_confirmed_at = now()
WHERE email = 'mjrgulmohar51@gmail.com';

-- Verify it worked
SELECT email, email_confirmed_at 
FROM auth.users 
WHERE email = 'mjrgulmohar51@gmail.com';
