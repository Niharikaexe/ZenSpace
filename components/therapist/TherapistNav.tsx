'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { signOut } from '@/app/actions/auth'

interface TherapistNavProps {
  therapistName: string
  unreadCount?: number
  isMatched?: boolean
  notificationCount?: number
}

export function TherapistNav({ therapistName, unreadCount = 0, isMatched = true, notificationCount = 0 }: TherapistNavProps) {
  const pathname = usePathname()
  const [helpOpen, setHelpOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const helpRef = useRef<HTMLDivElement>(null)
  const accountRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (helpRef.current && !helpRef.current.contains(e.target as Node)) setHelpOpen(false)
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setAccountOpen(false)
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const firstName = therapistName.split(' ')[0]

  const navLinks = [
    { href: '/therapist/dashboard/chat', label: 'Chat', badge: unreadCount },
    { href: '/therapist/dashboard/video', label: 'Sessions' },
    { href: '/therapist/dashboard/notes', label: 'Notes' },
  ].filter(() => isMatched)

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/therapist/dashboard" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-7 h-7 rounded-full border-2 border-[#7EC0B7] flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-[#7EC0B7]" />
          </div>
          <span
            className="font-black text-lg text-[#233551] tracking-tight hidden sm:block"
            style={{ fontFamily: 'var(--font-lato)' }}
          >
            ZenSpace
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'relative px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors',
                isActive(link.href)
                  ? 'bg-[#233551]/8 text-[#233551]'
                  : 'text-[#233551]/55 hover:text-[#233551] hover:bg-slate-50',
              )}
            >
              {link.label}
              {link.badge !== undefined && link.badge > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#E8926A] text-white text-[10px] font-bold flex items-center justify-center">
                  {link.badge > 9 ? '9+' : link.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Right: Help + Name dropdowns */}
        <div className="flex items-center gap-2">

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => { setNotifOpen(o => !o); setHelpOpen(false); setAccountOpen(false) }}
              className={cn(
                'relative w-8 h-8 flex items-center justify-center rounded-lg transition-colors',
                notifOpen ? 'bg-slate-100' : 'hover:bg-slate-50',
              )}
              aria-label="Notifications"
            >
              <svg className="w-4.5 h-4.5 text-[#233551]/60" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {notificationCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-[#E8926A] text-white text-[9px] font-bold flex items-center justify-center">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-72 bg-white border border-slate-100 rounded-xl shadow-lg z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-50 flex items-center justify-between">
                  <p className="text-xs font-bold text-[#233551]/35 uppercase tracking-widest">Notifications</p>
                  {notificationCount > 0 && (
                    <span className="text-xs font-semibold text-[#E8926A]">{notificationCount} new</span>
                  )}
                </div>
                {notificationCount === 0 ? (
                  <div className="px-4 py-6 text-center">
                    <p className="text-sm text-[#233551]/40">You&apos;re all caught up.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50 max-h-64 overflow-y-auto">
                    {/* Placeholder notifications — wire to real data when notification system is built */}
                    <div className="px-4 py-3 hover:bg-slate-50 transition-colors">
                      <p className="text-sm font-medium text-[#233551]">New client matched</p>
                      <p className="text-xs text-[#233551]/45 mt-0.5">You have been assigned a new client.</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Help dropdown */}
          <div className="relative" ref={helpRef}>
            <button
              onClick={() => { setHelpOpen(o => !o); setAccountOpen(false) }}
              className={cn(
                'flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                helpOpen
                  ? 'bg-slate-100 text-[#233551]'
                  : 'text-[#233551]/55 hover:text-[#233551] hover:bg-slate-50',
              )}
            >
              Help
              <svg className={cn('w-3.5 h-3.5 transition-transform', helpOpen && 'rotate-180')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {helpOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-44 bg-white border border-slate-100 rounded-xl shadow-lg py-1.5 z-50">
                <Link
                  href="/therapist/dashboard/faq"
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#233551]/75 hover:bg-slate-50 hover:text-[#233551] transition-colors"
                  onClick={() => setHelpOpen(false)}
                >
                  <span className="text-base">💬</span> FAQ
                </Link>
                <Link
                  href="/therapist/dashboard/contact"
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#233551]/75 hover:bg-slate-50 hover:text-[#233551] transition-colors"
                  onClick={() => setHelpOpen(false)}
                >
                  <span className="text-base">✉️</span> Contact Us
                </Link>
              </div>
            )}
          </div>

          {/* Therapist name dropdown */}
          <div className="relative" ref={accountRef}>
            <button
              onClick={() => { setAccountOpen(o => !o); setHelpOpen(false) }}
              className={cn(
                'flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                accountOpen
                  ? 'bg-slate-100 text-[#233551]'
                  : 'text-[#233551] hover:bg-slate-50',
              )}
            >
              <div className="w-7 h-7 rounded-full bg-[#7EC0B7]/20 text-[#3D8A80] text-xs font-bold flex items-center justify-center">
                {firstName[0]?.toUpperCase() ?? 'T'}
              </div>
              <span className="hidden sm:block">{firstName}</span>
              <svg className={cn('w-3.5 h-3.5 text-[#233551]/40 transition-transform', accountOpen && 'rotate-180')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {accountOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-52 bg-white border border-slate-100 rounded-xl shadow-lg py-1.5 z-50">
                <div className="px-4 py-2 border-b border-slate-50 mb-1">
                  <p className="text-xs font-semibold text-[#233551]">{therapistName}</p>
                  <p className="text-xs text-[#233551]/40">Therapist</p>
                </div>
                <Link
                  href="/therapist/dashboard/account"
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#233551]/75 hover:bg-slate-50 hover:text-[#233551] transition-colors"
                  onClick={() => setAccountOpen(false)}
                >
                  <span className="text-base">👤</span> My Account
                </Link>
                <Link
                  href="/therapist/dashboard/payment"
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#233551]/75 hover:bg-slate-50 hover:text-[#233551] transition-colors"
                  onClick={() => setAccountOpen(false)}
                >
                  <span className="text-base">💰</span> Payment Dashboard
                </Link>
                <div className="border-t border-slate-50 mt-1 pt-1">
                  <form action={signOut}>
                    <button
                      type="submit"
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      onClick={() => setAccountOpen(false)}
                    >
                      <span className="text-base">🚪</span> Sign Out
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Mobile nav strip */}
      <div className="md:hidden flex items-center gap-1 px-4 py-2 border-t border-slate-50 overflow-x-auto">
        {navLinks.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'relative flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap',
              isActive(link.href)
                ? 'bg-[#233551] text-white'
                : 'text-[#233551]/55 hover:bg-slate-100',
            )}
          >
            {link.label}
            {link.badge !== undefined && link.badge > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#E8926A] text-white text-[9px] font-bold flex items-center justify-center">
                {link.badge > 9 ? '9+' : link.badge}
              </span>
            )}
          </Link>
        ))}
      </div>
    </header>
  )
}
