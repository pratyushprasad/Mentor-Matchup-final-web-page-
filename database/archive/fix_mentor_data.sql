-- 1. Check if your mentor exists
SELECT * FROM mentors;

-- 2. If the mentor exists but is not verified, verify them
UPDATE mentors 
SET is_verified = true 
WHERE is_verified = false;

-- 3. If the mentor does NOT exist, insert them from the approved applications
INSERT INTO mentors (id, is_verified, rating, sessions_count, price_per_session)
SELECT user_id, true, 5.0, 0, 0
FROM mentor_applications 
WHERE status = 'approved'
ON CONFLICT (id) DO UPDATE SET is_verified = true;

-- 4. Check the result
SELECT * FROM mentors WHERE is_verified = true;
