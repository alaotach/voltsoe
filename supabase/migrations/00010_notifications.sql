-- Migration: Create notifications and activity_feed tables
CREATE TABLE public.notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type        text NOT NULL,
  title       text NOT NULL,
  body        text NOT NULL,
  metadata    jsonb,
  is_read     boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "notifications_insert_admin" ON public.notifications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('vp','president','super_admin')
    )
  );

-- Service role can insert (for edge functions / server-side)
CREATE POLICY "notifications_insert_service" ON public.notifications
  FOR INSERT WITH CHECK (true);

CREATE INDEX notifications_user_idx ON public.notifications (user_id);
CREATE INDEX notifications_read_idx ON public.notifications (user_id, is_read);
CREATE INDEX notifications_created_idx ON public.notifications (created_at DESC);

CREATE TABLE public.activity_feed (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id   uuid NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  user_id     uuid REFERENCES public.users(id) ON DELETE SET NULL,
  team_id     uuid REFERENCES public.teams(id) ON DELETE SET NULL,
  type        text NOT NULL,
  content     jsonb NOT NULL,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;

CREATE POLICY "activity_feed_select_all" ON public.activity_feed
  FOR SELECT USING (true);

CREATE POLICY "activity_feed_insert_admin" ON public.activity_feed
  FOR INSERT WITH CHECK (true);

CREATE INDEX activity_feed_season_idx ON public.activity_feed (season_id);
CREATE INDEX activity_feed_created_idx ON public.activity_feed (created_at DESC);
