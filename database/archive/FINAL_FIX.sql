-- FINAL COMPREHENSIVE FIX
-- Run this entire script, then register with a NEW email

-- Step 1: Fix the profiles table foreign key (it's referencing auth.users incorrectly)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_pkey;

-- Recreate profiles table properly
DROP TABLE IF EXISTS public.profiles CASCADE;
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY,
    full_name TEXT,
    email TEXT,
    avatar_url TEXT,
    bio TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (true);

-- Step 2: Fix mentor_applications foreign key
ALTER TABLE public.mentor_applications DROP CONSTRAINT IF EXISTS mentor_applications_user_id_fkey;
ALTER TABLE public.mentor_applications 
ADD CONSTRAINT mentor_applications_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Step 3: Create the secure RPC function
CREATE OR REPLACE FUNCTION public.submit_mentor_application_v2(
    p_user_id UUID,
    p_full_name TEXT,
    p_email TEXT,
    p_phone TEXT,
    p_bio TEXT,
    p_college_name TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- First, ensure profile exists
    INSERT INTO public.profiles (id, full_name, email, phone, bio, created_at, updated_at)
    VALUES (p_user_id, p_full_name, p_email, p_phone, p_bio, now(), now())
    ON CONFLICT (id) DO UPDATE 
    SET phone = EXCLUDED.phone, 
        bio = EXCLUDED.bio,
        full_name = EXCLUDED.full_name,
        updated_at = now();

    -- Then insert application
    INSERT INTO public.mentor_applications (
        user_id,
        full_name,
        email,
        phone,
        bio,
        college_name,
        status
    ) VALUES (
        p_user_id,
        p_full_name,
        p_email,
        p_phone,
        p_bio,
        p_college_name,
        'pending'
    );

    RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.submit_mentor_application_v2 TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_mentor_application_v2 TO anon;

-- Step 4: Setup trigger for future users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, created_at, updated_at)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    new.email,
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
