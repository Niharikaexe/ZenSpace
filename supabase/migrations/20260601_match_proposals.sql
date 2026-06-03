-- Dual-therapist match proposals.
--
-- The admin now proposes TWO therapists per client — a Standard (basic-tier)
-- and a Professional (premium-tier) therapist — as two `pending` matches.
-- The client picks one via "Start a free chat", which flips that match to
-- `active` and ends the sibling proposal.
--
--   tier          'standard' | 'professional' (null = legacy single match)
--   admin_summary  optional interview-based blurb shown on the client's card
--
-- No enum change is needed: the existing match_status ('pending','active',
-- 'ended') and the partial unique index idx_matches_one_active_per_client
-- (only one ACTIVE match per client) already support this — two PENDING rows
-- per client are allowed.

ALTER TABLE matches ADD COLUMN IF NOT EXISTS tier TEXT;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS admin_summary TEXT;
