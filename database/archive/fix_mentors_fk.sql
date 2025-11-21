-- 1. Drop the existing foreign key constraint on mentors (likely referencing auth.users)
ALTER TABLE public.mentors 
DROP CONSTRAINT IF EXISTS mentors_id_fkey;

-- 2. Add the new foreign key constraint pointing to profiles
-- This tells Supabase that a mentor IS A profile
ALTER TABLE public.mentors
ADD CONSTRAINT mentors_id_fkey 
FOREIGN KEY (id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;

-- 3. Verify the change
SELECT 
    tc.table_schema, 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='mentors';
