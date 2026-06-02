-- ============================================================
-- Avatars bucket: allow browser uploads (to avoid the 1 MB Server Action limit)
-- ------------------------------------------------------------
-- Profile photos now upload directly from the browser to Supabase Storage
-- instead of being proxied as a File through a Server Action (Next.js caps
-- Server Action request bodies at 1 MB). Two write contexts:
--
--   1. Therapist ONBOARDING — the account does not exist yet, so the upload is
--      anonymous. Scoped to the `onboarding/` prefix so anon can't write
--      arbitrary paths. The server action records the resulting public URL.
--
--   2. Account page (authenticated) — the user writes under their own folder
--      `therapists/<uid>/...`, enforced by matching foldername()[2] = auth.uid().
--
-- Public read stays as defined in 20260511_avatars_bucket.sql.
-- ============================================================

-- 1. Anonymous onboarding uploads (scoped to the onboarding/ prefix only)
DROP POLICY IF EXISTS "Anon upload onboarding avatar" ON storage.objects;
CREATE POLICY "Anon upload onboarding avatar"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = 'onboarding'
  );

-- 2. Authenticated users writing their OWN avatar (account page)
DROP POLICY IF EXISTS "Users upload own avatar" ON storage.objects;
CREATE POLICY "Users upload own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users update own avatar" ON storage.objects;
CREATE POLICY "Users update own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[2] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users delete own avatar" ON storage.objects;
CREATE POLICY "Users delete own avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );
