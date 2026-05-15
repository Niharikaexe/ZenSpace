-- ============================================================
-- Therapist verification / residential address
--  - id_document_url (proof of identity, uploaded to therapist-documents bucket)
--  - residential address columns
--  Payment info columns (paypal_email, bank_*) already exist on therapist_profiles.
-- ============================================================

ALTER TABLE therapist_profiles
  ADD COLUMN IF NOT EXISTS id_document_url      TEXT,
  ADD COLUMN IF NOT EXISTS address_line1        TEXT,
  ADD COLUMN IF NOT EXISTS address_line2        TEXT,
  ADD COLUMN IF NOT EXISTS address_city         TEXT,
  ADD COLUMN IF NOT EXISTS address_state        TEXT,
  ADD COLUMN IF NOT EXISTS address_postal_code  TEXT,
  ADD COLUMN IF NOT EXISTS address_country      TEXT;
