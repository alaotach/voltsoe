-- Add custom_permissions array to users table
-- Permissions: mark_attendance, award_points, create_events,
--              manage_registrations, send_notifications,
--              verify_students, manage_challenges, view_reports
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS custom_permissions text[] DEFAULT '{}';
