-- ── Notifications ───────────────────────────────────────────────────────────
create table if not exists notifications (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references profiles(id) on delete cascade,
  type         text not null,   -- 'client_matched' | 'client_unmatched' | 'client_message'
                                --  | 'profile_verified' | 'session_scheduled' | 'session_reminder'
  title        text not null,
  body         text not null,
  metadata     jsonb not null default '{}',
  is_read      boolean not null default false,
  created_at   timestamptz not null default now()
);

create index if not exists notifications_user_unread
  on notifications(user_id, is_read, created_at desc);

-- ── RLS ──────────────────────────────────────────────────────────────────────
alter table notifications enable row level security;

-- Users read their own
create policy "users read own notifications"
  on notifications for select
  using (auth.uid() = user_id);

-- Users can mark their own as read (update is_read only)
create policy "users update own notifications"
  on notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Inserts only via service-role key (admin client) — no authenticated insert policy needed

-- ── Realtime ─────────────────────────────────────────────────────────────────
-- Enable realtime publication for this table so client subscriptions work.
-- Run in Supabase dashboard SQL editor if not automatically picked up:
--   alter publication supabase_realtime add table notifications;
