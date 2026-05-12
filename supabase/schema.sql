-- ============================================================
-- MindCanopy Database Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('client', 'therapist', 'admin');
CREATE TYPE subscription_status AS ENUM ('pending', 'active', 'paused', 'cancelled', 'expired');
CREATE TYPE subscription_plan AS ENUM (
  'weekly', 'monthly',
  'basic_weekly', 'basic_monthly',
  'premium_weekly', 'premium_monthly',
  'couples_basic_weekly', 'couples_basic_monthly',
  'couples_premium_weekly', 'couples_premium_monthly'
);
CREATE TYPE match_status AS ENUM ('pending', 'active', 'ended');
CREATE TYPE session_type AS ENUM ('chat', 'video');
CREATE TYPE session_status AS ENUM ('scheduled', 'ongoing', 'completed', 'cancelled');
CREATE TYPE message_type AS ENUM ('text', 'file');

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'client',
  full_name TEXT NOT NULL,
  email TEXT,
  avatar_url TEXT,
  phone TEXT,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CLIENT PROFILES
-- ============================================================

CREATE TABLE client_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date_of_birth DATE,
  gender TEXT,
  -- Questionnaire answers
  primary_concern TEXT,          -- e.g., "anxiety", "depression", "relationship"
  therapy_goals TEXT,
  previous_therapy BOOLEAN DEFAULT FALSE,
  preferred_therapist_gender TEXT,
  preferred_session_type session_type DEFAULT 'chat',
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  -- Billing details (used to populate Razorpay invoice / GST receipt)
  billing_name TEXT,
  billing_phone TEXT,
  billing_address_line1 TEXT,
  billing_address_line2 TEXT,
  billing_city TEXT,
  billing_state TEXT,
  billing_pincode TEXT,
  billing_gstin TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- THERAPIST PROFILES
-- ============================================================

CREATE TABLE therapist_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  license_number TEXT NOT NULL,
  license_state TEXT,
  specializations TEXT[] DEFAULT '{}',   -- e.g., ["anxiety", "depression", "PTSD"]
  bio TEXT,
  years_experience INTEGER DEFAULT 0,
  education TEXT,
  approach TEXT,                          -- therapeutic approach description
  languages TEXT[] DEFAULT '{"English"}',
  accepts_new_clients BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,      -- admin verifies credentials
  weekly_capacity INTEGER DEFAULT 10,     -- max clients per week
  weekly_availability JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Payout info (off-platform; stored for admin reference)
  paypal_email TEXT,
  bank_account_name TEXT,
  bank_account_number TEXT,
  bank_ifsc TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan subscription_plan NOT NULL,
  status subscription_status NOT NULL DEFAULT 'pending',
  -- Razorpay fields
  razorpay_subscription_id TEXT UNIQUE,
  razorpay_plan_id TEXT,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_customer_id TEXT,
  amount INTEGER NOT NULL,               -- in paise (INR) or cents
  currency TEXT DEFAULT 'INR',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MATCHES (admin assigns therapist to client)
-- ============================================================

CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES profiles(id),
  therapist_id UUID NOT NULL REFERENCES profiles(id),
  status match_status NOT NULL DEFAULT 'pending',
  matched_by UUID REFERENCES profiles(id),   -- admin who made the match
  notes TEXT,                                -- admin notes on why this match
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, therapist_id, status)
);

-- ============================================================
-- SESSIONS (video/chat appointments)
-- ============================================================

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES matches(id),
  session_type session_type NOT NULL DEFAULT 'chat',
  status session_status NOT NULL DEFAULT 'scheduled',
  scheduled_at TIMESTAMPTZ NOT NULL,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  -- Daily.co fields
  daily_room_url TEXT,
  daily_room_name TEXT,
  -- Notes (therapist only)
  therapist_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MESSAGES (real-time chat)
-- ============================================================

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES matches(id),
  sender_id UUID NOT NULL REFERENCES profiles(id),
  content TEXT NOT NULL,
  message_type message_type DEFAULT 'text',
  file_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- QUESTIONNAIRE RESPONSES (intake form)
-- ============================================================

CREATE TABLE questionnaire_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  responses JSONB NOT NULL,              -- full form responses as JSON
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapist_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_responses ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read their own, admins can read all
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Client profiles: own access only
CREATE POLICY "Clients can manage own profile" ON client_profiles
  FOR ALL USING (auth.uid() = user_id);

-- Therapist profiles: own access + matched clients can view
CREATE POLICY "Therapists can manage own profile" ON therapist_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Clients can view matched therapist profile" ON therapist_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.therapist_id = therapist_profiles.user_id
        AND matches.client_id = auth.uid()
        AND matches.status = 'active'
    )
  );

-- Subscriptions: clients see their own
CREATE POLICY "Clients can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = client_id);

-- Matches: clients and therapists see their own matches
CREATE POLICY "View own matches" ON matches
  FOR SELECT USING (
    auth.uid() = client_id OR auth.uid() = therapist_id
  );

-- Sessions: participants can see their sessions
CREATE POLICY "View own sessions" ON sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = sessions.match_id
        AND (matches.client_id = auth.uid() OR matches.therapist_id = auth.uid())
    )
  );

-- Messages: participants in a match can read/write
CREATE POLICY "Match participants can view messages" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = messages.match_id
        AND (matches.client_id = auth.uid() OR matches.therapist_id = auth.uid())
    )
  );

CREATE POLICY "Match participants can send messages" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = messages.match_id
        AND (matches.client_id = auth.uid() OR matches.therapist_id = auth.uid())
        AND matches.status = 'active'
    )
  );

-- Questionnaire: clients manage their own
CREATE POLICY "Clients manage own questionnaire" ON questionnaire_responses
  FOR ALL USING (auth.uid() = client_id);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create profile on signup
-- Uses CASE to validate role before casting (prevents trigger crash on bad/missing metadata)
-- SET search_path = public ensures table resolution works in all Supabase environments
-- ON CONFLICT DO NOTHING prevents duplicate-key errors if trigger fires twice
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

-- Keep email in sync when auth.users.email is updated
CREATE OR REPLACE FUNCTION sync_profile_email()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email IS DISTINCT FROM OLD.email THEN
    UPDATE profiles SET email = NEW.email WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_email_updated
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_profile_email();

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_client_profiles_updated_at BEFORE UPDATE ON client_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_therapist_profiles_updated_at BEFORE UPDATE ON therapist_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- THERAPIST INVITES (admin-generated single-use codes)
-- ============================================================

CREATE TABLE therapist_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  created_by UUID NOT NULL REFERENCES profiles(id),
  used_by UUID REFERENCES profiles(id),
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE therapist_invites ENABLE ROW LEVEL SECURITY;
-- All access goes through service role (admin client) — no public policies needed.

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_messages_match_id ON messages(match_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_matches_client_id ON matches(client_id);
CREATE INDEX idx_matches_therapist_id ON matches(therapist_id);
CREATE INDEX idx_sessions_match_id ON sessions(match_id);
CREATE INDEX idx_sessions_scheduled_at ON sessions(scheduled_at);
CREATE INDEX idx_subscriptions_client_id ON subscriptions(client_id);

-- Prevent duplicate active/pending subscriptions per client (B-11)
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_one_active_per_client
  ON subscriptions (client_id)
  WHERE status IN ('active', 'pending');

-- Prevent more than one active match per client (B-19)
CREATE UNIQUE INDEX IF NOT EXISTS idx_matches_one_active_per_client
  ON matches (client_id)
  WHERE status = 'active';

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  metadata   JSONB NOT NULL DEFAULT '{}',
  is_read    BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS notifications_user_unread
  ON notifications(user_id, is_read, created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Inserts only via service-role key (admin client)
-- Run manually after deploy:
--   ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ============================================================
-- THERAPIST APPLICATIONS
-- ============================================================

CREATE TABLE therapist_applications (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name        TEXT NOT NULL,
  email            TEXT NOT NULL UNIQUE,
  phone            TEXT,
  city             TEXT,
  license_number   TEXT NOT NULL,
  license_body     TEXT,
  years_experience INT NOT NULL DEFAULT 0,
  education        TEXT,
  specializations  TEXT[] NOT NULL DEFAULT '{}',
  languages        TEXT[] NOT NULL DEFAULT '{}',
  bio              TEXT NOT NULL,
  why_mindcanopy     TEXT,
  status           TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'approved', 'rejected', 'invited')),
  admin_notes      TEXT,
  submitted_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at      TIMESTAMPTZ
);

ALTER TABLE therapist_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a therapist application"
  ON therapist_applications FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- ============================================================
-- THERAPIST SWITCH REQUESTS
-- ============================================================

CREATE TABLE therapist_switch_requests (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  match_id     UUID REFERENCES matches(id) ON DELETE SET NULL,
  reason       TEXT,
  details      TEXT,
  status       TEXT NOT NULL DEFAULT 'pending',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actioned_at  TIMESTAMPTZ,
  actioned_by  UUID REFERENCES profiles(id) ON DELETE SET NULL
);

ALTER TABLE therapist_switch_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clients can insert own switch requests"
  ON therapist_switch_requests FOR INSERT TO authenticated
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "clients can read own switch requests"
  ON therapist_switch_requests FOR SELECT TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY "admin full access to switch requests"
  ON therapist_switch_requests FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
