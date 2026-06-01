-- Pay-as-you-go: per-session payment moves onto the sessions row.
--
-- MindCanopy no longer sells weekly/monthly subscriptions. A client pays for
-- each session when they pick a slot. The price (client) and payout (therapist)
-- are computed server-side from the client's category + the chosen therapist's
-- tier (and years of experience) and FROZEN onto the session at booking time,
-- so later price/experience edits never rewrite payout history.
--
--   payment_status   'pending' (order created, not yet paid) | 'paid'
--   category         'individual' | 'teen' | 'couples'  (frozen)
--   tier             'standard' | 'professional'         (frozen)
--
-- A session is only confirmed/visible once payment_status = 'paid'.

ALTER TABLE sessions ADD COLUMN IF NOT EXISTS client_amount_paise   INTEGER;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS therapist_payout_paise INTEGER;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS payment_status        TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS category              TEXT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS tier                  TEXT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS razorpay_order_id     TEXT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS razorpay_payment_id   TEXT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS paid_at               TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_sessions_razorpay_order_id ON sessions(razorpay_order_id);

-- Existing sessions predate per-session payment — treat them as already paid so
-- they keep showing in the client/therapist views. One-time backfill.
UPDATE sessions SET payment_status = 'paid' WHERE payment_status = 'pending';
