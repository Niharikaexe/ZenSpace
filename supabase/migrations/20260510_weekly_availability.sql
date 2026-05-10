-- Replace free-text availability_text with structured weekly_availability JSON
ALTER TABLE therapist_profiles
  ADD COLUMN IF NOT EXISTS weekly_availability JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE therapist_profiles
  DROP COLUMN IF EXISTS availability_text;
