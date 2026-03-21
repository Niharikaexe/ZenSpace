"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100">
      <div className="max-w-6xl mx-auto flex items-center justify-between h-16 px-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full border-2 border-[#7EC0B7] flex items-center justify-center">
            <div className="w-3.5 h-3.5 rounded-full bg-[#7EC0B7]" />
          </div>
          <span className="font-black text-xl tracking-tight text-[#233551]" style={{ fontFamily: 'var(--font-lato)' }}>
            ZenSpace
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="#how-it-works" className="text-sm font-medium text-[#233551]/60 hover:text-[#233551] transition-colors">
            How It Works
          </Link>
          <Link href="#therapists" className="text-sm font-medium text-[#233551]/60 hover:text-[#233551] transition-colors">
            Our Therapists
          </Link>
          <Link href="/blog" className="text-sm font-medium text-[#233551]/60 hover:text-[#233551] transition-colors">
            Blog
          </Link>
          <Link href="/market-reports" className="text-sm font-medium text-[#233551]/60 hover:text-[#233551] transition-colors">
            Market Reports
          </Link>
          <Link href="/help" className="text-sm font-medium text-[#233551]/60 hover:text-[#233551] transition-colors">
            Help
          </Link>
        </div>

        {/* Desktop CTA buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-semibold text-[#233551] px-5 py-2 rounded-full border border-[#233551]/20 hover:border-[#233551]/50 transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/questionnaire"
            className="text-sm font-semibold text-white bg-[#233551] px-5 py-2 rounded-full hover:bg-[#2d4568] transition-colors"
          >
            Sign up
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-[#233551]"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-6 py-5 flex flex-col gap-4">
          <Link href="#how-it-works" className="text-sm font-medium text-[#233551]/70" onClick={() => setMobileOpen(false)}>How It Works</Link>
          <Link href="#therapists" className="text-sm font-medium text-[#233551]/70" onClick={() => setMobileOpen(false)}>Our Therapists</Link>
          <Link href="/blog" className="text-sm font-medium text-[#233551]/70" onClick={() => setMobileOpen(false)}>Blog</Link>
          <Link href="/market-reports" className="text-sm font-medium text-[#233551]/70" onClick={() => setMobileOpen(false)}>Market Reports</Link>
          <Link href="/help" className="text-sm font-medium text-[#233551]/70" onClick={() => setMobileOpen(false)}>Help</Link>
          <div className="flex gap-3 pt-2">
            <Link href="/login" className="flex-1 text-center text-sm font-semibold text-[#233551] py-2 rounded-full border border-[#233551]/20" onClick={() => setMobileOpen(false)}>
              Log in
            </Link>
            <Link href="/questionnaire" className="flex-1 text-center text-sm font-semibold text-white bg-[#233551] py-2 rounded-full" onClick={() => setMobileOpen(false)}>
              Sign up
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
