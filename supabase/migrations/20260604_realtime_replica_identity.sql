-- Reliable Realtime UPDATE/DELETE delivery under RLS.
--
-- The client/therapist dashboards subscribe to sessions + matches changes. Those
-- RLS policies reference row columns (match_id / client_id / therapist_id), so
-- for UPDATE and DELETE events Realtime must have the full row to evaluate the
-- policy. Without REPLICA IDENTITY FULL the old tuple only carries the primary
-- key and some UPDATE/DELETE events silently fail to deliver (e.g. cancelling a
-- session, marking it completed, ending a match).
--
-- Idempotent: REPLICA IDENTITY FULL is safe to re-run.

ALTER TABLE sessions REPLICA IDENTITY FULL;
ALTER TABLE matches  REPLICA IDENTITY FULL;
