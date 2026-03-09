-- Add audience_type: 'individual' (one student) or 'group' (all students)
ALTER TABLE meetings
  ADD COLUMN IF NOT EXISTS audience_type TEXT DEFAULT 'individual';
