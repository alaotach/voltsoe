-- Migration: Create project_comments table and update projects
ALTER TABLE public.projects ADD COLUMN comments_count int DEFAULT 0;

CREATE TABLE public.project_comments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content     text NOT NULL,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE public.project_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comments_select_all" ON public.project_comments
  FOR SELECT USING (true);

CREATE POLICY "comments_insert_auth" ON public.project_comments
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND is_verified = true AND email_verified = true
    )
  );

CREATE POLICY "comments_delete_own" ON public.project_comments
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "comments_delete_admin" ON public.project_comments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('vp','president','super_admin')
    )
  );

-- Trigger to keep comments_count in sync
CREATE OR REPLACE FUNCTION public.update_project_comments_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.projects SET comments_count = comments_count + 1 WHERE id = NEW.project_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.projects SET comments_count = GREATEST(0, comments_count - 1) WHERE id = OLD.project_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER project_comments_count_trigger
  AFTER INSERT OR DELETE ON public.project_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_project_comments_count();

CREATE INDEX project_comments_project_idx ON public.project_comments (project_id);
CREATE INDEX project_comments_user_idx ON public.project_comments (user_id);
