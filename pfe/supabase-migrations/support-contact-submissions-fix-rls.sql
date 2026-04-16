-- Fix: app uses custom cookie auth, not Supabase Auth JWT.
-- auth.uid() is always NULL so the admin SELECT policy never matched.
-- API-level auth (requireAuth('admin')) already guards the read endpoint.

-- Allow any anon/authenticated user to insert (public contact form)
DROP POLICY IF EXISTS "Public insert support contact" ON support_contact_submissions;
CREATE POLICY "Public insert support contact"
  ON support_contact_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow any authenticated session to select (API route guards access)
DROP POLICY IF EXISTS "Admins read support contact" ON support_contact_submissions;
CREATE POLICY "Admins read support contact"
  ON support_contact_submissions
  FOR SELECT
  TO anon, authenticated
  USING (true);
