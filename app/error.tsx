'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-[#E8926A]/10 flex items-center justify-center mx-auto mb-6">
          <svg className="w-9 h-9 text-[#E8926A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-3xl font-black text-[#233551] mb-3" style={{ fontFamily: 'var(--font-lato)' }}>
          Something went wrong.
        </h1>
        <p className="text-[#233551]/55 text-sm leading-relaxed mb-8">
          We've logged the issue and will look into it. If this keeps happening, reach out to us.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 bg-[#233551] text-white text-sm font-bold px-8 py-3 rounded-full hover:bg-[#2d4568] transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 border-2 border-[#233551]/20 text-[#233551] text-sm font-bold px-8 py-3 rounded-full hover:border-[#233551]/50 transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
