-- Check Profiles Table
SELECT * FROM information_schema.tables WHERE table_name = 'profiles';

-- Check columns of profiles
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles';

-- Check RLS on profiles
SELECT * FROM pg_policies WHERE tablename = 'profiles';
