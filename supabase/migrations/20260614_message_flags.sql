-- Message safety/policy flagging.
--
-- Every chat message is scanned at send time (server-side, in the sendMessage
-- action) against a small keyword/regex list: phone numbers, email addresses,
-- "WhatsApp"/off-platform contact attempts, off-platform payment ("pay me
-- directly", UPI, etc.) and self-harm language. A match sets `flagged` and
-- records the matched reason codes (comma-separated) in `flag_reason`.
--
-- The admin dashboard reads these (service-role, bypasses RLS) to show a flag
-- badge per active match and a "Flagged only" filter — WITHOUT exposing message
-- content. Reasons are categories (e.g. "phone_number, off_platform"), not text.
--
-- Idempotent: safe to re-run.

ALTER TABLE messages ADD COLUMN IF NOT EXISTS flagged BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS flag_reason TEXT;

-- Partial index: the admin only ever queries the flagged subset, scoped by match.
CREATE INDEX IF NOT EXISTS idx_messages_flagged
  ON messages (match_id, created_at DESC)
  WHERE flagged;
