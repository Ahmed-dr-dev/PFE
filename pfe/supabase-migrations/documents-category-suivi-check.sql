-- Suivi document titles (student upload) + legacy categories.
-- Fixes: documents_category_check rejecting CHP01, Cahier des charges, etc.

ALTER TABLE public.documents
  DROP CONSTRAINT IF EXISTS documents_category_check;

ALTER TABLE public.documents
  ADD CONSTRAINT documents_category_check CHECK (
    category = ANY (ARRAY[
      'Cahier des charges'::text,
      'CHP01'::text,
      'CHP02'::text,
      'CHP03'::text,
      'CHP04'::text,
      'Conclusion'::text,
      'Bibliographie'::text,
      'Annexes'::text,
      'Présentation'::text,
      'Rapport d''avancement'::text,
      'Livrable'::text,
      'Document de travail'::text,
      'Autre'::text
    ])
  );
