-- Full documents table definition (new structure).
-- Use this for new installs or reference. For existing DB use documents-table-update.sql.

CREATE TABLE IF NOT EXISTS public.documents (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  pfe_project_id uuid NULL,
  name text NOT NULL,
  file_path text NOT NULL,
  file_type text NOT NULL,
  file_size bigint NULL,
  category text NULL DEFAULT 'Autre'::text,
  uploaded_by uuid NULL,
  status text NULL DEFAULT 'pending'::text,
  uploaded_at timestamp with time zone NULL DEFAULT now(),
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT documents_pkey PRIMARY KEY (id),
  CONSTRAINT documents_pfe_project_id_fkey FOREIGN KEY (pfe_project_id) REFERENCES public.pfe_projects (id) ON DELETE CASCADE,
  CONSTRAINT documents_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.profiles (id) ON DELETE SET NULL,
  CONSTRAINT documents_category_check CHECK (
    category = ANY (ARRAY[
      'Rapport d''avancement'::text,
      'Livrable'::text,
      'Présentation'::text,
      'Document de travail'::text,
      'Autre'::text
    ])
  ),
  CONSTRAINT documents_status_check CHECK (
    status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])
  )
) TABLESPACE pg_default;
