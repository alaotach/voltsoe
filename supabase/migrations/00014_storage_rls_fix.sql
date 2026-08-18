-- Migration: Simplify storage RLS
-- Drop the restrictive policies that caused errors due to cross-schema JOINs and missing SELECT for upsert

DROP POLICY IF EXISTS "Avatars insert" ON storage.objects;
DROP POLICY IF EXISTS "Avatars update" ON storage.objects;
DROP POLICY IF EXISTS "Event covers insert" ON storage.objects;
DROP POLICY IF EXISTS "Event covers update" ON storage.objects;
DROP POLICY IF EXISTS "Project images insert" ON storage.objects;
DROP POLICY IF EXISTS "Project images update" ON storage.objects;

-- Provide comprehensive permissions for the 3 buckets
-- SELECT is required for 'upsert: true' to check if the file already exists
CREATE POLICY "storage_select_all" ON storage.objects 
  FOR SELECT TO public USING (bucket_id IN ('avatars', 'event-covers', 'project-images'));

CREATE POLICY "storage_insert_auth" ON storage.objects 
  FOR INSERT TO authenticated WITH CHECK (bucket_id IN ('avatars', 'event-covers', 'project-images'));

CREATE POLICY "storage_update_auth" ON storage.objects 
  FOR UPDATE TO authenticated USING (bucket_id IN ('avatars', 'event-covers', 'project-images'));
