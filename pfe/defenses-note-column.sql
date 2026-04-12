-- Add grading fields to defenses table
-- Run in Supabase SQL editor

ALTER TABLE defenses
  ADD COLUMN IF NOT EXISTS note numeric(4,2) CHECK (note IS NULL OR (note >= 0 AND note <= 20)),
  ADD COLUMN IF NOT EXISTS note_comment text;
