-- ============================================================
-- Therapist payment info (PayPal + Indian bank account)
-- ============================================================

ALTER TABLE therapist_profiles
  ADD COLUMN IF NOT EXISTS paypal_email TEXT,
  ADD COLUMN IF NOT EXISTS bank_account_name TEXT,
  ADD COLUMN IF NOT EXISTS bank_account_number TEXT,
  ADD COLUMN IF NOT EXISTS bank_ifsc TEXT;
