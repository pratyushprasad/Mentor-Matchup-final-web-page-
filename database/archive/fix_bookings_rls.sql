-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Students can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Mentors can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can view all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can update bookings" ON public.bookings;

-- Ensure RLS is enabled
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Re-create policies

-- 1. SELECT: Students can view their own bookings
CREATE POLICY "Students can view own bookings" ON public.bookings
    FOR SELECT
    USING (auth.uid() = student_id);

-- 2. SELECT: Mentors can view bookings where they are the mentor
CREATE POLICY "Mentors can view own bookings" ON public.bookings
    FOR SELECT
    USING (auth.uid() = mentor_id);

-- 3. SELECT: Admins can view all bookings
CREATE POLICY "Admins can view all bookings" ON public.bookings
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

-- 4. INSERT: Authenticated users can create bookings for themselves
CREATE POLICY "Users can create bookings" ON public.bookings
    FOR INSERT
    WITH CHECK (auth.uid() = student_id);

-- 5. UPDATE: Admins can update bookings
CREATE POLICY "Admins can update bookings" ON public.bookings
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );
