-- Updated RPC to handle missing profiles automatically
-- This fixes the "violates foreign key constraint" error by ensuring the profile exists.

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
AS $$
BEGIN
    -- 1. Ensure Profile Exists
    -- We try to insert it. If it exists, we do nothing (or update if we wanted, but let's just ensure existence).
    INSERT INTO public.profiles (id, full_name, email, created_at, updated_at)
    VALUES (p_user_id, p_full_name, p_email, now(), now())
    ON CONFLICT (id) DO NOTHING;

    -- 2. Insert the application
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
