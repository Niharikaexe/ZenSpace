-- Therapist application submissions (pre-invite, public form)
create table if not exists therapist_applications (
  id              uuid primary key default gen_random_uuid(),
  full_name       text not null,
  email           text not null unique,
  phone           text,
  city            text,
  license_number  text not null,
  license_body    text,
  years_experience int not null default 0,
  education       text,
  specializations text[] not null default '{}',
  languages       text[] not null default '{}',
  bio             text not null,
  why_zenspace    text,
  -- admin review
  status          text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'invited')),
  admin_notes     text,
  submitted_at    timestamptz not null default now(),
  reviewed_at     timestamptz
);

-- Allow anyone to insert (public form, no auth required)
alter table therapist_applications enable row level security;

create policy "Anyone can submit a therapist application"
  on therapist_applications
  for insert
  to anon, authenticated
  with check (true);

-- Only admin service role can read / update applications
-- (accessed via admin client in server actions)
