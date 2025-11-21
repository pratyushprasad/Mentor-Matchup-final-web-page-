-- Check mentors table content
SELECT * FROM mentors;

-- Check verified mentors specifically
SELECT * FROM mentors WHERE is_verified = true;

-- Check mentor applications for the verified mentors
SELECT * FROM mentor_applications WHERE user_id IN (SELECT id FROM mentors WHERE is_verified = true);

-- Check if there are any approved applications that are NOT in the mentors table
SELECT * FROM mentor_applications 
WHERE status = 'approved' 
AND user_id NOT IN (SELECT id FROM mentors);
