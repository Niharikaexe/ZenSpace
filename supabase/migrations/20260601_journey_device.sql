-- User-journey + device capture for both clients (profiles) and therapist
-- applications. Builds on the attribution columns from
-- 20260601_attribution_columns.sql.
--
-- journey: ordered array of on-site steps before conversion, each
--   { "p": "/for/individuals", "t": "2026-06-01T09:14:00Z" }. Captured in
--   localStorage as the visitor navigates, attached at signup/apply.
-- device_*: parsed from the user agent at submit time.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS journey JSONB,
  ADD COLUMN IF NOT EXISTS device_type TEXT,
  ADD COLUMN IF NOT EXISTS device_browser TEXT,
  ADD COLUMN IF NOT EXISTS device_os TEXT;

ALTER TABLE therapist_applications
  ADD COLUMN IF NOT EXISTS journey JSONB,
  ADD COLUMN IF NOT EXISTS device_type TEXT,
  ADD COLUMN IF NOT EXISTS device_browser TEXT,
  ADD COLUMN IF NOT EXISTS device_os TEXT;
