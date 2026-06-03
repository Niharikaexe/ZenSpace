-- ============================================================
-- Session bundles — prepaid monthly bundle of 4 sessions at 15% off
-- ------------------------------------------------------------
-- A client can buy a monthly bundle (MONTHLY_BUNDLE_SESSIONS sessions) up front
-- at a discount instead of paying per session. Each bundle is a small credit
-- wallet: booking a session consumes one credit (the session is created as
-- 'paid' without a fresh Razorpay charge) until the bundle is exhausted.
--
-- Price + tier/category are frozen onto the row at purchase time so later price
-- edits don't rewrite history, mirroring the per-session `sessions` columns.
-- ============================================================

-- Shared trigger helper: stamp updated_at on row updates. Defined here (idempotent)
-- because it isn't created anywhere else in the migration set.
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS session_bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  match_id UUID REFERENCES matches(id),
  category TEXT,                               -- 'individual' | 'teen' | 'couples' (frozen)
  tier TEXT,                                   -- 'standard' | 'professional' (frozen)
  credits_total INTEGER NOT NULL,
  credits_remaining INTEGER NOT NULL,
  amount_paise INTEGER NOT NULL,               -- total paid for the bundle, in paise
  per_session_paise INTEGER,                   -- frozen per-session value (amount / credits)
  status TEXT NOT NULL DEFAULT 'pending',      -- 'pending' | 'active' | 'exhausted' | 'cancelled'
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_session_bundles_client_id ON session_bundles(client_id);
CREATE INDEX IF NOT EXISTS idx_session_bundles_razorpay_order_id ON session_bundles(razorpay_order_id);

-- Only one active (credits-remaining) bundle per client at a time.
CREATE UNIQUE INDEX IF NOT EXISTS idx_session_bundles_one_active_per_client
  ON session_bundles (client_id)
  WHERE status = 'active';

ALTER TABLE session_bundles ENABLE ROW LEVEL SECURITY;

-- Clients can read their own bundles (writes go through the service role).
DROP POLICY IF EXISTS "Clients can view own bundles" ON session_bundles;
CREATE POLICY "Clients can view own bundles" ON session_bundles
  FOR SELECT
  USING (auth.uid() = client_id);

DROP TRIGGER IF EXISTS update_session_bundles_updated_at ON session_bundles;
CREATE TRIGGER update_session_bundles_updated_at BEFORE UPDATE ON session_bundles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
