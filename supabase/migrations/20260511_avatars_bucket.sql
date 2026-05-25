-- ============================================================
-- Avatars storage bucket (public-read, admin-only writes)
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow anyone to read avatar images (public bucket — also enforced by bucket flag)
DROP POLICY IF EXISTS "Public avatar read" ON storage.objects;
CREATE POLICY "Public avatar read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

-- Writes go through the admin client (service role bypasses RLS) — no public write policy.
