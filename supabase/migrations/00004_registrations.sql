-- Migration: Create registrations table
CREATE TABLE public.registration_links (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  token           text UNIQUE NOT NULL,
  label           text,
  is_active       boolean DEFAULT true,
  created_by      uuid REFERENCES public.users(id),
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE public.registration_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reg_links_admin" ON public.registration_links
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('vp','president','super_admin')
    )
  );

CREATE TABLE public.teams (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id   uuid NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  name        text NOT NULL,
  invite_code text UNIQUE NOT NULL,
  created_by  uuid REFERENCES public.users(id),
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "teams_select_all" ON public.teams
  FOR SELECT USING (true);

CREATE POLICY "teams_insert_auth" ON public.teams
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "teams_update_owner" ON public.teams
  FOR UPDATE USING (auth.uid() = created_by);

CREATE TABLE public.team_members (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id   uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id   uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role      text NOT NULL DEFAULT 'member' CHECK (role IN ('leader','member')),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(team_id, user_id)
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "team_members_select_all" ON public.team_members
  FOR SELECT USING (true);

CREATE POLICY "team_members_insert_auth" ON public.team_members
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE TABLE public.registrations (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id             uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id              uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  team_id              uuid REFERENCES public.teams(id),
  status               text NOT NULL DEFAULT 'registered'
                         CHECK (status IN ('registered','checked_in','attended','project_submitted','points_awarded')),
  registered_at        timestamptz DEFAULT now(),
  notes                text,
  added_by             uuid REFERENCES public.users(id),
  registration_link_id uuid REFERENCES public.registration_links(id),
  UNIQUE(event_id, user_id)
);

ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Users can see their own registrations
CREATE POLICY "registrations_select_own" ON public.registrations
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can see all
CREATE POLICY "registrations_select_admin" ON public.registrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('core','vp','president','super_admin')
    )
  );

-- Verified users can register themselves
CREATE POLICY "registrations_insert_own" ON public.registrations
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND is_verified = true AND email_verified = true
    )
  );

-- Admins can insert (manual add)
CREATE POLICY "registrations_insert_admin" ON public.registrations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('vp','president','super_admin')
    )
  );

-- Admins can update status
CREATE POLICY "registrations_update_admin" ON public.registrations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('core','vp','president','super_admin')
    )
  );

CREATE INDEX registrations_event_idx ON public.registrations (event_id);
CREATE INDEX registrations_user_idx ON public.registrations (user_id);
