-- Migration: Ensure all verified users have email_verified = true
UPDATE public.users 
SET email_verified = true 
WHERE is_verified = true AND email_verified = false;

-- Refresh the leaderboard to ensure the materialized view pulls them in
REFRESH MATERIALIZED VIEW public.leaderboard_view;
