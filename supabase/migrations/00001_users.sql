-- Migration: Create users table
CREATE TABLE public.users (
  id                  uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name           text NOT NULL,
  email               text UNIQUE NOT NULL,
  enrollment_number   text UNIQUE NOT NULL,
  batch               text NOT NULL,
  department          text NOT NULL,
  phone               text,
  role                text NOT NULL DEFAULT 'student'
                        CHECK (role IN ('student','core','vp','president','super_admin')),
  is_verified         boolean DEFAULT false,
  email_verified      boolean DEFAULT false,
  is_suspended        boolean DEFAULT false,
  avatar_url          text,
  created_at          timestamptz DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can read their own row and public profiles
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Admins can read all users
CREATE POLICY "users_select_admin" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users u2
      WHERE u2.id = auth.uid() AND u2.role IN ('core','vp','president','super_admin')
    )
  );

-- Students can read public profile fields of other verified students
CREATE POLICY "users_select_public" ON public.users
  FOR SELECT USING (is_verified = true AND email_verified = true);

-- Users can update their own profile
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert their own row
CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Admins can update any user
CREATE POLICY "users_update_admin" ON public.users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users u2
      WHERE u2.id = auth.uid() AND u2.role IN ('president','super_admin')
    )
  );

-- Index for enrollment lookups
CREATE INDEX users_enrollment_idx ON public.users (enrollment_number);
CREATE INDEX users_role_idx ON public.users (role);
