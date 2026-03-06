-- General note/remarks from supervisor to the student (visible in Suivi).
ALTER TABLE public.pfe_projects
  ADD COLUMN IF NOT EXISTS supervisor_notes text NULL;
