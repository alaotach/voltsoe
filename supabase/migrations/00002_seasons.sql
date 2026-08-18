-- Migration: Create seasons table
CREATE TABLE public.seasons (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text NOT NULL,
  slug             text UNIQUE NOT NULL,
  start_date       date NOT NULL,
  end_date         date NOT NULL,
  is_active        boolean DEFAULT false,
  recap_published  boolean DEFAULT false,
  created_at       timestamptz DEFAULT now()
);

ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;

-- Anyone can read seasons
CREATE POLICY "seasons_select_all" ON public.seasons
  FOR SELECT USING (true);

-- Only super_admin can insert/update/delete
CREATE POLICY "seasons_admin_all" ON public.seasons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('super_admin')
    )
  );
