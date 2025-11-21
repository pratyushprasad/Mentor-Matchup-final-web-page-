-- Reset Mentor Workflow Data

-- 1. Clear existing mentors and applications
TRUNCATE TABLE mentors CASCADE;
TRUNCATE TABLE mentor_applications CASCADE;

-- 2. Ensure Colleges Exist (Seed if empty)
-- 2. Ensure Colleges Exist (Seed if empty)
-- Using WHERE NOT EXISTS to avoid duplicates since 'name' might not have a unique constraint
INSERT INTO colleges (name, location, category, description, image_url)
SELECT 'IIT Bombay', 'Mumbai', 'Engineering', 'Indian Institute of Technology Bombay', 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80'
WHERE NOT EXISTS (SELECT 1 FROM colleges WHERE name = 'IIT Bombay');

INSERT INTO colleges (name, location, category, description, image_url)
SELECT 'IIT Delhi', 'Delhi', 'Engineering', 'Indian Institute of Technology Delhi', 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80'
WHERE NOT EXISTS (SELECT 1 FROM colleges WHERE name = 'IIT Delhi');

INSERT INTO colleges (name, location, category, description, image_url)
SELECT 'BITS Pilani', 'Pilani', 'Engineering', 'Birla Institute of Technology and Science', 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80'
WHERE NOT EXISTS (SELECT 1 FROM colleges WHERE name = 'BITS Pilani');

INSERT INTO colleges (name, location, category, description, image_url)
SELECT 'NIT Trichy', 'Trichy', 'Engineering', 'National Institute of Technology Trichy', 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80'
WHERE NOT EXISTS (SELECT 1 FROM colleges WHERE name = 'NIT Trichy');

-- 3. Reset User Roles (Optional: Reset everyone to 'student' except admin)
-- UPDATE user_roles SET role = 'student' WHERE role = 'senior';

-- 4. Verify Data
SELECT * FROM colleges;
