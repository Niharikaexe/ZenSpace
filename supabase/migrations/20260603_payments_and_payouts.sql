-- ============================================================
-- Unified payment ledger + therapist payout settlement
-- ------------------------------------------------------------
-- 1. `payments` — one row per real Razorpay charge a client makes (a single
--    pay-as-you-go session OR a monthly bundle purchase). This is the canonical
--    "all money the client paid" record for reconciliation/refunds/accounting.
--    Bundle-funded sessions are NOT payments (no fresh charge) — the bundle
--    purchase is the single payment; consuming a credit just books a session.
--
-- 2. Payout settlement — `sessions.payout_status` / `payout_paid_at` /
--    `payout_batch_id` plus a `therapist_payouts` batch table track whether the
--    (off-platform) payout for each completed session has actually been paid, so
--    the therapist payment page shows true OUTSTANDING amounts instead of a
--    rolling date window (no more lose-track / double-pay).
-- ============================================================

-- is_admin() may already exist (admin_realtime migration); redefine idempotently
-- so this migration is self-contained for fresh environments.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
$$;

-- ── 1. Payment ledger ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id              UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  therapist_id           UUID REFERENCES profiles(id) ON DELETE SET NULL,
  match_id               UUID REFERENCES matches(id) ON DELETE SET NULL,
  kind                   TEXT NOT NULL CHECK (kind IN ('session', 'bundle')),
  session_id             UUID REFERENCES sessions(id) ON DELETE SET NULL,
  bundle_id              UUID REFERENCES session_bundles(id) ON DELETE SET NULL,
  amount_paise           INTEGER NOT NULL,            -- what the client paid
  therapist_payout_paise INTEGER,                     -- payout owed (session kind); null for bundles
  razorpay_order_id      TEXT,
  razorpay_payment_id    TEXT UNIQUE,                 -- dedup key (one row per charge)
  status                 TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'refunded')),
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS payments_client_id_idx    ON payments (client_id, created_at DESC);
CREATE INDEX IF NOT EXISTS payments_therapist_id_idx ON payments (therapist_id, created_at DESC);
CREATE INDEX IF NOT EXISTS payments_created_at_idx    ON payments (created_at DESC);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin reads payments" ON payments;
CREATE POLICY "admin reads payments" ON payments
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "client reads own payments" ON payments;
CREATE POLICY "client reads own payments" ON payments
  FOR SELECT USING (auth.uid() = client_id);

DROP POLICY IF EXISTS "therapist reads own payments" ON payments;
CREATE POLICY "therapist reads own payments" ON payments
  FOR SELECT USING (auth.uid() = therapist_id);
-- Writes happen via the service-role client only (verify routes) — no write policy.

-- ── 2. Payout settlement ──────────────────────────────────────────────────────
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS payout_status   TEXT NOT NULL DEFAULT 'unpaid'
  CHECK (payout_status IN ('unpaid', 'paid'));
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS payout_paid_at  TIMESTAMPTZ;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS payout_batch_id UUID;

CREATE INDEX IF NOT EXISTS sessions_payout_status_idx ON sessions (payout_status);

CREATE TABLE IF NOT EXISTS therapist_payouts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  total_paise   INTEGER NOT NULL,
  session_count INTEGER NOT NULL,
  period_start  TIMESTAMPTZ,
  period_end    TIMESTAMPTZ,
  note          TEXT,
  marked_by     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE therapist_payouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin manages payouts" ON therapist_payouts;
CREATE POLICY "admin manages payouts" ON therapist_payouts
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "therapist reads own payouts" ON therapist_payouts;
CREATE POLICY "therapist reads own payouts" ON therapist_payouts
  FOR SELECT USING (auth.uid() = therapist_id);

-- Link sessions to their payout batch (idempotent FK add).
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sessions_payout_batch_id_fkey') THEN
    ALTER TABLE sessions
      ADD CONSTRAINT sessions_payout_batch_id_fkey
      FOREIGN KEY (payout_batch_id) REFERENCES therapist_payouts(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ── Realtime publication (idempotent) so the admin dashboard reflects payout /
--    session / payment changes live. Skips any table not present.
DO $$
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY['payments', 'therapist_payouts', 'sessions'];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    CONTINUE WHEN to_regclass('public.' || t) IS NULL;
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    END IF;
  END LOOP;
END $$;

-- ── 3. Backfill the ledger from existing paid records ─────────────────────────
-- Per-session charges (skip bundle-funded sessions: they have no razorpay_payment_id).
INSERT INTO payments (client_id, therapist_id, match_id, kind, session_id,
                      amount_paise, therapist_payout_paise, razorpay_order_id,
                      razorpay_payment_id, status, created_at)
SELECT m.client_id, m.therapist_id, s.match_id, 'session', s.id,
       COALESCE(s.client_amount_paise, 0), s.therapist_payout_paise, s.razorpay_order_id,
       s.razorpay_payment_id, 'paid', COALESCE(s.paid_at, s.created_at)
FROM sessions s
JOIN matches m ON m.id = s.match_id
WHERE s.payment_status = 'paid' AND s.razorpay_payment_id IS NOT NULL
ON CONFLICT (razorpay_payment_id) DO NOTHING;

-- Bundle purchases.
INSERT INTO payments (client_id, therapist_id, match_id, kind, bundle_id,
                      amount_paise, razorpay_order_id, razorpay_payment_id, status, created_at)
SELECT b.client_id, m.therapist_id, b.match_id, 'bundle', b.id,
       b.amount_paise, b.razorpay_order_id, b.razorpay_payment_id, 'paid',
       COALESCE(b.paid_at, b.created_at)
FROM session_bundles b
LEFT JOIN matches m ON m.id = b.match_id
WHERE b.status IN ('active', 'exhausted') AND b.razorpay_payment_id IS NOT NULL
ON CONFLICT (razorpay_payment_id) DO NOTHING;
