"use client"

import { useState } from "react"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link href="/" className="font-display text-2xl font-bold text-primary">
          ZenSpace
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="#how-it-works" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">How It Works</Link>
          <Link href="#therapists" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">Our Therapists</Link>
          <Link href="#faq" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">FAQ</Link>
          <Link href="/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>Log In</Link>
          <Link href="/questionnaire" className={cn(buttonVariants({ variant: "hero", size: "sm" }))}>Get Started</Link>
        </div>

        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 flex flex-col gap-3">
          <Link href="#how-it-works" className="text-sm font-medium text-foreground/70 py-2" onClick={() => setMobileOpen(false)}>How It Works</Link>
          <Link href="#therapists" className="text-sm font-medium text-foreground/70 py-2" onClick={() => setMobileOpen(false)}>Our Therapists</Link>
          <Link href="#faq" className="text-sm font-medium text-foreground/70 py-2" onClick={() => setMobileOpen(false)}>FAQ</Link>
          <Link href="/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "justify-start")} onClick={() => setMobileOpen(false)}>Log In</Link>
          <Link href="/questionnaire" className={cn(buttonVariants({ variant: "hero", size: "sm" }))} onClick={() => setMobileOpen(false)}>Get Started</Link>
        </div>
      )}
    </nav>
  )
}

export default Navbar
