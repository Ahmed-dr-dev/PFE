-- Allow any text value for meetings.type by removing old CHECK constraint
ALTER TABLE meetings
  DROP CONSTRAINT IF EXISTS meetings_type_check;

