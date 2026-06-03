'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { captureAttribution, recordJourneyStep } from '@/lib/attribution'

/**
 * Mounts once at the root of the app (in app/layout.tsx).
 *
 * - On first load it captures UTMs / referrer / extra params into localStorage
 *   (first-touch preserved, last-touch updated each tagged visit).
 * - On every route change it appends the current page to the visitor's
 *   on-site journey trail.
 *
 * Signup and apply forms call `attributionFields()` on submit, which bundles
 * the stored attribution, the journey, and the live device info into the
 * FormData sent to the server action.
 */
export function AttributionCapture() {
  const pathname = usePathname()

  // Attribution capture: once on mount (the entry page carries the UTMs).
  useEffect(() => {
    captureAttribution()
  }, [])

  // Journey: record on every client-side navigation, including the first.
  useEffect(() => {
    recordJourneyStep(pathname)
  }, [pathname])

  return null
}
