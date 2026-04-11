-- Add soutenance validation columns to pfe_projects
ALTER TABLE pfe_projects
  ADD COLUMN IF NOT EXISTS app_validated BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS rapport_validated BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS soutenance_validated BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS soutenance_validated_at TIMESTAMPTZ;
