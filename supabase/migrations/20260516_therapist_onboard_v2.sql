-- ============================================================
-- Therapist onboarding v2:
--  0. Ensure therapist_invites exists (was only in schema.sql before)
--  1. Link invite codes back to their source application (for prefill)
--  2. Relax license_number NOT NULL on therapist_profiles
--  3. Add license_country, previous_experience, pronouns to therapist_profiles
-- ============================================================

-- 0. Create therapist_invites if it doesn't already exist
CREATE TABLE IF NOT EXISTS therapist_invites (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT UNIQUE NOT NULL,
  created_by  UUID NOT NULL REFERENCES profiles(id),
  used_by     UUID REFERENCES profiles(id),
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE therapist_invites ENABLE ROW LEVEL SECURITY;
-- All access goes through service role (admin client). No public policies needed.

-- 1. Link invite -> application
ALTER TABLE therapist_invites
  ADD COLUMN IF NOT EXISTS application_id UUID
    REFERENCES therapist_applications(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_therapist_invites_application_id
  ON therapist_invites(application_id);

-- 2. Drop the legacy NOT NULL on license_number (we no longer collect it on onboard).
--    Wrap in a DO block so re-running on a DB where it's already nullable is a no-op.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'therapist_profiles'
      AND column_name = 'license_number'
      AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE therapist_profiles ALTER COLUMN license_number DROP NOT NULL;
  END IF;
END $$;

-- 3. New profile columns
ALTER TABLE therapist_profiles
  ADD COLUMN IF NOT EXISTS license_country       TEXT,
  ADD COLUMN IF NOT EXISTS previous_experience   TEXT,
  ADD COLUMN IF NOT EXISTS pronouns              TEXT;
