'use client'

import { useEffect } from 'react'

/**
 * Pushes a GTM dataLayer event once, when this component mounts.
 *
 * This is the reliable way to fire a conversion: it runs from the app's own
 * code at the exact moment a page/state renders, so it doesn't depend on URL
 * matching, redirects, or client-side (SPA) navigation the way a GTM
 * "Page View" trigger does. Pair it with a GTM "Custom Event" trigger that
 * matches the same `event` name.
 */
export function DataLayerEvent({
  event,
  params,
}: {
  event: string
  params?: Record<string, unknown>
}) {
  useEffect(() => {
    if (typeof window === 'undefined') return
    const w = window as unknown as { dataLayer?: Record<string, unknown>[] }
    w.dataLayer = w.dataLayer || []
    w.dataLayer.push({ event, ...(params ?? {}) })
    // Fire once on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}
