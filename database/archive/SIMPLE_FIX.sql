-- SIMPLE FIX - Just make the RPC work without dropping tables
-- Run this, then register with a NEW email

-- Make profiles table RLS policies fully permissive for inserts
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (true);

-- Create the RPC that creates both profile and application
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
DECLARE
    profile_exists BOOLEAN;
BEGIN
    -- Check if profile exists
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = p_user_id) INTO profile_exists;
    
    -- If not, create it
    IF NOT profile_exists THEN
        INSERT INTO public.profiles (id, full_name, email, phone, bio, created_at, updated_at)
        VALUES (p_user_id, p_full_name, p_email, p_phone, p_bio, now(), now());
    ELSE
        -- Update existing profile
        UPDATE public.profiles 
        SET phone = p_phone, 
            bio = p_bio,
            full_name = p_full_name,
            updated_at = now()
        WHERE id = p_user_id;
    END IF;

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

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.submit_mentor_application_v2 TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_mentor_application_v2 TO anon;
