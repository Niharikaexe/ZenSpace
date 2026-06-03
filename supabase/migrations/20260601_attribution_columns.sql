-- Marketing attribution columns for clients (profiles) and therapists
-- (therapist_applications). Captured on first visit, stored in localStorage,
-- attached to the form on submit. See lib/attribution.ts.
--
-- Both tables get the same column set so the admin Leads view can UNION
-- them with one query.
--
-- Naming: first_* keeps the original campaign that introduced the lead
-- (first-touch). last_* updates on every subsequent visit (last-touch).
-- The three auxiliary fields (referrer, landing_page, first_seen_at) are
-- first-touch only, since their value is mostly diagnostic and a "last
-- referrer" rarely answers a different question.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS first_utm_source TEXT,
  ADD COLUMN IF NOT EXISTS first_utm_medium TEXT,
  ADD COLUMN IF NOT EXISTS first_utm_campaign TEXT,
  ADD COLUMN IF NOT EXISTS first_utm_term TEXT,
  ADD COLUMN IF NOT EXISTS first_utm_content TEXT,
  ADD COLUMN IF NOT EXISTS last_utm_source TEXT,
  ADD COLUMN IF NOT EXISTS last_utm_medium TEXT,
  ADD COLUMN IF NOT EXISTS last_utm_campaign TEXT,
  ADD COLUMN IF NOT EXISTS last_utm_term TEXT,
  ADD COLUMN IF NOT EXISTS last_utm_content TEXT,
  ADD COLUMN IF NOT EXISTS referrer TEXT,
  ADD COLUMN IF NOT EXISTS landing_page TEXT,
  ADD COLUMN IF NOT EXISTS first_seen_at TIMESTAMPTZ,
  -- Any non-standard query params on the first touch (gclid, fbclid,
  -- utm_id, custom tags, etc.) stored as a JSON object. Shown merged in
  -- one column in the admin Leads view.
  ADD COLUMN IF NOT EXISTS extra_params JSONB;

ALTER TABLE therapist_applications
  ADD COLUMN IF NOT EXISTS first_utm_source TEXT,
  ADD COLUMN IF NOT EXISTS first_utm_medium TEXT,
  ADD COLUMN IF NOT EXISTS first_utm_campaign TEXT,
  ADD COLUMN IF NOT EXISTS first_utm_term TEXT,
  ADD COLUMN IF NOT EXISTS first_utm_content TEXT,
  ADD COLUMN IF NOT EXISTS last_utm_source TEXT,
  ADD COLUMN IF NOT EXISTS last_utm_medium TEXT,
  ADD COLUMN IF NOT EXISTS last_utm_campaign TEXT,
  ADD COLUMN IF NOT EXISTS last_utm_term TEXT,
  ADD COLUMN IF NOT EXISTS last_utm_content TEXT,
  ADD COLUMN IF NOT EXISTS referrer TEXT,
  ADD COLUMN IF NOT EXISTS landing_page TEXT,
  ADD COLUMN IF NOT EXISTS first_seen_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS extra_params JSONB;

-- Partial indexes for admin filtering. Partial because most leads will be
-- organic (NULL UTMs), and we only need the index to be fast on tagged rows.
CREATE INDEX IF NOT EXISTS idx_profiles_first_utm_source
  ON profiles (first_utm_source) WHERE first_utm_source IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_first_utm_campaign
  ON profiles (first_utm_campaign) WHERE first_utm_campaign IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_therapist_apps_first_utm_source
  ON therapist_applications (first_utm_source) WHERE first_utm_source IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_therapist_apps_first_utm_campaign
  ON therapist_applications (first_utm_campaign) WHERE first_utm_campaign IS NOT NULL;
