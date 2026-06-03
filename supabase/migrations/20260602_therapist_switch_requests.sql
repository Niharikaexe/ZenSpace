-- Therapist switch requests.
--
-- The table is defined in schema.sql but was never applied to the live database
-- (client switch-therapist submits failed with PGRST205 "Could not find the
-- table public.therapist_switch_requests"). This creates it idempotently with
-- its RLS policies so deployed environments catch up.

CREATE TABLE IF NOT EXISTS therapist_switch_requests (
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

CREATE INDEX IF NOT EXISTS therapist_switch_requests_status_idx
  ON therapist_switch_requests (status, created_at DESC);

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
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
