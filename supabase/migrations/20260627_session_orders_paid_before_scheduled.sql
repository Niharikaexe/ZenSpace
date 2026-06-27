-- Pay-as-you-go hardening: a session is created (status='scheduled') ONLY after
-- Cashfree confirms payment. At checkout-open time we record an order intent in
-- session_orders (NOT a session). A DB trigger guarantees no unpaid session can
-- ever be 'scheduled'/'ongoing'/'completed'.

-- 1. Cancel any pre-existing unpaid 'scheduled' sessions (old broken flow).
UPDATE sessions
SET status = 'cancelled', updated_at = NOW()
WHERE status = 'scheduled' AND payment_status IS DISTINCT FROM 'paid';

-- 2. Order-intent table (recorded at checkout-open; not a session, not paid).
CREATE TABLE IF NOT EXISTS session_orders (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id               TEXT UNIQUE NOT NULL,
  match_id               UUID NOT NULL REFERENCES matches(id)  ON DELETE CASCADE,
  client_id              UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  therapist_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  scheduled_at           TIMESTAMPTZ NOT NULL,
  category               TEXT,
  tier                   TEXT,
  client_amount_paise    INTEGER NOT NULL,
  therapist_payout_paise INTEGER,
  status                 TEXT NOT NULL DEFAULT 'created', -- created | paid | failed | expired
  cf_payment_id          TEXT,
  session_id             UUID REFERENCES sessions(id) ON DELETE SET NULL,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at                TIMESTAMPTZ,
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_session_orders_status ON session_orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_session_orders_match  ON session_orders(match_id);

ALTER TABLE session_orders ENABLE ROW LEVEL SECURITY; -- service-role only

-- 3. Hard guarantee: scheduled/ongoing/completed requires payment_status='paid'.
CREATE OR REPLACE FUNCTION enforce_session_paid_before_active()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('scheduled','ongoing','completed')
     AND NEW.payment_status IS DISTINCT FROM 'paid' THEN
    RAISE EXCEPTION
      'session % cannot be % while payment_status=% (must be paid)',
      NEW.id, NEW.status, COALESCE(NEW.payment_status,'null')
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_session_paid ON sessions;
CREATE TRIGGER trg_enforce_session_paid
  BEFORE INSERT OR UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION enforce_session_paid_before_active();
