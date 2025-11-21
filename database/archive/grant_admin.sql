-- Grant Admin Role Script
-- Replace 'YOUR_EMAIL_HERE' with the email you want to be admin
-- Or just run this to see who is what

-- 1. Check current roles
SELECT auth.users.email, user_roles.role FROM user_roles JOIN auth.users ON user_roles.user_id = auth.users.id;

-- 2. (Optional) Force a specific user to be admin
-- UPDATE user_roles 
-- SET role = 'admin' 
-- WHERE user_id = (SELECT id FROM auth.users WHERE email = 'your_email@example.com');
