-- Try to manually insert an application to see if it shows up
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
    auth.uid(), -- This will use your current admin user's ID, which is fine for a test
    'Test Applicant', 
    'test@example.com', 
    '1234567890', 
    'This is a manual test application.', 
    'Test College', 
    'pending'
);

-- Check if it exists
SELECT * FROM public.mentor_applications WHERE email = 'test@example.com';
