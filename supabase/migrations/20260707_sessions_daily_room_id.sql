-- Store the Daily.co room UUID on each session.
--
-- Why: meeting.* / participant.* webhook events identify the room by its NAME
-- (payload.room), which we already match on via sessions.daily_room_name. But
-- transcript.* events identify the room by its UUID (payload.room_id) — there is
-- no room name in those payloads. Without the UUID we can't map a transcript
-- event back to its session, so the scan/store/delete flow silently no-ops.
--
-- We capture room.id at room-creation time (Daily's POST /v1/rooms returns both
-- `id` and `name`) and match transcript events on it. Nullable + backward
-- compatible: existing rows stay null (their transcripts just won't match, which
-- is the pre-existing behaviour).

ALTER TABLE sessions ADD COLUMN IF NOT EXISTS daily_room_id TEXT;

CREATE INDEX IF NOT EXISTS idx_sessions_daily_room_id ON sessions(daily_room_id);
