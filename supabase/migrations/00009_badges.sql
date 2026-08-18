-- Migration: Create badges and user_badges tables
CREATE TABLE public.badges (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text UNIQUE NOT NULL,
  name        text NOT NULL,
  description text NOT NULL,
  icon        text NOT NULL,
  criteria    jsonb,
  is_manual   boolean DEFAULT false
);

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "badges_select_all" ON public.badges
  FOR SELECT USING (true);

CREATE POLICY "badges_admin_write" ON public.badges
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('president','super_admin')
    )
  );

CREATE TABLE public.user_badges (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  badge_id    uuid NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  season_id   uuid REFERENCES public.seasons(id) ON DELETE CASCADE,
  awarded_at  timestamptz DEFAULT now(),
  awarded_by  uuid REFERENCES public.users(id),
  UNIQUE(user_id, badge_id, season_id)
);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_badges_select_all" ON public.user_badges
  FOR SELECT USING (true);

CREATE POLICY "user_badges_insert_admin" ON public.user_badges
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('vp','president','super_admin')
    )
  );

CREATE INDEX user_badges_user_idx ON public.user_badges (user_id);
CREATE INDEX user_badges_badge_idx ON public.user_badges (badge_id);
