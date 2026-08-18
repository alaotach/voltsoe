-- Fix infinite recursion in users RLS policies

-- 1. Create a security definer function to get the current user's role.
--    SECURITY DEFINER bypasses RLS entirely so it won't trigger a recursive
--    policy check when called from inside a policy.
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.users WHERE id = auth.uid() LIMIT 1;
$$;

-- 2. Drop all the problematic recursive policies on users
DROP POLICY IF EXISTS "users_select_admin" ON public.users;
DROP POLICY IF EXISTS "users_update_admin" ON public.users;

-- Also fix any other tables that reference public.users in their policies
-- (seasons, events, etc. all have similar subqueries)
DROP POLICY IF EXISTS "seasons_admin_all" ON public.seasons;
DROP POLICY IF EXISTS "events_select_admin" ON public.events;
DROP POLICY IF EXISTS "events_insert_admin" ON public.events;
DROP POLICY IF EXISTS "events_update_admin" ON public.events;
DROP POLICY IF EXISTS "reg_links_admin" ON public.registration_links;
DROP POLICY IF EXISTS "registrations_select_admin" ON public.registrations;
DROP POLICY IF EXISTS "registrations_insert_admin" ON public.registrations;
DROP POLICY IF EXISTS "registrations_update_admin" ON public.registrations;
DROP POLICY IF EXISTS "attendance_select_admin" ON public.attendance;
DROP POLICY IF EXISTS "attendance_insert_admin" ON public.attendance;
DROP POLICY IF EXISTS "attendance_update_admin" ON public.attendance;
DROP POLICY IF EXISTS "point_rules_admin" ON public.point_rules;
DROP POLICY IF EXISTS "transactions_select_admin" ON public.point_transactions;
DROP POLICY IF EXISTS "transactions_insert_admin" ON public.point_transactions;
DROP POLICY IF EXISTS "challenges_select_admin" ON public.challenges;
DROP POLICY IF EXISTS "challenges_admin_write" ON public.challenges;

-- 3. Recreate users policies using get_my_role() instead of subqueries
CREATE POLICY "users_select_admin" ON public.users
  FOR SELECT USING (
    get_my_role() IN ('core','vp','president','super_admin')
  );

CREATE POLICY "users_update_admin" ON public.users
  FOR UPDATE USING (
    get_my_role() IN ('president','super_admin')
  );

-- 4. Recreate all other table policies using get_my_role()
CREATE POLICY "seasons_admin_all" ON public.seasons
  FOR ALL USING (get_my_role() IN ('super_admin'));

CREATE POLICY "events_select_admin" ON public.events
  FOR SELECT USING (get_my_role() IN ('core','vp','president','super_admin'));

CREATE POLICY "events_insert_admin" ON public.events
  FOR INSERT WITH CHECK (get_my_role() IN ('vp','president','super_admin'));

CREATE POLICY "events_update_admin" ON public.events
  FOR UPDATE USING (get_my_role() IN ('vp','president','super_admin'));

CREATE POLICY "reg_links_admin" ON public.registration_links
  FOR ALL USING (get_my_role() IN ('vp','president','super_admin'));

CREATE POLICY "registrations_select_admin" ON public.registrations
  FOR SELECT USING (get_my_role() IN ('core','vp','president','super_admin'));

CREATE POLICY "registrations_insert_admin" ON public.registrations
  FOR INSERT WITH CHECK (get_my_role() IN ('vp','president','super_admin'));

CREATE POLICY "registrations_update_admin" ON public.registrations
  FOR UPDATE USING (get_my_role() IN ('core','vp','president','super_admin'));

CREATE POLICY "attendance_select_admin" ON public.attendance
  FOR SELECT USING (get_my_role() IN ('core','vp','president','super_admin'));

CREATE POLICY "attendance_insert_admin" ON public.attendance
  FOR INSERT WITH CHECK (get_my_role() IN ('core','vp','president','super_admin'));

CREATE POLICY "attendance_update_admin" ON public.attendance
  FOR UPDATE USING (get_my_role() IN ('core','vp','president','super_admin'));

CREATE POLICY "point_rules_admin" ON public.point_rules
  FOR ALL USING (get_my_role() IN ('vp','president','super_admin'));

CREATE POLICY "transactions_select_admin" ON public.point_transactions
  FOR SELECT USING (get_my_role() IN ('core','vp','president','super_admin'));

CREATE POLICY "transactions_insert_admin" ON public.point_transactions
  FOR INSERT WITH CHECK (get_my_role() IN ('vp','president','super_admin'));

CREATE POLICY "challenges_select_admin" ON public.challenges
  FOR SELECT USING (get_my_role() IN ('core','vp','president','super_admin'));

CREATE POLICY "challenges_admin_write" ON public.challenges
  FOR ALL USING (get_my_role() IN ('vp','president','super_admin'));
