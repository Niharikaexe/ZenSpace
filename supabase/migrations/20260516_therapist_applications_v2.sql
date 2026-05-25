-- ============================================================
-- Therapist applications: drop legacy required fields,
-- add location + document URLs, create storage bucket
-- ============================================================

-- 1. Relax NOT NULL on legacy fields we no longer collect
ALTER TABLE therapist_applications
  ALTER COLUMN bio DROP NOT NULL,
  ALTER COLUMN license_number DROP NOT NULL;

-- 2. Add new columns
ALTER TABLE therapist_applications
  ADD COLUMN IF NOT EXISTS country               TEXT,
  ADD COLUMN IF NOT EXISTS state                 TEXT,
  ADD COLUMN IF NOT EXISTS specialization_other  TEXT,
  ADD COLUMN IF NOT EXISTS cv_url                TEXT,
  ADD COLUMN IF NOT EXISTS certificate_urls      TEXT[] NOT NULL DEFAULT '{}';

-- 3. Storage bucket for therapist-submitted documents (CV + certificates)
INSERT INTO storage.buckets (id, name, public)
VALUES ('therapist-documents', 'therapist-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Allow anonymous uploads (public application form, no auth required).
-- Reads go through service role only (sensitive documents).
DROP POLICY IF EXISTS "Anon can upload therapist documents" ON storage.objects;
CREATE POLICY "Anon can upload therapist documents"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'therapist-documents');
