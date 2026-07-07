import { logger } from '@/lib/logger'

export type DailyRoom = { id: string | null; url: string | null; name: string | null }

/**
 * Creates a private Daily.co room for a session. Non-fatal: returns nulls (and
 * logs) on any failure, so callers can still confirm the session — the UI just
 * shows "no video link". Mirrors the room config used elsewhere (2h expiry from
 * the scheduled start, max 2 participants).
 *
 * Returns the room `id` (UUID) as well as name/url: transcript.* webhook events
 * identify the room by its UUID (room_id), not its name, so we persist it to map
 * those events back to the session.
 */
export async function createDailyRoom(matchId: string, scheduledAtIso: string): Promise<DailyRoom> {
  const apiKey = process.env.DAILY_API_KEY
  if (!apiKey) return { id: null, url: null, name: null }

  try {
    const roomName = `mindcanopy-${matchId.slice(0, 8)}-${Date.now()}`
    const sessionStart = new Date(scheduledAtIso).getTime()
    const exp = Math.floor(Math.max(sessionStart, Date.now()) / 1000) + 7200

    const res = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        name: roomName,
        privacy: 'private',
        properties: {
          exp,
          max_participants: 2,
          // Transcript-only monitoring: store the live transcription as WebVTT.
          // NO recording (enable_recording is intentionally left unset). The
          // therapist's owner token carries auto_start_transcription:true, so
          // transcription begins automatically when they join — no client code.
          enable_transcription_storage: true,
          enable_live_captions_ui: true,
        },
      }),
    })

    if (res.ok) {
      const room = await res.json()
      return { id: room.id ?? null, url: room.url, name: room.name }
    }
    const body = await res.text().catch(() => '<no body>')
    logger.warn('lib/daily', 'Daily.co room creation rejected', { matchId, status: res.status, body })
  } catch (err) {
    logger.warn('lib/daily', 'Daily.co room creation threw', { matchId, err: err instanceof Error ? err.message : String(err) })
  }
  return { id: null, url: null, name: null }
}
