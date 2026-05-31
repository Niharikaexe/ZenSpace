-- Adds expected salary fields to the therapist application form.
-- Captured during apply so admin can match candidates to the right tier
-- of clients and see salary expectations alongside the rest of the application.
--
-- Currency is constrained to INR or USD to match the toggle in the apply form.
-- Therapist payouts are still handled off-platform, this is for visibility only.

ALTER TABLE therapist_applications
  ADD COLUMN IF NOT EXISTS expected_salary NUMERIC,
  ADD COLUMN IF NOT EXISTS expected_salary_currency TEXT
    CHECK (expected_salary_currency IN ('INR', 'USD'));
