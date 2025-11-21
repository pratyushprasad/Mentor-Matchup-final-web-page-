-- FIX AND RESET ALL SCRIPT
-- This script will:
-- 1. Drop and Re-create the submit_mentor_application RPC function
-- 2. Reset tables (mentors, applications)
-- 3. Seed colleges with correct columns
-- 4. Ensure RLS policies are correct

-- 1. RE-CREATE RPC FUNCTION
CREATE OR REPLACE FUNCTION public.submit_mentor_application(
    p_user_id uuid,
    p_full_name text,
    p_email text,
    p_phone text,
    p_bio text,
    p_college_name text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER -- Bypass RLS
AS $$
DECLARE
    v_application_id bigint;
BEGIN
    -- Check if application already exists
    IF EXISTS (SELECT 1 FROM public.mentor_applications WHERE user_id = p_user_id) THEN
        RETURN json_build_object('success', false, 'message', 'Application already exists');
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
    )
    RETURNING id INTO v_application_id;

    RETURN json_build_object('success', true, 'application_id', v_application_id);
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'message', SQLERRM);
END;
$$;

-- 2. RESET DATA
TRUNCATE TABLE public.mentors CASCADE;
TRUNCATE TABLE public.mentor_applications CASCADE;

-- 3. SEED COLLEGES (Corrected with category)
INSERT INTO public.colleges (name, location, category, description, image_url)
SELECT 'IIT Bombay', 'Mumbai', 'Engineering', 'Indian Institute of Technology Bombay', 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80'
WHERE NOT EXISTS (SELECT 1 FROM public.colleges WHERE name = 'IIT Bombay');

INSERT INTO public.colleges (name, location, category, description, image_url)
SELECT 'IIT Delhi', 'Delhi', 'Engineering', 'Indian Institute of Technology Delhi', 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80'
WHERE NOT EXISTS (SELECT 1 FROM public.colleges WHERE name = 'IIT Delhi');

INSERT INTO public.colleges (name, location, category, description, image_url)
SELECT 'BITS Pilani', 'Pilani', 'Engineering', 'Birla Institute of Technology and Science', 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80'
WHERE NOT EXISTS (SELECT 1 FROM public.colleges WHERE name = 'BITS Pilani');

INSERT INTO public.colleges (name, location, category, description, image_url)
SELECT 'NIT Trichy', 'Trichy', 'Engineering', 'National Institute of Technology Trichy', 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80'
WHERE NOT EXISTS (SELECT 1 FROM public.colleges WHERE name = 'NIT Trichy');

-- 4. ENSURE RLS POLICIES (Idempotent checks)
DO $$
BEGIN
    -- Mentor Applications Policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can create applications') THEN
        CREATE POLICY "Users can create applications" ON public.mentor_applications FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all applications') THEN
        CREATE POLICY "Admins can view all applications" ON public.mentor_applications FOR SELECT USING (
            EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can update applications') THEN
        CREATE POLICY "Admins can update applications" ON public.mentor_applications FOR UPDATE USING (
            EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
        );
    END IF;
END
$$;

-- 5. VERIFY
SELECT count(*) as college_count FROM public.colleges;
SELECT routine_name FROM information_schema.routines WHERE routine_name = 'submit_mentor_application';
