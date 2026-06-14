-- Client's preferred session format (captured in the questionnaire).
--
-- The existing client_profiles.preferred_session_type is the shared session_type
-- enum (chat|video) and cannot express "either", so we use a dedicated text
-- column. Source of truth for the admin's "Session preference" field.
--
-- Idempotent: safe to re-run.

ALTER TABLE client_profiles
  ADD COLUMN IF NOT EXISTS preferred_session_format TEXT
  CHECK (preferred_session_format IN ('chat', 'video', 'either'));

-- Clean up the legacy enum column. It defaulted to 'chat' and was never written
-- by the questionnaire, so every existing row reads 'chat' regardless of input.
-- 1) Drop the misleading default so future rows are null unless a real choice is set.
ALTER TABLE client_profiles ALTER COLUMN preferred_session_type DROP DEFAULT;

-- 2) Null out rows that predate preferred_session_format (no real choice recorded).
--    Rows created after this feature have both columns set and are left untouched.
UPDATE client_profiles
  SET preferred_session_type = NULL
  WHERE preferred_session_format IS NULL;
