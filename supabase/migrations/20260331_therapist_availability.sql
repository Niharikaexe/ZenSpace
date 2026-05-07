-- Add availability_text to therapist_profiles
-- Therapists describe their available times in free text so clients can
-- schedule sessions at suitable times.

alter table therapist_profiles
  add column if not exists availability_text text;
