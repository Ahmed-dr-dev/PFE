-- Add professor review/feedback column for corrections to student documents.
-- Run in Supabase SQL Editor.

ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS professor_review text NULL;
