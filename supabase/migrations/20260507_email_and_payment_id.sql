-- B-18: Add email column to profiles, synced from auth.users via triggers.
-- B-09: Add razorpay_payment_id to subscriptions for idempotency tracking.

-- ── B-18: profiles.email ──────────────────────────────────────────────────────

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Backfill existing rows from auth.users
UPDATE profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id;

-- Update handle_new_user so new signups carry email into profiles
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role, email)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''), NEW.email),
    CASE
      WHEN NEW.raw_user_meta_data->>'role' IN ('client', 'therapist', 'admin')
        THEN (NEW.raw_user_meta_data->>'role')::user_role
      ELSE 'client'::user_role
    END,
    NEW.email
  )
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Keep email in sync when a user changes their email in Supabase Auth
CREATE OR REPLACE FUNCTION sync_profile_email()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email IS DISTINCT FROM OLD.email THEN
    UPDATE profiles SET email = NEW.email WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_email_updated ON auth.users;
CREATE TRIGGER on_auth_user_email_updated
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_profile_email();

-- ── B-09: subscriptions.razorpay_payment_id ───────────────────────────────────
-- Needed so subscription.charged webhook can dedup on payment ID.

ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;
