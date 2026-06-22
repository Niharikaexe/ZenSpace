import { BrandLogo } from '@/components/shared/BrandLogo'

// Streamed instantly while the chat page fetches (also what a matched client
// sees the moment /dashboard redirects here). Mirrors ClientChatView's layout —
// nav + left therapist panel + chat column — so the real view snaps into the
// same frame instead of flashing a blank screen or a generic spinner.
export default function ChatLoading() {
  return (
    <div className="h-dvh flex flex-col bg-[#FAFAFA] overflow-hidden">
      {/* Nav shell (mirrors ClientNav) */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between gap-4">
          <BrandLogo href="/dashboard/chat" />
          <div className="flex items-center gap-2">
            <div className="h-7 w-16 rounded-lg bg-slate-100 animate-pulse" />
            <div className="h-8 w-24 rounded-xl bg-[#7EC0B7]/15 animate-pulse" />
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: therapist panel skeleton */}
        <aside className="hidden md:flex flex-col w-72 lg:w-80 flex-shrink-0 border-r border-slate-100 bg-white p-5 gap-4">
          <div className="flex flex-col items-center gap-3 pt-4">
            <div className="w-20 h-20 rounded-2xl bg-slate-100 animate-pulse" />
            <div className="h-4 w-32 rounded bg-slate-100 animate-pulse" />
            <div className="h-3 w-24 rounded bg-slate-100 animate-pulse" />
          </div>
          <div className="space-y-2 mt-2">
            <div className="h-3 w-full rounded bg-slate-100 animate-pulse" />
            <div className="h-3 w-5/6 rounded bg-slate-100 animate-pulse" />
            <div className="h-3 w-2/3 rounded bg-slate-100 animate-pulse" />
          </div>
        </aside>

        {/* Right: chat skeleton */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 px-4 py-6 space-y-4 overflow-hidden">
            <div className="flex justify-start"><div className="h-10 w-48 rounded-2xl bg-white border border-slate-200 animate-pulse" /></div>
            <div className="flex justify-end"><div className="h-10 w-40 rounded-2xl bg-[#7EC0B7]/20 animate-pulse" /></div>
            <div className="flex justify-start"><div className="h-16 w-60 rounded-2xl bg-white border border-slate-200 animate-pulse" /></div>
            <div className="flex justify-end"><div className="h-10 w-52 rounded-2xl bg-[#7EC0B7]/20 animate-pulse" /></div>
          </div>
          {/* Input bar skeleton */}
          <div className="flex-none border-t border-slate-200 bg-white px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex-1 h-[42px] rounded-2xl bg-slate-100 animate-pulse" />
              <div className="w-11 h-11 rounded-full bg-[#7EC0B7]/20 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
