-- Email send audit log
-- One row per attempted send (from lib/email.ts), captured before AND after
-- the Resend API call. Lets the admin dashboard answer:
--   "did we try to send X to Y, and did Resend accept it?"
--
-- Live delivery / bounce / click status is NOT populated here yet — it would
-- require either fetching GET /emails/:id per row or wiring Resend webhooks.
-- Both columns are present so the schema doesn't need to change later:
--   last_status    : 'sent' | 'delivered' | 'bounced' | 'opened' | 'clicked' | 'complained'
--   last_status_at : when the status was last refreshed from Resend

CREATE TABLE IF NOT EXISTS email_logs (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resend_id               TEXT,
  recipient               TEXT NOT NULL,
  template                TEXT NOT NULL,
  subject                 TEXT,
  related_user_id         UUID,
  related_application_id  UUID,
  related_match_id        UUID,
  send_status             TEXT NOT NULL
    CHECK (send_status IN ('sent', 'failed_no_api_key', 'failed_resend_rejected', 'failed_threw')),
  send_error              TEXT,
  resend_status_code      INT,
  last_status             TEXT,
  last_status_at          TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS email_logs_recipient_idx ON email_logs (recipient);
CREATE INDEX IF NOT EXISTS email_logs_template_idx ON email_logs (template);
CREATE INDEX IF NOT EXISTS email_logs_created_at_idx ON email_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS email_logs_resend_id_idx
  ON email_logs (resend_id) WHERE resend_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS email_logs_related_user_idx
  ON email_logs (related_user_id) WHERE related_user_id IS NOT NULL;

ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
-- No client-facing policies: only the service role (admin client) reads/writes.
