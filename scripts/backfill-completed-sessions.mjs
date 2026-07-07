// Backfill sessions that actually happened on Daily but were never marked
// `completed` (because the webhook wasn't registered yet). For each stuck session
// it asks Daily whether a real meeting took place in that room and, if so, marks
// the session completed + records attendance — which credits the therapist's
// payout on the payment dashboard.
//
// SAFE BY DEFAULT: runs in dry-run mode and only PRINTS what it would do. Pass
// --apply to actually write the updates.
//
// Usage (PowerShell):
//   $env:DAILY_API_KEY="..."
//   $env:NEXT_PUBLIC_SUPABASE_URL="https://okbqigqewzuunjaikwur.supabase.co"
//   $env:SUPABASE_SERVICE_ROLE_KEY="..."
//   node scripts/backfill-completed-sessions.mjs           # dry run (preview)
//   node scripts/backfill-completed-sessions.mjs --apply   # actually update
//
// A session is completed only if Daily shows a FINISHED (not ongoing) meeting in
// its room with at least one participant — so genuine no-shows are left alone.

import { createClient } from '@supabase/supabase-js'

const DAILY_API_KEY = process.env.DAILY_API_KEY
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const APPLY = process.argv.includes('--apply')

const ON_TIME_GRACE_MS = 5 * 60 * 1000

for (const [name, val] of Object.entries({ DAILY_API_KEY, NEXT_PUBLIC_SUPABASE_URL: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY: SERVICE_KEY })) {
  if (!val) {
    console.error(`✖ Missing env var: ${name}`)
    process.exit(1)
  }
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })

console.log(APPLY ? '● APPLY mode — changes WILL be written.\n' : '● DRY RUN — no changes written. Re-run with --apply to commit.\n')

// 1. Stuck sessions: paid, still scheduled/ongoing, scheduled in the past, with a room.
const { data: sessions, error } = await supabase
  .from('sessions')
  .select('id, scheduled_at, daily_room_name, status, match_id, matches!inner(client_id, therapist_id)')
  .eq('payment_status', 'paid')
  .in('status', ['scheduled', 'ongoing'])
  .lt('scheduled_at', new Date().toISOString())
  .not('daily_room_name', 'is', null)
  .order('scheduled_at', { ascending: false })

if (error) {
  console.error('✖ Failed to load sessions:', error.message)
  process.exit(1)
}

if (!sessions || sessions.length === 0) {
  console.log('Nothing to backfill — no stuck paid sessions found.')
  process.exit(0)
}

console.log(`Found ${sessions.length} stuck session(s) to check against Daily.\n`)

// Names for a readable report.
const partyIds = [...new Set(sessions.flatMap(s => [s.matches.client_id, s.matches.therapist_id]))]
const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', partyIds)
const nameById = new Map((profiles ?? []).map(p => [p.id, p.full_name ?? p.id]))

let completed = 0, skipped = 0

for (const s of sessions) {
  const clientId = s.matches.client_id
  const therapistId = s.matches.therapist_id
  const label = `${nameById.get(clientId)} → ${nameById.get(therapistId)}  (${s.scheduled_at})  room=${s.daily_room_name}`

  // 2. Ask Daily what meetings happened in this room.
  const res = await fetch(`https://api.daily.co/v1/meetings?room=${encodeURIComponent(s.daily_room_name)}`, {
    headers: { Authorization: `Bearer ${DAILY_API_KEY}` },
  })
  if (!res.ok) {
    console.log(`  ⏭  SKIP  ${label}\n         Daily lookup failed (HTTP ${res.status})`)
    skipped++
    continue
  }
  const body = await res.json()
  const meetings = Array.isArray(body?.data) ? body.data : []
  const finished = meetings.filter(m => m.ongoing === false)

  if (finished.length === 0) {
    console.log(`  ⏭  SKIP  ${label}\n         No finished meeting in Daily (never held, or still ongoing).`)
    skipped++
    continue
  }

  // 3. Aggregate attendance + timing across the room's finished meetings.
  let startMin = Infinity, endMax = -Infinity
  let therapistJoin = null, clientJoin = null
  for (const m of finished) {
    const startS = Number(m.start_time)
    const durS = Number(m.duration ?? 0)
    if (!Number.isNaN(startS)) {
      startMin = Math.min(startMin, startS)
      endMax = Math.max(endMax, startS + (Number.isNaN(durS) ? 0 : durS))
    }
    for (const p of m.participants ?? []) {
      const isTher = p.user_id === therapistId || String(p.user_name).toLowerCase() === 'therapist'
      const isCli = p.user_id === clientId || String(p.user_name).toLowerCase() === 'client'
      const jt = Number(p.join_time)
      if (Number.isNaN(jt)) continue
      if (isTher) therapistJoin = therapistJoin == null ? jt : Math.min(therapistJoin, jt)
      if (isCli) clientJoin = clientJoin == null ? jt : Math.min(clientJoin, jt)
    }
  }

  if (therapistJoin == null && clientJoin == null) {
    console.log(`  ⏭  SKIP  ${label}\n         Finished meeting had no identifiable participants.`)
    skipped++
    continue
  }

  const scheduledMs = new Date(s.scheduled_at).getTime()
  const update = {
    status: 'completed',
    started_at: Number.isFinite(startMin) ? new Date(startMin * 1000).toISOString() : null,
    ended_at: Number.isFinite(endMax) ? new Date(endMax * 1000).toISOString() : new Date().toISOString(),
    duration_minutes: Number.isFinite(startMin) && Number.isFinite(endMax)
      ? Math.max(0, Math.round((endMax - startMin) / 60)) : null,
  }
  if (therapistJoin != null) {
    update.therapist_joined_at = new Date(therapistJoin * 1000).toISOString()
    update.therapist_on_time = therapistJoin * 1000 <= scheduledMs + ON_TIME_GRACE_MS
  }
  if (clientJoin != null) {
    update.client_joined_at = new Date(clientJoin * 1000).toISOString()
    update.client_on_time = clientJoin * 1000 <= scheduledMs + ON_TIME_GRACE_MS
  }

  const who = [therapistJoin != null ? 'therapist' : null, clientJoin != null ? 'client' : null].filter(Boolean).join('+')
  console.log(`  ✓  DONE  ${label}\n         attended: ${who} · duration ${update.duration_minutes ?? '?'} min`)

  if (APPLY) {
    const { error: updErr } = await supabase.from('sessions').update(update).eq('id', s.id)
    if (updErr) {
      console.log(`         ✖ update failed: ${updErr.message}`)
      skipped++
      continue
    }
  }
  completed++
}

console.log(`\n${APPLY ? 'Applied' : 'Would complete'}: ${completed} · skipped: ${skipped}`)
if (!APPLY && completed > 0) console.log('Re-run with --apply to write these changes.')
