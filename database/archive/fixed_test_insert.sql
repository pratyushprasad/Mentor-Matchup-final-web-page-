-- Fixed Test Insert Script
-- We use a DO block to get a real user ID so we don't get the NULL error

DO $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Get the first user found in the database
  SELECT id INTO target_user_id FROM auth.users LIMIT 1;

  -- Insert the application for that user
  INSERT INTO public.mentor_applications (
    user_id, 
    full_name, 
    email, 
    phone, 
    bio, 
    college_name, 
    status
  )
  VALUES (
    target_user_id, 
    'Test Applicant', 
    'test_fixed@example.com', 
    '1234567890', 
    'This is a manual test application.', 
    'Test College', 
    'pending'
  );
END $$;

-- Verify insertion
SELECT * FROM public.mentor_applications WHERE email = 'test_fixed@example.com';
