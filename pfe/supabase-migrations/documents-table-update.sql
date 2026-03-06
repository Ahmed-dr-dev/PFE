-- Update documents table: category check to match Suivi (progress) categories.
-- Run in Supabase SQL Editor.

-- 1) Map existing rows with old categories to new allowed values (optional; run if you have data)
UPDATE public.documents
SET category = 'Autre'
WHERE category IS NOT NULL
  AND category <> ALL (ARRAY[
    'Rapport d''avancement', 'Livrable', 'Présentation', 'Document de travail', 'Autre'
  ]);

-- 2) Drop old constraint and add new one
ALTER TABLE public.documents
  DROP CONSTRAINT IF EXISTS documents_category_check;

ALTER TABLE public.documents
  ADD CONSTRAINT documents_category_check CHECK (
    category = ANY (ARRAY[
      'Rapport d''avancement'::text,
      'Livrable'::text,
      'Présentation'::text,
      'Document de travail'::text,
      'Autre'::text
    ])
  );
