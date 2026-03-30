'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/app/actions/auth'

interface Props {
  userName: string
}

export default function ClientNav({ userName }: Props) {
  const pathname = usePathname()
  const [helpOpen, setHelpOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const helpRef = useRef<HTMLDivElement>(null)
  const accountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onOutsideClick(e: MouseEvent) {
      if (helpRef.current && !helpRef.current.contains(e.target as Node)) setHelpOpen(false)
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setAccountOpen(false)
    }
    document.addEventListener('mousedown', onOutsideClick)
    return () => document.removeEventListener('mousedown', onOutsideClick)
  }, [])

  const firstInitial = userName.charAt(0).toUpperCase()
  const firstName = userName.split(' ')[0]

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/dashboard/chat">
          <span
            className="font-black text-xl tracking-tight text-[#233551]"
            style={{ fontFamily: 'var(--font-lato)' }}
          >
            ZenSpace
          </span>
        </Link>

        {/* Center nav tabs */}
        <nav className="flex items-center gap-1">
          <Link
            href="/dashboard/chat"
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              pathname === '/dashboard/chat'
                ? 'bg-[#233551] text-white'
                : 'text-[#233551]/55 hover:text-[#233551] hover:bg-slate-50'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Chat
          </Link>
          <Link
            href="/dashboard/sessions"
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              pathname === '/dashboard/sessions'
                ? 'bg-[#233551] text-white'
                : 'text-[#233551]/55 hover:text-[#233551] hover:bg-slate-50'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Sessions
          </Link>
        </nav>

        {/* Right: Help + Account dropdowns */}
        <div className="flex items-center gap-1">

          {/* Help dropdown */}
          <div className="relative" ref={helpRef}>
            <button
              onClick={() => { setHelpOpen(o => !o); setAccountOpen(false) }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-[#233551]/60 hover:text-[#233551] hover:bg-slate-50 transition-colors"
            >
              Help
              <svg viewBox="0 0 16 16" fill="none" className={`w-3.5 h-3.5 transition-transform duration-200 ${helpOpen ? 'rotate-180' : ''}`}>
                <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {helpOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-44 bg-white border border-slate-100 rounded-2xl shadow-lg py-1.5 z-50">
                {[
                  { label: 'FAQ', href: '/dashboard/faq' },
                  { label: 'Contact Us', href: '/dashboard/contact' },
                  { label: 'Reviews', href: '/dashboard/reviews' },
                ].map(item => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setHelpOpen(false)}
                    className="block px-4 py-2.5 text-sm text-[#233551] hover:bg-slate-50 transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Account dropdown */}
          <div className="relative" ref={accountRef}>
            <button
              onClick={() => { setAccountOpen(o => !o); setHelpOpen(false) }}
              className="flex items-center gap-2 pl-2.5 pr-2 py-1.5 rounded-xl text-sm font-semibold text-[#233551] bg-[#7EC0B7]/10 hover:bg-[#7EC0B7]/20 transition-colors"
              style={{ fontFamily: 'var(--font-lato)' }}
            >
              <span className="w-6 h-6 rounded-full bg-[#233551] text-white text-xs flex items-center justify-center font-black flex-shrink-0">
                {firstInitial}
              </span>
              <span className="max-w-[110px] truncate">{firstName}</span>
              <svg viewBox="0 0 16 16" fill="none" className={`w-3.5 h-3.5 text-[#233551]/40 transition-transform duration-200 ${accountOpen ? 'rotate-180' : ''}`}>
                <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {accountOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-52 bg-white border border-slate-100 rounded-2xl shadow-lg py-1.5 z-50">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="text-xs text-[#233551]/40">Signed in as</p>
                  <p className="text-sm font-semibold text-[#233551] truncate">{userName}</p>
                </div>
                {[
                  { label: 'My Account', href: '/dashboard/account' },
                  { label: 'My Therapist', href: '/dashboard/my-therapist' },
                  { label: 'Change Therapist', href: '/dashboard/change-therapist' },
                  { label: 'Subscribe', href: '/dashboard/subscribe' },
                ].map(item => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setAccountOpen(false)}
                    className="block px-4 py-2.5 text-sm text-[#233551] hover:bg-slate-50 transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="border-t border-slate-100 mt-1 pt-1">
                  <form action={signOut}>
                    <button
                      type="submit"
                      className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors rounded-b-2xl"
                    >
                      Logout
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
