-- Therapist switch requests — clients can request to be re-matched.
-- Admin sees these in the dashboard and can end the match + re-queue the client.

create table if not exists therapist_switch_requests (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid references profiles(id) on delete cascade not null,
  match_id     uuid references matches(id)  on delete set null,
  reason       text,
  details      text,
  status       text not null default 'pending', -- pending | actioned
  created_at   timestamptz default now() not null,
  actioned_at  timestamptz,
  actioned_by  uuid references profiles(id) on delete set null
);

alter table therapist_switch_requests enable row level security;

-- Clients can only insert their own requests
create policy "clients can insert own switch requests"
  on therapist_switch_requests for insert to authenticated
  with check (client_id = auth.uid());

-- Clients can read their own requests (so they know it was received)
create policy "clients can read own switch requests"
  on therapist_switch_requests for select to authenticated
  using (client_id = auth.uid());

-- Admin can do everything
create policy "admin full access to switch requests"
  on therapist_switch_requests for all to authenticated
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  )
  with check (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );
