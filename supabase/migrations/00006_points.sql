-- Migration: Create point_rules and point_transactions tables
CREATE TABLE public.point_rules (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    uuid REFERENCES public.events(id) ON DELETE SET NULL,
  season_id   uuid NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  label       text NOT NULL,
  points      int NOT NULL,
  is_active   boolean DEFAULT true,
  created_by  uuid REFERENCES public.users(id),
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE public.point_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "point_rules_select_all" ON public.point_rules
  FOR SELECT USING (true);

CREATE POLICY "point_rules_admin" ON public.point_rules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('vp','president','super_admin')
    )
  );

CREATE TABLE public.point_transactions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  season_id   uuid NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  event_id    uuid REFERENCES public.events(id) ON DELETE SET NULL,
  rule_id     uuid REFERENCES public.point_rules(id) ON DELETE SET NULL,
  points      int NOT NULL,
  reason      text NOT NULL,
  awarded_by  uuid REFERENCES public.users(id),
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;

-- Users can see their own transactions
CREATE POLICY "transactions_select_own" ON public.point_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can see all
CREATE POLICY "transactions_select_admin" ON public.point_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('core','vp','president','super_admin')
    )
  );

-- vp+ can insert transactions
CREATE POLICY "transactions_insert_admin" ON public.point_transactions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('vp','president','super_admin')
    )
  );

CREATE INDEX transactions_user_idx ON public.point_transactions (user_id);
CREATE INDEX transactions_season_idx ON public.point_transactions (season_id);
CREATE INDEX transactions_created_idx ON public.point_transactions (created_at DESC);

-- Materialized view for leaderboard performance
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

CREATE UNIQUE INDEX leaderboard_view_idx ON public.leaderboard_view (id, season_id);

-- Function to refresh leaderboard (call after point transactions)
CREATE OR REPLACE FUNCTION public.refresh_leaderboard()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.leaderboard_view;
END;
$$;
