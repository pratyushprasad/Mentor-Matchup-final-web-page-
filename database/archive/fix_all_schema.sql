-- Master Fix Script for Mentor Matchup Database

-- 1. Ensure profiles table exists
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    email TEXT,
    avatar_url TEXT,
    bio TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create policies for profiles (drop first to avoid errors)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 4. Backfill profiles for any user that doesn't have one (CRITICAL FIX)
INSERT INTO public.profiles (id, full_name, email, avatar_url, created_at, updated_at)
SELECT 
    id, 
    COALESCE(raw_user_meta_data->>'full_name', email) as full_name, 
    email, 
    raw_user_meta_data->>'avatar_url' as avatar_url,
    created_at, 
    now()
FROM auth.users
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE profiles.id = auth.users.id
);

-- 5. Fix Bookings Foreign Key (CRITICAL FIX)
-- Drop any existing constraint on student_id to ensure we don't have duplicates or wrong ones
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_student_id_fkey;
-- Add the correct one pointing to profiles
ALTER TABLE public.bookings
ADD CONSTRAINT bookings_student_id_fkey 
FOREIGN KEY (student_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;

-- 6. Fix Mentors Foreign Key (CRITICAL FIX)
-- Drop any existing constraint on id
ALTER TABLE public.mentors DROP CONSTRAINT IF EXISTS mentors_id_fkey;
-- Add the correct one pointing to profiles
ALTER TABLE public.mentors
ADD CONSTRAINT mentors_id_fkey 
FOREIGN KEY (id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;

-- 7. Refresh Schema Cache
NOTIFY pgrst, 'reload schema';
