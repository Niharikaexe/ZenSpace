import { BrandLogo } from '@/components/shared/BrandLogo'

// Shown while a dashboard page loads. We render a static nav bar that mirrors
// ClientNav's shell so the navbar appears to stay put — only the body below
// shows the loading spinner — instead of flashing a full-screen loader.
export default function DashboardLoading() {
  return (
    <div className="h-dvh flex flex-col bg-[#FAFAFA]">
      {/* Static nav shell (mirrors ClientNav) */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between gap-4">
          <BrandLogo href="/dashboard/chat" />
          <div className="flex items-center gap-2">
            <div className="h-7 w-16 rounded-lg bg-slate-100 animate-pulse" />
            <div className="h-8 w-24 rounded-xl bg-[#7EC0B7]/15 animate-pulse" />
          </div>
        </div>
      </header>

      {/* Body — only this area shows the loading state */}
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#7EC0B7] border-t-transparent animate-spin" />
          <p className="text-xs text-[#233551]/35 font-medium">Loading...</p>
        </div>
      </div>
    </div>
  )
}
