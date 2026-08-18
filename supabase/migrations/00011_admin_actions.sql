-- Migration: Create admin_actions table (append-only audit log)
CREATE TABLE public.admin_actions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id    uuid NOT NULL REFERENCES public.users(id),
  action      text NOT NULL,
  target_type text CHECK (target_type IN ('user','event','registration','challenge','badge','season')),
  target_id   uuid,
  metadata    jsonb,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

-- president+ can read all actions
CREATE POLICY "admin_actions_select" ON public.admin_actions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('president','super_admin')
    )
  );

-- Any admin can insert (core+ roles)
CREATE POLICY "admin_actions_insert" ON public.admin_actions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('core','vp','president','super_admin')
    )
  );

-- NO update or delete policies — append-only

CREATE INDEX admin_actions_admin_idx ON public.admin_actions (admin_id);
CREATE INDEX admin_actions_created_idx ON public.admin_actions (created_at DESC);
CREATE INDEX admin_actions_action_idx ON public.admin_actions (action);
