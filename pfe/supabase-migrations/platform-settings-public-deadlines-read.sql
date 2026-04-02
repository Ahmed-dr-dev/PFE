-- Allow anonymous and authenticated users to read official PFE deadline keys (landing page / public API).
-- Run in Supabase SQL Editor only if RLS on platform_settings blocks anonymous SELECT.
-- If you enable RLS on this table, ensure admins retain policies for full CRUD.

DROP POLICY IF EXISTS "Public read PFE deadline settings" ON platform_settings;
CREATE POLICY "Public read PFE deadline settings"
  ON platform_settings
  FOR SELECT
  TO anon, authenticated
  USING (
    key IN (
      'topic_submission_deadline',
      'internship_request_deadline',
      'defense_registration_deadline'
    )
  );
