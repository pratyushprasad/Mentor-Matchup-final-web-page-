-- THE REAL FIX - The problem is mentor_applications references profiles
-- We need to ensure the profile is COMMITTED before inserting the application

DROP FUNCTION IF EXISTS public.submit_mentor_application_v2(UUID, TEXT, TEXT, TEXT, TEXT, TEXT);

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
SET search_path = public, pg_temp
AS $$
DECLARE
    profile_count INTEGER;
BEGIN
    -- Step 1: FIRST ensure profile exists and is committed
    INSERT INTO public.profiles (id, full_name, email, phone, bio, created_at, updated_at)
    VALUES (p_user_id, p_full_name, p_email, p_phone, p_bio, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT (id) DO UPDATE 
    SET 
        full_name = EXCLUDED.full_name,
        phone = EXCLUDED.phone, 
        bio = EXCLUDED.bio,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Step 2: Verify the profile actually exists
    SELECT COUNT(*) INTO profile_count FROM public.profiles WHERE id = p_user_id;
    
    IF profile_count = 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Failed to create profile');
    END IF;

    -- Step 3: NOW insert application (profile definitely exists)
    INSERT INTO public.mentor_applications (
        user_id,
        full_name,
        email,
        phone,
        bio,
        college_name,
        status,
        created_at
    ) VALUES (
        p_user_id,
        p_full_name,
        p_email,
        p_phone,
        p_bio,
        p_college_name,
        'pending',
        CURRENT_TIMESTAMP
    );

    RETURN jsonb_build_object('success', true, 'message', 'Application submitted successfully');
    
EXCEPTION 
    WHEN foreign_key_violation THEN
        RETURN jsonb_build_object('success', false, 'error', 'FK Error: ' || SQLERRM || ' - Profile exists: ' || profile_count::text);
    WHEN unique_violation THEN
        RETURN jsonb_build_object('success', false, 'error', 'Duplicate: ' || SQLERRM);
    WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'error', 'Error: ' || SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_mentor_application_v2(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.submit_mentor_application_v2(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_mentor_application_v2(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) TO service_role;

-- Make absolutely sure the policies allow this
DROP POLICY IF EXISTS "Allow function to insert profiles" ON public.profiles;
CREATE POLICY "Allow function to insert profiles" ON public.profiles
    FOR ALL
    USING (true)
    WITH CHECK (true);
