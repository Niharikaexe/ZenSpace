-- ============================================================
-- Therapist demographics + profile narrative fields
--  - Application: gender, linkedin_url, ethnicity, date_of_birth
--  - Profile:     same demographics + session_expectations, tagline, timezone
-- ============================================================

ALTER TABLE therapist_applications
  ADD COLUMN IF NOT EXISTS gender         TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url   TEXT,
  ADD COLUMN IF NOT EXISTS ethnicity      TEXT,
  ADD COLUMN IF NOT EXISTS date_of_birth  DATE;

ALTER TABLE therapist_profiles
  ADD COLUMN IF NOT EXISTS gender                TEXT,
  ADD COLUMN IF NOT EXISTS ethnicity             TEXT,
  ADD COLUMN IF NOT EXISTS date_of_birth         DATE,
  ADD COLUMN IF NOT EXISTS linkedin_url          TEXT,
  ADD COLUMN IF NOT EXISTS session_expectations  TEXT,
  ADD COLUMN IF NOT EXISTS tagline               TEXT,
  ADD COLUMN IF NOT EXISTS timezone              TEXT;
