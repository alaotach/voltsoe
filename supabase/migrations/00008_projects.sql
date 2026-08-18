-- Migration: Create projects and project_likes tables
CREATE TABLE public.projects (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  season_id       uuid NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  event_id        uuid REFERENCES public.events(id) ON DELETE SET NULL,
  title           text NOT NULL,
  description     text NOT NULL,
  image_url       text,
  demo_video_url  text,
  tags            text[],
  likes_count     int DEFAULT 0,
  is_published    boolean DEFAULT false,
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "projects_select_published" ON public.projects
  FOR SELECT USING (is_published = true);

CREATE POLICY "projects_select_own" ON public.projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "projects_select_admin" ON public.projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('core','vp','president','super_admin')
    )
  );

CREATE POLICY "projects_insert_own" ON public.projects
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND is_verified = true AND email_verified = true
    )
  );

CREATE POLICY "projects_update_own" ON public.projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "projects_update_admin" ON public.projects
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('vp','president','super_admin')
    )
  );

CREATE TABLE public.project_likes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at  timestamptz DEFAULT now(),
  UNIQUE(project_id, user_id)
);

ALTER TABLE public.project_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "likes_select_all" ON public.project_likes
  FOR SELECT USING (true);

CREATE POLICY "likes_insert_auth" ON public.project_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "likes_delete_own" ON public.project_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger to keep likes_count in sync
CREATE OR REPLACE FUNCTION public.update_project_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.projects SET likes_count = likes_count + 1 WHERE id = NEW.project_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.projects SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.project_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER project_likes_count_trigger
  AFTER INSERT OR DELETE ON public.project_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_project_likes_count();

CREATE INDEX projects_season_idx ON public.projects (season_id);
CREATE INDEX projects_user_idx ON public.projects (user_id);
CREATE INDEX projects_event_idx ON public.projects (event_id);
