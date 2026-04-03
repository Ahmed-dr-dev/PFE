-- Encadrant must mark the student ready before admin can schedule a defense.
ALTER TABLE public.pfe_projects
  ADD COLUMN IF NOT EXISTS supervisor_defense_ready BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.pfe_projects.supervisor_defense_ready IS 'True when the supervisor validates the student for scheduling a defense (admin form).';

-- Defense duration (minutes) and jury as 3 professor UUIDs: [encadrant, rapporteur/autre, autre].
ALTER TABLE public.defenses
  ADD COLUMN IF NOT EXISTS duration_minutes INTEGER NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS jury_professor_ids UUID[];

COMMENT ON COLUMN public.defenses.duration_minutes IS 'Scheduled length of the defense session.';
COMMENT ON COLUMN public.defenses.jury_professor_ids IS 'Exactly 3 profiles.id (professors): student supervisor + 2 other jury members.';

INSERT INTO public.platform_settings (key, value, description) VALUES
  ('defense_period_start', '', 'Début période planification soutenances (AAAA-MM-JJ)'),
  ('defense_period_end', '', 'Fin période planification soutenances (AAAA-MM-JJ)')
ON CONFLICT (key) DO NOTHING;
