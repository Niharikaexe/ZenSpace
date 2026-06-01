'use client'

import { useEffect } from 'react'
import { captureAttribution } from '@/lib/attribution'

/**
 * Mounts once at the root of the app (in app/layout.tsx). On every page
 * load it reads UTMs / referrer from the current URL and stores them in
 * localStorage. First-touch is preserved; last-touch updates each visit.
 *
 * Signup and apply forms call `attributionFields()` on submit to attach
 * the stored attribution to the FormData they send to the server action.
 */
export function AttributionCapture() {
  useEffect(() => {
    captureAttribution()
  }, [])
  return null
}
