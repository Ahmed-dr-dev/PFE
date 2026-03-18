-- Default supervision capacity per professor (editable by admin)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS supervision_capacity INTEGER;

-- Initialize missing capacities for professors to 8
UPDATE profiles
SET supervision_capacity = 8
WHERE role = 'professor' AND supervision_capacity IS NULL;

