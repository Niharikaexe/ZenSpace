'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import {
  markNotificationRead,
  markAllNotificationsRead,
  type Notification,
} from '@/app/actions/notifications'

const TYPE_META: Record<string, { icon: string; color: string }> = {
  client_matched:    { icon: '🤝', color: '#7EC0B7' },
  client_unmatched:  { icon: '👋', color: '#E8926A' },
  client_message:    { icon: '💬', color: '#7EC0B7' },
  profile_verified:  { icon: '✅', color: '#3D8A80' },
  session_scheduled: { icon: '📅', color: '#233551' },
  session_reminder:  { icon: '⏰', color: '#E8926A' },
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

interface Props {
  userId: string
  initialNotifications: Notification[]
}

export function NotificationBell({ userId, initialNotifications }: Props) {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const [isPending, startTransition] = useTransition()
  const ref = useRef<HTMLDivElement>(null)

  const unread = notifications.filter(n => !n.is_read).length

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Supabase Realtime subscription — adds new notifications live
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes' as any,
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload: { new: Notification }) => {
          setNotifications(prev => [payload.new, ...prev].slice(0, 30))
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  function handleMarkRead(id: string) {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    )
    startTransition(() => markNotificationRead(id))
  }

  function handleMarkAll() {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    startTransition(() => markAllNotificationsRead())
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          'relative w-8 h-8 flex items-center justify-center rounded-lg transition-colors',
          open ? 'bg-slate-100' : 'hover:bg-slate-50',
        )}
        aria-label="Notifications"
      >
        <svg
          className="text-[#233551]/60"
          width="18" height="18"
          fill="none" viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unread > 0 && (
          <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-[#E8926A] text-white text-[9px] font-bold flex items-center justify-center leading-none">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-80 bg-white border border-slate-100 rounded-xl shadow-lg z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold text-[#233551]/35 uppercase tracking-widest">Notifications</p>
              {unread > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-[#E8926A]/15 text-[#E8926A] text-[10px] font-bold">
                  {unread} new
                </span>
              )}
            </div>
            {unread > 0 && (
              <button
                onClick={handleMarkAll}
                disabled={isPending}
                className="text-xs font-semibold text-[#3D8A80] hover:text-[#233551] transition-colors disabled:opacity-50"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-2xl mb-2">🔔</p>
              <p className="text-sm text-[#233551]/40">You&apos;re all caught up.</p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
              {notifications.map(n => {
                const meta = TYPE_META[n.type] ?? { icon: '🔔', color: '#233551' }
                return (
                  <button
                    key={n.id}
                    onClick={() => { if (!n.is_read) handleMarkRead(n.id) }}
                    className={cn(
                      'w-full text-left px-4 py-3 flex items-start gap-3 transition-colors hover:bg-slate-50',
                      !n.is_read && 'bg-[#7EC0B7]/5',
                    )}
                  >
                    <span
                      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-base mt-0.5"
                      style={{ background: `${meta.color}18` }}
                    >
                      {meta.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn(
                          'text-sm leading-snug',
                          n.is_read ? 'text-[#233551]/60 font-normal' : 'text-[#233551] font-semibold',
                        )}>
                          {n.title}
                        </p>
                        {!n.is_read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#E8926A] flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-[#233551]/45 mt-0.5 leading-relaxed line-clamp-2">{n.body}</p>
                      <p className="text-[10px] text-[#233551]/30 mt-1">{timeAgo(n.created_at)}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-slate-50">
              <p className="text-xs text-[#233551]/30 text-center">Last 30 notifications</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
