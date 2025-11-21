-- FINAL FIX SCRIPT
-- Run this in Supabase SQL Editor

-- 1. Create user_roles table if missing
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Security
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Users can read their own role" ON public.user_roles 
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Assign Admin Role to mjrgulmohar51@gmail.com
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE email = 'mjrgulmohar51@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.users.id AND role = 'admin'
);

-- 4. Verify
SELECT * FROM public.user_roles 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'mjrgulmohar51@gmail.com');
