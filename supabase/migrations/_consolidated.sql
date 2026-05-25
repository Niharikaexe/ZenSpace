-- ============================================================================
-- MindCanopy — consolidated migrations (re-runnable, idempotent)
--
-- Run this whole file in the Supabase SQL Editor to verify every migration
-- is applied. Every statement is guarded so re-running on a fully-migrated
-- DB is a no-op.
--
-- Assumes the base schema (profiles, client_profiles, therapist_profiles,
-- subscriptions, matches, sessions, messages, etc.) is already in place from
-- supabase/schema.sql.
-- ============================================================================


-- ============================================================================
-- 1. THERAPIST APPLICATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS therapist_applications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name       TEXT NOT NULL,
  email           TEXT NOT NULL UNIQUE,
  phone           TEXT,
  city            TEXT,
  license_number  TEXT,
  license_body    TEXT,
  years_experience INT NOT NULL DEFAULT 0,
  education       TEXT,
  specializations TEXT[] NOT NULL DEFAULT '{}',
  languages       TEXT[] NOT NULL DEFAULT '{}',
  bio             TEXT,
  why_mindcanopy  TEXT,
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'approved', 'rejected', 'invited')),
  admin_notes     TEXT,
  submitted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at     TIMESTAMPTZ
);

ALTER TABLE therapist_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit a therapist application" ON therapist_applications;
CREATE POLICY "Anyone can submit a therapist application"
  ON therapist_applications FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Ensure every column the apply form writes exists
ALTER TABLE therapist_applications
  ADD COLUMN IF NOT EXISTS phone                 TEXT,
  ADD COLUMN IF NOT EXISTS city                  TEXT,
  ADD COLUMN IF NOT EXISTS state                 TEXT,
  ADD COLUMN IF NOT EXISTS country               TEXT,
  ADD COLUMN IF NOT EXISTS gender                TEXT,
  ADD COLUMN IF NOT EXISTS ethnicity             TEXT,
  ADD COLUMN IF NOT EXISTS date_of_birth         DATE,
  ADD COLUMN IF NOT EXISTS linkedin_url          TEXT,
  ADD COLUMN IF NOT EXISTS license_number        TEXT,
  ADD COLUMN IF NOT EXISTS license_body          TEXT,
  ADD COLUMN IF NOT EXISTS years_experience      INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS education             TEXT,
  ADD COLUMN IF NOT EXISTS specializations       TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS specialization_other  TEXT,
  ADD COLUMN IF NOT EXISTS languages             TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS bio                   TEXT,
  ADD COLUMN IF NOT EXISTS why_mindcanopy        TEXT,
  ADD COLUMN IF NOT EXISTS cv_url                TEXT,
  ADD COLUMN IF NOT EXISTS certificate_urls      TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS admin_notes           TEXT,
  ADD COLUMN IF NOT EXISTS submitted_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS reviewed_at           TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS email_verification_token TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS email_verified_at     TIMESTAMPTZ;

-- Drop NOT NULL on legacy fields (idempotent)
DO $$
BEGIN
  BEGIN ALTER TABLE therapist_applications ALTER COLUMN bio DROP NOT NULL;
  EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER TABLE therapist_applications ALTER COLUMN license_number DROP NOT NULL;
  EXCEPTION WHEN OTHERS THEN NULL; END;
END $$;

CREATE INDEX IF NOT EXISTS therapist_applications_email_verification_token_idx
  ON therapist_applications (email_verification_token)
  WHERE email_verification_token IS NOT NULL;


-- ============================================================================
-- 2. NOTIFICATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type         TEXT NOT NULL,
  title        TEXT NOT NULL,
  body         TEXT NOT NULL,
  metadata     JSONB NOT NULL DEFAULT '{}',
  is_read      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS notifications_user_unread
  ON notifications(user_id, is_read, created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users read own notifications" ON notifications;
CREATE POLICY "users read own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users update own notifications" ON notifications;
CREATE POLICY "users update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Realtime publication: run separately if not auto-added
--   ALTER PUBLICATION supabase_realtime ADD TABLE notifications;


-- ============================================================================
-- 3. THERAPIST PROFILES — additional columns added by later migrations
-- ============================================================================

-- Add every column added by later migrations (safe if already present)
ALTER TABLE therapist_profiles
  ADD COLUMN IF NOT EXISTS availability_text     TEXT,
  ADD COLUMN IF NOT EXISTS license_country       TEXT,
  ADD COLUMN IF NOT EXISTS previous_experience   TEXT,
  ADD COLUMN IF NOT EXISTS pronouns              TEXT,
  ADD COLUMN IF NOT EXISTS gender                TEXT,
  ADD COLUMN IF NOT EXISTS ethnicity             TEXT,
  ADD COLUMN IF NOT EXISTS date_of_birth         DATE,
  ADD COLUMN IF NOT EXISTS linkedin_url          TEXT,
  ADD COLUMN IF NOT EXISTS session_expectations  TEXT,
  ADD COLUMN IF NOT EXISTS tagline               TEXT,
  ADD COLUMN IF NOT EXISTS timezone              TEXT,
  ADD COLUMN IF NOT EXISTS id_document_url       TEXT,
  ADD COLUMN IF NOT EXISTS address_line1         TEXT,
  ADD COLUMN IF NOT EXISTS address_line2         TEXT,
  ADD COLUMN IF NOT EXISTS address_city          TEXT,
  ADD COLUMN IF NOT EXISTS address_state         TEXT,
  ADD COLUMN IF NOT EXISTS address_postal_code   TEXT,
  ADD COLUMN IF NOT EXISTS address_country       TEXT,
  ADD COLUMN IF NOT EXISTS paypal_email          TEXT,
  ADD COLUMN IF NOT EXISTS bank_account_name     TEXT,
  ADD COLUMN IF NOT EXISTS bank_account_number   TEXT,
  ADD COLUMN IF NOT EXISTS bank_ifsc             TEXT,
  ADD COLUMN IF NOT EXISTS weekly_availability   JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Drop legacy free-text availability column (replaced by weekly_availability JSONB)
ALTER TABLE therapist_profiles DROP COLUMN IF EXISTS availability_text;

-- Drop legacy NOT NULL on license_number (we don't collect it at onboarding anymore)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'therapist_profiles'
      AND column_name = 'license_number'
      AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE therapist_profiles ALTER COLUMN license_number DROP NOT NULL;
  END IF;
END $$;


-- ============================================================================
-- 4. CLIENT PROFILES — billing details (Razorpay invoices)
-- ============================================================================

ALTER TABLE client_profiles
  ADD COLUMN IF NOT EXISTS billing_name           TEXT,
  ADD COLUMN IF NOT EXISTS billing_phone          TEXT,
  ADD COLUMN IF NOT EXISTS billing_address_line1  TEXT,
  ADD COLUMN IF NOT EXISTS billing_address_line2  TEXT,
  ADD COLUMN IF NOT EXISTS billing_city           TEXT,
  ADD COLUMN IF NOT EXISTS billing_state          TEXT,
  ADD COLUMN IF NOT EXISTS billing_pincode        TEXT,
  ADD COLUMN IF NOT EXISTS billing_gstin          TEXT;


-- ============================================================================
-- 5. PROFILES.EMAIL + sync triggers (email kept in sync with auth.users)
-- ============================================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

UPDATE profiles p
SET    email = u.email
FROM   auth.users u
WHERE  p.id = u.id AND p.email IS DISTINCT FROM u.email;

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

CREATE OR REPLACE FUNCTION sync_profile_email()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email IS DISTINCT FROM OLD.email THEN
    UPDATE profiles SET email = NEW.email WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

DROP TRIGGER IF EXISTS on_auth_user_email_updated ON auth.users;
CREATE TRIGGER on_auth_user_email_updated
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_profile_email();


-- ============================================================================
-- 6. SUBSCRIPTION PLAN ENUM — 8 plan variants
-- ============================================================================

ALTER TYPE subscription_plan ADD VALUE IF NOT EXISTS 'basic_weekly';
ALTER TYPE subscription_plan ADD VALUE IF NOT EXISTS 'basic_monthly';
ALTER TYPE subscription_plan ADD VALUE IF NOT EXISTS 'premium_weekly';
ALTER TYPE subscription_plan ADD VALUE IF NOT EXISTS 'premium_monthly';
ALTER TYPE subscription_plan ADD VALUE IF NOT EXISTS 'couples_basic_weekly';
ALTER TYPE subscription_plan ADD VALUE IF NOT EXISTS 'couples_basic_monthly';
ALTER TYPE subscription_plan ADD VALUE IF NOT EXISTS 'couples_premium_weekly';
ALTER TYPE subscription_plan ADD VALUE IF NOT EXISTS 'couples_premium_monthly';


-- ============================================================================
-- 7. SUBSCRIPTIONS + MATCHES — additional columns + unique constraints
-- ============================================================================

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT,
  ADD COLUMN IF NOT EXISTS razorpay_order_id   TEXT;

-- One active/pending subscription per client (race-proof guard)
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_one_active_per_client
  ON subscriptions (client_id)
  WHERE status IN ('active', 'pending');

-- One active match per client
CREATE UNIQUE INDEX IF NOT EXISTS idx_matches_one_active_per_client
  ON matches (client_id)
  WHERE status = 'active';


-- ============================================================================
-- 8. THERAPIST INVITES
-- ============================================================================

CREATE TABLE IF NOT EXISTS therapist_invites (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT UNIQUE NOT NULL,
  created_by  UUID NOT NULL REFERENCES profiles(id),
  used_by     UUID REFERENCES profiles(id),
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE therapist_invites
  ADD COLUMN IF NOT EXISTS application_id UUID
    REFERENCES therapist_applications(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_therapist_invites_application_id
  ON therapist_invites(application_id);

ALTER TABLE therapist_invites ENABLE ROW LEVEL SECURITY;
-- All access goes through service role (admin client) — no public policies.


-- ============================================================================
-- 9. THERAPIST SWITCH REQUESTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS therapist_switch_requests (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  match_id     UUID REFERENCES matches(id) ON DELETE SET NULL,
  reason       TEXT,
  details      TEXT,
  status       TEXT NOT NULL DEFAULT 'pending',
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  actioned_at  TIMESTAMPTZ,
  actioned_by  UUID REFERENCES profiles(id) ON DELETE SET NULL
);

ALTER TABLE therapist_switch_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "clients can insert own switch requests" ON therapist_switch_requests;
CREATE POLICY "clients can insert own switch requests"
  ON therapist_switch_requests FOR INSERT TO authenticated
  WITH CHECK (client_id = auth.uid());

DROP POLICY IF EXISTS "clients can read own switch requests" ON therapist_switch_requests;
CREATE POLICY "clients can read own switch requests"
  ON therapist_switch_requests FOR SELECT TO authenticated
  USING (client_id = auth.uid());

DROP POLICY IF EXISTS "admin full access to switch requests" ON therapist_switch_requests;
CREATE POLICY "admin full access to switch requests"
  ON therapist_switch_requests FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));


-- ============================================================================
-- 10. STORAGE BUCKETS — avatars + therapist-documents
-- ============================================================================

-- avatars: public read, server-only writes (via service role)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public avatar read" ON storage.objects;
CREATE POLICY "Public avatar read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

-- therapist-documents: anonymous can upload (public application form);
-- reads happen via service role only (sensitive)
INSERT INTO storage.buckets (id, name, public)
VALUES ('therapist-documents', 'therapist-documents', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Anon can upload therapist documents" ON storage.objects;
CREATE POLICY "Anon can upload therapist documents"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'therapist-documents');


-- ============================================================================
-- 11. Refresh PostgREST schema cache
-- ============================================================================

NOTIFY pgrst, 'reload schema';
