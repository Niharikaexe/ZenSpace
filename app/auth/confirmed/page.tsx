import Link from 'next/link'

export const metadata = {
  title: 'Email verified — MindCanopy',
  description: 'Your email is verified. Sign in to get started.',
}

export default function EmailConfirmedPage() {
  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/">
            <span
              className="font-black text-2xl tracking-tight text-[#233551]"
              style={{ fontFamily: 'var(--font-lato)' }}
            >
              MindCanopy
            </span>
          </Link>
        </div>

        {/* Success card */}
        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm px-8 py-10 text-center">

          {/* Tick icon */}
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#7EC0B7]/15 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-[#3D8A80]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1
            className="text-2xl md:text-3xl font-black text-[#233551] leading-tight mb-3"
            style={{ fontFamily: 'var(--font-lato)' }}
          >
            You&apos;ve successfully verified your email.
          </h1>
          <p className="text-[#233551]/55 text-sm leading-relaxed mb-8">
            Your account is ready. Head over to the sign-in page to get started.
          </p>

          <Link
            href="/login"
            className="inline-flex items-center justify-center w-full px-8 py-3.5 rounded-full bg-[#233551] hover:bg-[#2d4568] text-white text-sm font-bold transition-colors"
            style={{ fontFamily: 'var(--font-lato)' }}
          >
            Sign in here →
          </Link>
        </div>
      </div>
    </div>
  )
}
