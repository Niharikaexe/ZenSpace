-- Realtime enablement: admin dashboard live updates, live client<->therapist
-- chat, and live therapist-availability on the client sessions page.
--
-- The admin dashboard subscribes (browser session) to postgres_changes on every
-- table that feeds it and calls router.refresh() on any change. For Realtime to
-- DELIVER those events two things must be true for each table:
--   1. The admin's session must pass an RLS SELECT policy on the table
--      (Realtime evaluates RLS per subscriber — no policy = no event).
--   2. The table must be a member of the `supabase_realtime` publication.
--
-- Most dashboard tables only had owner-scoped policies (client/therapist sees
-- their own rows), so the admin browser session received nothing. This migration
-- adds admin-scoped SELECT policies + publication membership.
--
-- NOTE: the dashboard reads its data server-side with the service-role client,
-- which already bypasses RLS — these policies exist purely so Realtime fires for
-- the admin, and as defense-in-depth.

-- ── is_admin() helper ─────────────────────────────────────────────────────────
-- SECURITY DEFINER so it bypasses RLS when reading `profiles`. This is required
-- for the admin SELECT policy ON profiles itself — a normal subquery on profiles
-- inside a profiles policy would recurse infinitely.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ── Admin SELECT policies ─────────────────────────────────────────────────────
-- therapist_switch_requests already has an "admin full access" policy, so it is
-- intentionally omitted here.

DROP POLICY IF EXISTS "admin can read profiles" ON public.profiles;
CREATE POLICY "admin can read profiles" ON public.profiles
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "admin can read client_profiles" ON public.client_profiles;
CREATE POLICY "admin can read client_profiles" ON public.client_profiles
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "admin can read questionnaire_responses" ON public.questionnaire_responses;
CREATE POLICY "admin can read questionnaire_responses" ON public.questionnaire_responses
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "admin can read subscriptions" ON public.subscriptions;
CREATE POLICY "admin can read subscriptions" ON public.subscriptions
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "admin can read matches" ON public.matches;
CREATE POLICY "admin can read matches" ON public.matches
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "admin can read therapist_profiles" ON public.therapist_profiles;
CREATE POLICY "admin can read therapist_profiles" ON public.therapist_profiles
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "admin can read therapist_applications" ON public.therapist_applications;
CREATE POLICY "admin can read therapist_applications" ON public.therapist_applications
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "admin can read email_logs" ON public.email_logs;
CREATE POLICY "admin can read email_logs" ON public.email_logs
  FOR SELECT USING (public.is_admin());

-- ── Replica identity ──────────────────────────────────────────────────────────
-- The client sessions page subscribes to UPDATEs on its matched therapist's
-- profile (live availability). That RLS policy references row columns (user_id +
-- a matches join), so the changed row must be fully logged for Realtime to
-- evaluate the policy on UPDATE events.
ALTER TABLE public.therapist_profiles REPLICA IDENTITY FULL;

-- ── Publication membership (idempotent) ───────────────────────────────────────
DO $$
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY[
    'profiles', 'client_profiles', 'questionnaire_responses', 'subscriptions',
    'matches', 'therapist_profiles', 'therapist_applications',
    'therapist_switch_requests', 'email_logs',
    -- messages: live client<->therapist chat (subscription already in
    -- ChatInterface; RLS "Match participants can view messages" allows delivery).
    -- Without publication membership, messages only appear after a reload.
    'messages'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    -- Skip tables that don't exist in this database (avoids aborting the whole
    -- migration if a table's own migration hasn't been applied yet).
    CONTINUE WHEN to_regclass('public.' || t) IS NULL;
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    END IF;
  END LOOP;
END $$;
