-- Migration: Update leaderboard view to include all students with 0 points

-- 1. Drop the existing materialized view (this removes the dependent index too)
DROP MATERIALIZED VIEW IF EXISTS public.leaderboard_view CASCADE;

-- 2. Recreate it with CROSS JOIN on seasons and LEFT JOIN on point_transactions,
-- filtering only for u.role = 'student'
CREATE MATERIALIZED VIEW public.leaderboard_view AS
SELECT
  u.id,
  u.full_name,
  u.department,
  u.batch,
  u.avatar_url,
  s.id AS season_id,
  COALESCE(SUM(pt.points), 0) AS total_points,
  RANK() OVER (PARTITION BY s.id ORDER BY COALESCE(SUM(pt.points), 0) DESC, u.full_name ASC) AS rank
FROM public.users u
CROSS JOIN public.seasons s
LEFT JOIN public.point_transactions pt ON pt.user_id = u.id AND pt.season_id = s.id
WHERE u.is_verified = true 
  AND u.email_verified = true 
  AND u.is_suspended = false 
  AND u.role = 'student'
GROUP BY u.id, u.full_name, u.department, u.batch, u.avatar_url, s.id;

-- 3. Recreate the unique index for concurrent refreshes
CREATE UNIQUE INDEX leaderboard_view_idx ON public.leaderboard_view (id, season_id);
