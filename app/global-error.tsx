'use client'

// Fallback for errors thrown inside the root layout itself — font loaders,
// providers, top-level metadata, etc. Next.js replaces the entire app shell
// with this component when it fires, which is why it must render its own
// <html> and <body>. For errors below the root layout, app/error.tsx (and
// the route-specific error.tsx files) handle them with the normal nav.

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('[global-error] Root layout error', {
      digest: error.digest,
      message: error.message,
      stack: error.stack,
    })
  }, [error])

  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#FAFAFA', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
          <div style={{ textAlign: 'center', maxWidth: 480 }}>
            <div style={{
              width: 72,
              height: 72,
              borderRadius: 9999,
              background: 'rgba(232, 146, 106, 0.12)',
              margin: '0 auto 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#E8926A">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 style={{
              fontSize: 28,
              fontWeight: 900,
              color: '#233551',
              margin: '0 0 12px',
              letterSpacing: '-0.02em',
            }}>
              Something went wrong.
            </h1>
            <p style={{
              color: 'rgba(35, 53, 81, 0.55)',
              fontSize: 14,
              lineHeight: 1.6,
              margin: '0 0 32px',
            }}>
              MindCanopy hit an unexpected error while loading. We've logged it. Try again — if it keeps happening, email{' '}
              <a href="mailto:admin@mindcanopy.in" style={{ color: '#3D8A80', textDecoration: 'none' }}>admin@mindcanopy.in</a>.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
              <button
                onClick={reset}
                style={{
                  background: '#233551',
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 700,
                  padding: '12px 32px',
                  borderRadius: 9999,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Try again
              </button>
              <a
                href="/"
                style={{
                  color: '#233551',
                  fontSize: 13,
                  textDecoration: 'underline',
                  textDecorationColor: 'rgba(35, 53, 81, 0.25)',
                  textUnderlineOffset: 4,
                }}
              >
                Back to home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
