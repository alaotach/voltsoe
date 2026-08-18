-- Migration: Create challenges and submissions tables
CREATE TABLE public.challenges (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id       uuid NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  title           text NOT NULL,
  description     text NOT NULL,
  reward_points   int NOT NULL,
  deadline        timestamptz NOT NULL,
  is_active       boolean DEFAULT true,
  is_boss         boolean DEFAULT false,
  created_by      uuid REFERENCES public.users(id),
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "challenges_select_active" ON public.challenges
  FOR SELECT USING (is_active = true);

CREATE POLICY "challenges_select_admin" ON public.challenges
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('core','vp','president','super_admin')
    )
  );

CREATE POLICY "challenges_admin_write" ON public.challenges
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('vp','president','super_admin')
    )
  );

CREATE TABLE public.submissions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id    uuid NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content         text,
  file_url        text,
  submitted_at    timestamptz DEFAULT now(),
  status          text NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','approved','rejected')),
  reviewed_by     uuid REFERENCES public.users(id),
  reviewed_at     timestamptz,
  UNIQUE(challenge_id, user_id)
);

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "submissions_select_own" ON public.submissions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "submissions_select_admin" ON public.submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('core','vp','president','super_admin')
    )
  );

CREATE POLICY "submissions_insert_own" ON public.submissions
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND is_verified = true AND email_verified = true
    )
  );

CREATE POLICY "submissions_update_admin" ON public.submissions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('vp','president','super_admin')
    )
  );

CREATE INDEX submissions_challenge_idx ON public.submissions (challenge_id);
CREATE INDEX submissions_user_idx ON public.submissions (user_id);
