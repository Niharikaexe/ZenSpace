import Link from 'next/link'

export default function ClientNotFound() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-[#7EC0B7]/15 flex items-center justify-center mx-auto mb-6">
          <svg className="w-7 h-7 text-[#3D8A80]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
          </svg>
        </div>
        <h1 className="text-2xl font-black text-[#233551] mb-2" style={{ fontFamily: 'var(--font-lato)' }}>
          Client not found.
        </h1>
        <p className="text-sm text-[#233551]/55 leading-relaxed mb-7">
          This match doesn't exist or you don't have access to it.
        </p>
        <Link
          href="/therapist/dashboard"
          className="inline-flex items-center justify-center bg-[#233551] text-white text-sm font-bold px-7 py-3 rounded-full hover:bg-[#2d4568] transition-colors"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}
