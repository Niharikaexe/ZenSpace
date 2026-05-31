-- Adds expected session pay fields to the therapist application form.
-- Captured during apply so admin sees what the therapist would like to earn
-- per session alongside the rest of the application during review.
--
-- Currency is constrained to INR or USD to match the toggle in the apply form.
-- Therapist payouts are handled off-platform; this is for visibility only.
--
-- Handles three cases:
--   1. Fresh project: adds both columns.
--   2. Project that already ran the earlier `expected_salary` version of this
--      migration: renames the old columns to the new names.
--   3. Project where the new columns already exist: no-op via IF NOT EXISTS.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'therapist_applications'
      AND column_name = 'expected_salary'
  ) THEN
    ALTER TABLE therapist_applications
      RENAME COLUMN expected_salary TO expected_session_pay;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'therapist_applications'
      AND column_name = 'expected_salary_currency'
  ) THEN
    -- Drop the old CHECK constraint before renaming so we can re-add it
    -- with a name that reflects the new column.
    ALTER TABLE therapist_applications
      RENAME COLUMN expected_salary_currency TO expected_session_pay_currency;
  END IF;
END $$;

ALTER TABLE therapist_applications
  ADD COLUMN IF NOT EXISTS expected_session_pay NUMERIC,
  ADD COLUMN IF NOT EXISTS expected_session_pay_currency TEXT;

-- Ensure the CHECK constraint exists with the correct name.
-- Drop the legacy one if it lingered through a column rename, then add fresh.
ALTER TABLE therapist_applications
  DROP CONSTRAINT IF EXISTS therapist_applications_expected_salary_currency_check;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'therapist_applications_expected_session_pay_currency_check'
  ) THEN
    ALTER TABLE therapist_applications
      ADD CONSTRAINT therapist_applications_expected_session_pay_currency_check
      CHECK (expected_session_pay_currency IN ('INR', 'USD'));
  END IF;
END $$;
