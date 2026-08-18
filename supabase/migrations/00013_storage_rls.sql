-- Migration: Storage RLS
-- Allows authenticated users to upload to the public buckets.

-- Allow any authenticated user to upload/update their own avatars
CREATE POLICY "Avatars insert" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "Avatars update" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'avatars');

-- Allow admins to upload event covers
CREATE POLICY "Event covers insert" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'event-covers' AND 
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('vp','president','super_admin'))
  );
CREATE POLICY "Event covers update" ON storage.objects
  FOR UPDATE TO authenticated USING (
    bucket_id = 'event-covers' AND 
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('vp','president','super_admin'))
  );

-- Allow verified users to upload project images
CREATE POLICY "Project images insert" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'project-images' AND 
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND (is_verified = true OR role IN ('vp','president','super_admin')))
  );
CREATE POLICY "Project images update" ON storage.objects
  FOR UPDATE TO authenticated USING (
    bucket_id = 'project-images' AND 
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND (is_verified = true OR role IN ('vp','president','super_admin')))
  );
