-- Public support contact form submissions (home page → admin).
CREATE TABLE IF NOT EXISTS support_contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_contact_created ON support_contact_submissions(created_at DESC);

ALTER TABLE support_contact_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public insert support contact" ON support_contact_submissions;
CREATE POLICY "Public insert support contact"
  ON support_contact_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins read support contact" ON support_contact_submissions;
CREATE POLICY "Admins read support contact"
  ON support_contact_submissions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );
