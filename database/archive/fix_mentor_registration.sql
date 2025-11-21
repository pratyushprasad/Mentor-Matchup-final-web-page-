-- COMPREHENSIVE FIX FOR MENTOR REGISTRATION
-- This script fixes ALL issues at once

-- 1. Ensure the trigger exists to auto-create profiles
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

-- 2. Create the RPC function that handles everything
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
    -- Ensure profile exists (in case trigger didn't fire)
    INSERT INTO public.profiles (id, full_name, email, phone, bio, created_at, updated_at)
    VALUES (p_user_id, p_full_name, p_email, p_phone, p_bio, now(), now())
    ON CONFLICT (id) DO UPDATE 
    SET phone = EXCLUDED.phone, 
        bio = EXCLUDED.bio,
        updated_at = now();

    -- Insert application
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

-- 3. Grant execute permission
GRANT EXECUTE ON FUNCTION public.submit_mentor_application_v2 TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_mentor_application_v2 TO anon;
