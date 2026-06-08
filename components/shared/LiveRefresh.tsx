'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// Drop-in live refresher: subscribes to Supabase Realtime changes on a table
// (optionally filtered) and calls router.refresh() so a server-rendered page
// re-fetches without a manual reload. Renders nothing.
//
// Used on the client + therapist dashboards so a new/updated `matches` row
// (admin proposes, client chooses) reflects immediately instead of on reload.
//
// Requires the table to be in the `supabase_realtime` publication and the
// caller's RLS to permit SELECT on the rows.
export default function LiveRefresh({
  table,
  filter,
  channel,
}: {
  table: string
  filter?: string
  channel: string
}) {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    const ch = supabase
      .channel(channel)
      .on(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'postgres_changes' as any,
        { event: '*', schema: 'public', table, ...(filter ? { filter } : {}) },
        () => router.refresh(),
      )
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [table, filter, channel, router])

  return null
}
