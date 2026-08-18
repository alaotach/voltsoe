-- Migration: Create attendance table
CREATE TABLE public.attendance (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  checked_in_at   timestamptz DEFAULT now(),
  marked_by       uuid REFERENCES public.users(id),
  method          text NOT NULL DEFAULT 'manual',
  override_reason text,
  UNIQUE(event_id, user_id)
);

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Users can see their own attendance
CREATE POLICY "attendance_select_own" ON public.attendance
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can see all attendance
CREATE POLICY "attendance_select_admin" ON public.attendance
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('core','vp','president','super_admin')
    )
  );

-- Core+ can mark attendance
CREATE POLICY "attendance_insert_admin" ON public.attendance
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('core','vp','president','super_admin')
    )
  );

CREATE POLICY "attendance_update_admin" ON public.attendance
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('core','vp','president','super_admin')
    )
  );

CREATE INDEX attendance_event_idx ON public.attendance (event_id);
CREATE INDEX attendance_user_idx ON public.attendance (user_id);
