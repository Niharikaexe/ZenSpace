-- B-17: Add razorpay_order_id column so the one-time order path writes to the
-- correct column instead of abusing razorpay_plan_id.
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS razorpay_order_id text;

-- B-11: Prevent duplicate active/pending subscriptions for the same client.
-- Among all rows where status is 'active' or 'pending', client_id must be unique.
-- A concurrent insert that races past the application-level check will hit this
-- constraint and return a 23505 unique_violation, which the API catches gracefully.

CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_one_active_per_client
  ON subscriptions (client_id)
  WHERE status IN ('active', 'pending');

-- B-19: Prevent a client being assigned more than one active match at a time.
-- The application-level check in createMatch() is the first line of defence;
-- this index is the hard guarantee that the DB enforces.

CREATE UNIQUE INDEX IF NOT EXISTS idx_matches_one_active_per_client
  ON matches (client_id)
  WHERE status = 'active';
