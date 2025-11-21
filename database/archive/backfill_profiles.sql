-- Backfill profiles for existing users
INSERT INTO public.profiles (id, full_name, email, avatar_url, created_at, updated_at)
SELECT 
    id, 
    COALESCE(raw_user_meta_data->>'full_name', email) as full_name, 
    email, 
    raw_user_meta_data->>'avatar_url' as avatar_url,
    created_at, 
    now()
FROM auth.users
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE profiles.id = auth.users.id
);

-- Output the number of profiles created (optional, for verification)
SELECT count(*) as profiles_created FROM public.profiles;
