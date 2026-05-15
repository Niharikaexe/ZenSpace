-- ============================================================
-- Therapist onboarding v2:
--  1. Link invite codes back to their source application (for prefill)
--  2. Relax license_number NOT NULL on therapist_profiles
--  3. Add license_country, previous_experience, pronouns to therapist_profiles
-- ============================================================

-- 1. Link invite -> application
ALTER TABLE therapist_invites
  ADD COLUMN IF NOT EXISTS application_id UUID
    REFERENCES therapist_applications(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_therapist_invites_application_id
  ON therapist_invites(application_id);

-- 2. Drop the legacy NOT NULL on license_number (we no longer collect it on onboard)
ALTER TABLE therapist_profiles
  ALTER COLUMN license_number DROP NOT NULL;

-- 3. New profile columns
ALTER TABLE therapist_profiles
  ADD COLUMN IF NOT EXISTS license_country       TEXT,
  ADD COLUMN IF NOT EXISTS previous_experience   TEXT,
  ADD COLUMN IF NOT EXISTS pronouns              TEXT;
