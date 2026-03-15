-- ============================================================
-- ZenSpace Database Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('client', 'therapist', 'admin');
CREATE TYPE subscription_status AS ENUM ('pending', 'active', 'paused', 'cancelled', 'expired');
CREATE TYPE subscription_plan AS ENUM ('weekly', 'monthly');
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
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'client')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
-- INDEXES
-- ============================================================

CREATE INDEX idx_messages_match_id ON messages(match_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_matches_client_id ON matches(client_id);
CREATE INDEX idx_matches_therapist_id ON matches(therapist_id);
CREATE INDEX idx_sessions_match_id ON sessions(match_id);
CREATE INDEX idx_sessions_scheduled_at ON sessions(scheduled_at);
CREATE INDEX idx_subscriptions_client_id ON subscriptions(client_id);
