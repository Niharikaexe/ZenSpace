import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-[#7EC0B7]/15 flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl font-black text-[#3D8A80]" style={{ fontFamily: 'var(--font-lato)' }}>
            ?
          </span>
        </div>
        <h1 className="text-3xl font-black text-[#233551] mb-3" style={{ fontFamily: 'var(--font-lato)' }}>
          This page doesn't exist.
        </h1>
        <p className="text-[#233551]/55 text-sm leading-relaxed mb-8">
          It may have moved, or the link might be wrong. Either way, it's not here.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-[#233551] text-white text-sm font-bold px-8 py-3 rounded-full hover:bg-[#2d4568] transition-colors"
          >
            Back to home
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 border-2 border-[#233551]/20 text-[#233551] text-sm font-bold px-8 py-3 rounded-full hover:border-[#233551]/50 transition-colors"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
