import { NextResponse } from 'next/server'
import { recordEmailTap } from '@/app/feedback/actions'

// Where the taps in the feedback email land.
//
// Records the single answer they tapped, then redirects to /feedback so the page
// itself stays a pure read. Keeping the write here rather than in the page render
// means refreshing or sharing the feedback URL cannot re-fire a save.
//
// The session id in `s` is the only credential: it is an unguessable UUID tied to
// one session, so this works without a login, in whatever browser their mail app
// happens to open.

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const sessionId = searchParams.get('s') ?? ''
  const rating = searchParams.get('r') ?? undefined
  const feltHeard = searchParams.get('heard') ?? undefined
  const bookAgain = searchParams.get('again') ?? undefined

  if (sessionId) {
    // Invalid or unknown ids are ignored inside recordEmailTap; we still send the
    // visitor to the page, which shows a friendly "link is not valid" state.
    await recordEmailTap({ sessionId, rating, feltHeard, bookAgain })
  }

  return NextResponse.redirect(`${origin}/feedback?s=${encodeURIComponent(sessionId)}`)
}
