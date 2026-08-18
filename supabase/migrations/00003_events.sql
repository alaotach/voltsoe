-- Migration: Create events table
CREATE TABLE public.events (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id             uuid NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  title                 text NOT NULL,
  slug                  text UNIQUE NOT NULL,
  description           text,
  what_youll_build      text,
  date                  date NOT NULL,
  start_time            time NOT NULL,
  end_time              time,
  venue                 text,
  capacity              int,
  difficulty            text CHECK (difficulty IN ('beginner','intermediate','advanced')),
  prerequisites         text[],
  components_provided   text,
  what_to_bring         text,
  organizer_ids         uuid[],
  registration_open     boolean DEFAULT false,
  registration_deadline timestamptz,
  is_team_event         boolean DEFAULT false,
  cover_image_url       text,
  status                text NOT NULL DEFAULT 'draft'
                          CHECK (status IN ('draft','published','completed','cancelled')),
  created_by            uuid REFERENCES public.users(id),
  created_at            timestamptz DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Everyone can see published events
CREATE POLICY "events_select_published" ON public.events
  FOR SELECT USING (status IN ('published','completed','cancelled'));

-- Admins can see all events including drafts
CREATE POLICY "events_select_admin" ON public.events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('core','vp','president','super_admin')
    )
  );

-- vp+ can insert/update events
CREATE POLICY "events_insert_admin" ON public.events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('vp','president','super_admin')
    )
  );

CREATE POLICY "events_update_admin" ON public.events
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('vp','president','super_admin')
    )
  );

CREATE INDEX events_season_idx ON public.events (season_id);
CREATE INDEX events_date_idx ON public.events (date);
CREATE INDEX events_slug_idx ON public.events (slug);
