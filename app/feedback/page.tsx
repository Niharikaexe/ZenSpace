import type { Metadata } from 'next'
import { loadFeedbackContext } from './actions'
import { FeedbackForm } from './FeedbackForm'
import { OwlLogo } from '@/components/home/OwlLogo'

export const dynamic = 'force-dynamic'

// Feedback pages should never be indexed: the URL carries a session id.
export const metadata: Metadata = {
  title: 'Your session feedback',
  robots: { index: false, follow: false },
}

export default async function FeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ s?: string }>
}) {
  const { s } = await searchParams
  const ctx = s ? await loadFeedbackContext(s) : null

  return (
    <main className="min-h-screen bg-[#FAFAFA] flex flex-col items-center px-5 py-12">
      <div className="w-full max-w-xl">
        <div className="flex items-center gap-2 mb-8">
          <OwlLogo size={26} />
          <span
            className="font-black text-xl tracking-tight text-[#3D8A80]"
            style={{ fontFamily: 'var(--font-lato)' }}
          >
            MindCanopy
          </span>
        </div>

        {!ctx?.ok ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-7">
            <h1
              className="text-xl font-black text-[#233551]"
              style={{ fontFamily: 'var(--font-lato)' }}
            >
              This feedback link isn&rsquo;t working.
            </h1>
            <p className="text-sm text-[#233551]/60 mt-2 leading-relaxed">
              It may have been mistyped or the session may no longer exist. If you want to tell us
              how a session went, reply to any email from us and it reaches the team.
            </p>
          </div>
        ) : (
          <FeedbackForm
            sessionId={s as string}
            therapistFirstName={ctx.therapistFirstName}
            sessionDate={ctx.sessionDate}
            existing={ctx.existing}
          />
        )}

        <p className="text-xs text-[#233551]/35 mt-6 text-center">
          Only the MindCanopy team reads this.
        </p>
      </div>
    </main>
  )
}
