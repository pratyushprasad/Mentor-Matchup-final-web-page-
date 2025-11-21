-- Check all mentor applications in the database
SELECT * FROM mentor_applications ORDER BY created_at DESC;

-- Check if there are any applications at all
SELECT COUNT(*) as total_applications FROM mentor_applications;

-- Check pending applications specifically
SELECT COUNT(*) as pending_applications FROM mentor_applications WHERE status = 'pending';
