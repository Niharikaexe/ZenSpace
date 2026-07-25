-- Post-session feedback from clients.
--
-- One row per session. The client answers from the feedback email: tapping a star
-- or an option in the email records that answer immediately (partial row), and the
-- landing page fills in the rest. So every column except session_id is nullable —
-- a row with only a rating is a valid, useful row.
--
-- Written notes are for the MindCanopy team, not the therapist. Nothing here is
-- exposed to therapists by any policy; reads go through the service role (admin
-- client) only, same as email_logs.

CREATE TABLE IF NOT EXISTS session_feedback (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- What is being rated. One feedback row per session.
  session_id    UUID NOT NULL UNIQUE REFERENCES sessions(id) ON DELETE CASCADE,
  match_id      UUID REFERENCES matches(id) ON DELETE SET NULL,
  client_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  therapist_id  UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Q1: star rating, 1-5.
  rating        SMALLINT CHECK (rating BETWEEN 1 AND 5),

  -- Q2: "Did you feel heard?"
  felt_heard    TEXT CHECK (felt_heard IN ('yes', 'somewhat', 'no')),

  -- Q3: "Would you book with them again?" — 'switch' is the churn signal.
  book_again    TEXT CHECK (book_again IN ('yes', 'unsure', 'switch')),

  -- Free-text note, entered on the landing page (mail clients strip text boxes).
  note          TEXT,

  -- Lifecycle. first_answered_at is set by the one-tap answer from the email;
  -- submitted_at is set only when they complete the form on the page.
  first_answered_at TIMESTAMPTZ,
  submitted_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Admin views: newest first, worst ratings first, and per-therapist averages.
CREATE INDEX IF NOT EXISTS session_feedback_created_at_idx
  ON session_feedback (created_at DESC);
CREATE INDEX IF NOT EXISTS session_feedback_therapist_idx
  ON session_feedback (therapist_id) WHERE therapist_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS session_feedback_rating_idx
  ON session_feedback (rating) WHERE rating IS NOT NULL;
-- Surfacing "needs attention": low rating or an explicit switch request.
CREATE INDEX IF NOT EXISTS session_feedback_attention_idx
  ON session_feedback (created_at DESC)
  WHERE rating <= 3 OR book_again = 'switch';

-- Keep updated_at honest on partial saves.
CREATE OR REPLACE FUNCTION touch_session_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS session_feedback_touch_updated_at ON session_feedback;
CREATE TRIGGER session_feedback_touch_updated_at
  BEFORE UPDATE ON session_feedback
  FOR EACH ROW EXECUTE FUNCTION touch_session_feedback_updated_at();

ALTER TABLE session_feedback ENABLE ROW LEVEL SECURITY;

-- A client may read their own feedback (so the page can show what they already
-- answered). Writes go through the service role, which lets us validate the
-- session belongs to them and stamp the timestamps server-side.
DROP POLICY IF EXISTS "Clients can view their own session feedback" ON session_feedback;
CREATE POLICY "Clients can view their own session feedback" ON session_feedback
  FOR SELECT USING (client_id = auth.uid());

-- Deliberately no therapist policy: therapists never read client feedback.
-- Deliberately no client INSERT/UPDATE policy: the server action owns writes.

-- Tracks which sessions we have already emailed, so the cron never double-sends.
ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS feedback_email_sent_at TIMESTAMPTZ;
