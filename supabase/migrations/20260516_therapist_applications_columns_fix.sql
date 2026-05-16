-- ============================================================
-- Self-healing: ensure every column the apply form writes exists
-- on therapist_applications. Safe to re-run; uses IF NOT EXISTS.
-- ============================================================

ALTER TABLE therapist_applications
  ADD COLUMN IF NOT EXISTS phone                 TEXT,
  ADD COLUMN IF NOT EXISTS city                  TEXT,
  ADD COLUMN IF NOT EXISTS state                 TEXT,
  ADD COLUMN IF NOT EXISTS country               TEXT,
  ADD COLUMN IF NOT EXISTS gender                TEXT,
  ADD COLUMN IF NOT EXISTS ethnicity             TEXT,
  ADD COLUMN IF NOT EXISTS date_of_birth         DATE,
  ADD COLUMN IF NOT EXISTS linkedin_url          TEXT,
  ADD COLUMN IF NOT EXISTS license_number        TEXT,
  ADD COLUMN IF NOT EXISTS license_body          TEXT,
  ADD COLUMN IF NOT EXISTS years_experience      INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS education             TEXT,
  ADD COLUMN IF NOT EXISTS specializations       TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS specialization_other  TEXT,
  ADD COLUMN IF NOT EXISTS languages             TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS bio                   TEXT,
  ADD COLUMN IF NOT EXISTS why_mindcanopy        TEXT,
  ADD COLUMN IF NOT EXISTS cv_url                TEXT,
  ADD COLUMN IF NOT EXISTS certificate_urls      TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS admin_notes           TEXT,
  ADD COLUMN IF NOT EXISTS submitted_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS reviewed_at           TIMESTAMPTZ;

-- Drop NOT NULL on legacy fields (idempotent — safe if already nullable)
DO $$
BEGIN
  BEGIN
    ALTER TABLE therapist_applications ALTER COLUMN bio DROP NOT NULL;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    ALTER TABLE therapist_applications ALTER COLUMN license_number DROP NOT NULL;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
END $$;

-- Force PostgREST to refresh its column cache so the new columns
-- are immediately writeable through Supabase.
NOTIFY pgrst, 'reload schema';
