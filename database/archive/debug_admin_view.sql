-- DEBUG SCRIPT: Check Applications and Roles

-- 1. List ALL applications (raw table dump)
SELECT * FROM mentor_applications;

-- 2. List ALL users with 'admin' role
SELECT * FROM user_roles WHERE role = 'admin';

-- 3. Check if the user you just registered exists in user_roles
SELECT * FROM user_roles;
