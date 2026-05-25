-- Therapist application email verification
-- Adds a one-time token used to verify the email address provided in the
-- application form, plus a timestamp recording when verification completed.

ALTER TABLE therapist_applications
  ADD COLUMN IF NOT EXISTS email_verification_token TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS therapist_applications_email_verification_token_idx
  ON therapist_applications (email_verification_token)
  WHERE email_verification_token IS NOT NULL;
