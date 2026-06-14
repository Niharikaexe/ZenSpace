-- Session monitoring: join punctuality + transcript safety scanning.
--
-- Populated by the Daily webhook (/api/webhooks/daily):
--   * participant.joined  → *_joined_at + *_on_time (vs scheduled_at + grace)
--   * meeting.started/ended → started_at / ended_at / status / duration
--   * transcript.ready-to-download → transcript fetched, scanned (lib/message-flags),
--     flagged result stored, admin emailed, then the WebVTT is DELETED from Daily.
--
-- We store only the SCAN RESULT (flag categories) — never the transcript text.
-- Idempotent: safe to re-run.

ALTER TABLE sessions ADD COLUMN IF NOT EXISTS client_joined_at      TIMESTAMPTZ;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS therapist_joined_at   TIMESTAMPTZ;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS client_on_time        BOOLEAN;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS therapist_on_time     BOOLEAN;

-- Transcript pipeline. transcript_status: null | 'started' | 'scanned' | 'error'.
-- transcript_flag_reason holds comma-separated category codes (never content).
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS transcript_status      TEXT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS transcript_flagged     BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS transcript_flag_reason TEXT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS transcript_scanned_at  TIMESTAMPTZ;

-- The webhook maps Daily room name → session; index for that lookup.
CREATE INDEX IF NOT EXISTS idx_sessions_daily_room_name
  ON sessions (daily_room_name);
