import { NextResponse, after } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { scanText, labelReasons } from '@/lib/message-flags'
import { sendAdminTranscriptFlagEmail } from '@/lib/email'

// Daily.co webhook — session monitoring (Phase C/D).
//
// Register once via the REST API (no dashboard UI):
//   node scripts/register-daily-webhook.mjs https://mindcanopy.in/api/webhooks/daily
// then put the returned `hmac` secret in DAILY_WEBHOOK_SECRET.
//
// Events handled:
//   participant.joined          → who joined + on-time vs scheduled_at (+grace)
//   meeting.started / .ended    → started_at / ended_at / status / duration
//   transcript.started          → transcript_status = 'started'
//   transcript.ready-to-download→ fetch WebVTT, scan for flagged keywords,
//                                 store result, email admin if flagged, then
//                                 DELETE the transcript from Daily (no retention)
//   transcript.error            → transcript_status = 'error'
//
// The endpoint ACKS 200 immediately and does all I/O (transcript download, scan,
// email, delete) inside after() so Daily is never kept waiting on a slow
// response and no user request is ever blocked by this work.
//
// The `/api/webhooks/` prefix is public in middleware, so Daily's unauthenticated
// server-to-server POST is not redirected to /login.

const ON_TIME_GRACE_MS = 5 * 60 * 1000 // joined within 5 min of scheduled = on time

// Daily signs as base64( HMAC-SHA256( timestamp + rawBody, secret ) ).
function verifySignature(rawBody: string, timestamp: string, signature: string, secret: string): boolean {
  const expected = crypto.createHmac('sha256', secret).update(timestamp + rawBody).digest('base64')
  try {
    const a = Buffer.from(expected)
    const b = Buffer.from(signature)
    return a.length === b.length && crypto.timingSafeEqual(a, b)
  } catch {
    return false
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Admin = any

function toMs(ts: unknown): number | null {
  if (typeof ts === 'number') return ts < 1e12 ? ts * 1000 : ts // epoch seconds → ms
  if (typeof ts === 'string') {
    const n = Number(ts)
    if (!Number.isNaN(n)) return n < 1e12 ? n * 1000 : n
    const d = Date.parse(ts)
    return Number.isNaN(d) ? null : d
  }
  return null
}

function findRoomName(payload: Record<string, unknown>): string | null {
  return (payload.room ?? payload.room_name ?? payload.roomName ?? null) as string | null
}

async function sessionByRoom(admin: Admin, room: string | null) {
  if (!room) return null
  const { data } = await admin
    .from('sessions')
    .select('id, match_id, scheduled_at, started_at, status, client_joined_at, therapist_joined_at, transcript_status')
    .eq('daily_room_name', room)
    .order('scheduled_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return data as {
    id: string; match_id: string; scheduled_at: string; started_at: string | null
    status: string; client_joined_at: string | null; therapist_joined_at: string | null
    transcript_status: string | null
  } | null
}

// Strip a WebVTT file down to plain caption text. Cheap, single-pass.
function vttToText(vtt: string): string {
  const out: string[] = []
  for (const line of vtt.split(/\r?\n/)) {
    const t = line.trim()
    if (!t) continue
    if (t === 'WEBVTT' || t.startsWith('NOTE') || t.startsWith('STYLE')) continue
    if (t.includes('-->')) continue            // timestamp cue
    if (/^\d+$/.test(t)) continue              // cue index
    out.push(t.replace(/<\/?v[^>]*>/gi, '').replace(/<[^>]+>/g, '')) // strip voice/markup tags
  }
  return out.join(' ')
}

// ── participant.joined: attribute join + punctuality ─────────────────────────
async function handleParticipantJoined(admin: Admin, payload: Record<string, unknown>) {
  const session = await sessionByRoom(admin, findRoomName(payload))
  if (!session) return

  const { data: match } = await admin
    .from('matches').select('client_id, therapist_id').eq('id', session.match_id).maybeSingle()
  if (!match) return

  const userId = payload.user_id as string | undefined
  const userName = (payload.user_name as string | undefined)?.toLowerCase()
  const isTherapist = userId === match.therapist_id || userName === 'therapist'
  const isClient = userId === match.client_id || userName === 'client'
  if (!isTherapist && !isClient) return

  const joinedMs = toMs(payload.joined_at) ?? Date.now()
  const onTime = joinedMs <= new Date(session.scheduled_at).getTime() + ON_TIME_GRACE_MS
  const joinedIso = new Date(joinedMs).toISOString()

  // Only record the FIRST join (punctuality), ignore rejoins.
  const update: Record<string, unknown> = {}
  if (isTherapist && !session.therapist_joined_at) {
    update.therapist_joined_at = joinedIso
    update.therapist_on_time = onTime
  }
  if (isClient && !session.client_joined_at) {
    update.client_joined_at = joinedIso
    update.client_on_time = onTime
  }
  if (Object.keys(update).length === 0) return
  await admin.from('sessions').update(update).eq('id', session.id)
}

// ── meeting.started / meeting.ended ──────────────────────────────────────────
async function handleMeeting(admin: Admin, type: string, payload: Record<string, unknown>) {
  const session = await sessionByRoom(admin, findRoomName(payload))
  if (!session) return

  if (type === 'meeting.started') {
    if (session.status === 'scheduled') {
      const startMs = toMs(payload.start_ts) ?? Date.now()
      await admin.from('sessions').update({
        started_at: new Date(startMs).toISOString(),
        status: 'ongoing',
      }).eq('id', session.id)
    }
    return
  }

  // meeting.ended
  const endMs = toMs(payload.end_ts) ?? Date.now()
  const startMs = session.started_at ? new Date(session.started_at).getTime() : toMs(payload.start_ts)
  let durationMin: number | null = typeof payload.duration === 'number' ? Math.round(payload.duration / 60) : null
  if (durationMin == null && startMs) durationMin = Math.max(0, Math.round((endMs - startMs) / 60000))

  const update: Record<string, unknown> = { ended_at: new Date(endMs).toISOString() }
  if (durationMin != null) update.duration_minutes = durationMin
  if (session.status !== 'cancelled' && session.status !== 'completed') update.status = 'completed'
  await admin.from('sessions').update(update).eq('id', session.id)
}

// ── transcript.ready-to-download: download → scan → store → email → delete ───
async function handleTranscriptReady(admin: Admin, payload: Record<string, unknown>) {
  const apiKey = process.env.DAILY_API_KEY
  const transcriptId = (payload.transcriptId ?? payload.recordingId ?? payload.id) as string | undefined
  const session = await sessionByRoom(admin, findRoomName(payload))
  if (!apiKey || !transcriptId || !session) {
    logger.warn('webhook/daily', 'transcript.ready missing apiKey/id/session', { transcriptId, hasSession: !!session })
    return
  }

  const auth = { Authorization: `Bearer ${apiKey}` }

  // 1. Temporary download link for the WebVTT.
  const linkRes = await fetch(`https://api.daily.co/v1/transcript/${transcriptId}/access-link`, { headers: auth })
  if (!linkRes.ok) {
    logger.error('webhook/daily', 'transcript access-link rejected', null, { transcriptId, status: linkRes.status })
    await admin.from('sessions').update({ transcript_status: 'error' }).eq('id', session.id)
    return
  }
  const linkJson = await linkRes.json().catch(() => ({} as Record<string, unknown>))
  const downloadUrl = (linkJson.link ?? linkJson.download_link ?? linkJson.url) as string | undefined
  if (!downloadUrl) {
    await admin.from('sessions').update({ transcript_status: 'error' }).eq('id', session.id)
    return
  }

  // 2. Download + scan (plain text, never stored).
  const vttRes = await fetch(downloadUrl)
  const vtt = vttRes.ok ? await vttRes.text() : ''
  const scan = scanText(vttToText(vtt))

  // 3. Persist scan RESULT only (categories), never the transcript.
  await admin.from('sessions').update({
    transcript_status: 'scanned',
    transcript_flagged: scan.flagged,
    transcript_flag_reason: scan.reason,
    transcript_scanned_at: new Date().toISOString(),
  }).eq('id', session.id)

  // 4. Email the admin if flagged (categories only).
  if (scan.flagged) {
    const { data: match } = await admin
      .from('matches').select('client_id, therapist_id').eq('id', session.match_id).maybeSingle()
    let clientName = 'Client', therapistName = 'Therapist'
    if (match) {
      const { data: people } = await admin
        .from('profiles').select('id, full_name').in('id', [match.client_id, match.therapist_id])
      clientName = (people ?? []).find((p: { id: string }) => p.id === match.client_id)?.full_name ?? clientName
      therapistName = (people ?? []).find((p: { id: string }) => p.id === match.therapist_id)?.full_name ?? therapistName
    }
    await sendAdminTranscriptFlagEmail({
      clientName,
      therapistName,
      sessionDate: new Date(session.scheduled_at).toLocaleString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
      }),
      reasonLabels: labelReasons(scan.reason),
      matchId: session.match_id,
    })
  }

  // 5. Delete the transcript from Daily — no retention of session content.
  const delRes = await fetch(`https://api.daily.co/v1/transcript/${transcriptId}`, { method: 'DELETE', headers: auth })
  if (!delRes.ok) {
    logger.warn('webhook/daily', 'transcript delete failed', { transcriptId, status: delRes.status })
  }
}

async function handleEvent(type: string, payload: Record<string, unknown>) {
  const admin = createAdminClient() as Admin
  switch (type) {
    case 'participant.joined':
      return handleParticipantJoined(admin, payload)
    case 'meeting.started':
    case 'meeting.ended':
      return handleMeeting(admin, type, payload)
    case 'transcript.started': {
      const session = await sessionByRoom(admin, findRoomName(payload))
      if (session) await admin.from('sessions').update({ transcript_status: 'started' }).eq('id', session.id)
      return
    }
    case 'transcript.ready-to-download':
      return handleTranscriptReady(admin, payload)
    case 'transcript.error': {
      const session = await sessionByRoom(admin, findRoomName(payload))
      if (session) await admin.from('sessions').update({ transcript_status: 'error' }).eq('id', session.id)
      return
    }
    default:
      return
  }
}

export async function POST(req: Request) {
  const rawBody = await req.text()

  let event: Record<string, unknown>
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ ok: true }) // unparseable — ack so Daily doesn't retry forever
  }

  // Endpoint-verification ping sent by Daily when the webhook is created.
  if (event.test !== undefined && event.type === undefined) {
    return NextResponse.json({ ok: true })
  }

  const secret = process.env.DAILY_WEBHOOK_SECRET
  if (secret) {
    const signature = req.headers.get('X-Webhook-Signature')
    const timestamp = req.headers.get('X-Webhook-Timestamp')
    if (!signature || !timestamp || !verifySignature(rawBody, timestamp, signature, secret)) {
      logger.warn('webhook/daily', 'Rejected: bad signature')
      return new NextResponse('invalid signature', { status: 401 })
    }
  } else {
    logger.warn('webhook/daily', 'DAILY_WEBHOOK_SECRET not set — skipping signature verification')
  }

  const type = event.type as string | undefined
  const payload = (event.payload ?? {}) as Record<string, unknown>
  if (!type) return NextResponse.json({ ok: true })

  // Ack immediately; do all I/O after the response so Daily isn't kept waiting.
  after(() =>
    handleEvent(type, payload).catch(err =>
      logger.error('webhook/daily', 'handleEvent failed', err, { type })
    )
  )

  return NextResponse.json({ ok: true })
}
