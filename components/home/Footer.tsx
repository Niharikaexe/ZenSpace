import Link from "next/link"
import { OwlLogo } from "./OwlLogo"

/* Social icon SVGs */
const LinkedIn = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
)

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const Instagram = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.336 3.608 1.311.975.975 1.249 2.242 1.311 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.336 2.633-1.311 3.608-.975.975-2.242 1.249-3.608 1.311-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.336-3.608-1.311-.975-.975-1.249-2.242-1.311-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.336-2.633 1.311-3.608.975-.975 2.242-1.249 3.608-1.311 1.266-.058 1.646-.07 4.85-.07zm0-2.163C8.741 0 8.332.013 7.052.072 5.773.131 4.815.353 3.96.677c-.93.353-1.722.825-2.51 1.613C.663 3.078.191 3.87-.162 4.8c-.324.855-.546 1.813-.605 3.092C-.826 9.172-.839 9.581-.839 12.84s.013 3.668.072 4.948c.059 1.279.281 2.237.605 3.092.353.93.825 1.722 1.613 2.51.788.788 1.58 1.26 2.51 1.613.855.324 1.813.546 3.092.605C8.332 23.987 8.741 24 12 24s3.668-.013 4.948-.072c1.279-.059 2.237-.281 3.092-.605.93-.353 1.722-.825 2.51-1.613.788-.788 1.26-1.58 1.613-2.51.324-.855.546-1.813.605-3.092.059-1.28.072-1.689.072-4.948s-.013-3.668-.072-4.948c-.059-1.279-.281-2.237-.605-3.092-.353-.93-.825-1.722-1.613-2.51C20.078.663 19.286.191 18.356-.162c-.855-.324-1.813-.546-3.092-.605C13.668-.826 13.259-.839 12-.839zM12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
)

const Footer = () => {
  return (
    <footer className="bg-[#233551]">
      {/* Main footer body */}
      <div className="max-w-6xl mx-auto px-6 py-14 md:py-16">
        <div className="grid md:grid-cols-5 gap-10 md:gap-8">

          {/* Brand column — wider */}
          <div className="md:col-span-2 space-y-5">
            <Link href="/" className="flex items-center gap-2.5 w-fit">
              <span className="w-9 h-9 rounded-lg bg-[#FFF5F2] flex items-center justify-center flex-shrink-0">
                <OwlLogo size={26} />
              </span>
              <span className="font-black text-lg text-white tracking-tight" style={{ fontFamily: 'var(--font-lato)' }}>
                MindCanopy
              </span>
            </Link>
            <p className="text-sm text-white/45 leading-relaxed max-w-xs">
              Making professional therapy accessible, affordable, and convenient for everyone across India.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-4 pt-1">
              {[
                { icon: LinkedIn, label: "LinkedIn", href: "https://www.linkedin.com/company/mind-canopy-therapy/" },
                { icon: XIcon, label: "X", href: "https://x.com/mindcanopy_in" },
                { icon: Instagram, label: "Instagram", href: "https://instagram.com/mindcanopy.in" },
              ].map(({ icon: Icon, label, href }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  target={href !== "#" ? "_blank" : undefined}
                  rel={href !== "#" ? "noopener noreferrer" : undefined}
                  className="w-9 h-9 rounded-full bg-white/8 hover:bg-[#7EC0B7]/30 text-white/50 hover:text-white flex items-center justify-center transition-all duration-200"
                >
                  <Icon />
                </Link>
              ))}
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-white/40 uppercase tracking-widest" style={{ fontFamily: 'var(--font-lato)' }}>
              Services
            </h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: "Individual Therapy", href: "/for/individuals" },
                { label: "Couples Therapy", href: "/for/couples" },
                { label: "Teen Therapy", href: "/for/adolescents" },
              ].map(l => (
                <li key={l.label}>
                  <Link href={l.href} className="text-white/45 hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-white/40 uppercase tracking-widest" style={{ fontFamily: 'var(--font-lato)' }}>
              Resources
            </h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: "Blog", href: "/blog" },
                { label: "Market Reports", href: "/market-reports" },
                { label: "Help Centre", href: "/help" },
                { label: "For Therapists", href: "/therapist/join" },
              ].map(l => (
                <li key={l.label}>
                  <Link href={l.href} className="text-white/45 hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-white/40 uppercase tracking-widest" style={{ fontFamily: 'var(--font-lato)' }}>
              Legal
            </h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Service", href: "/terms" },
                { label: "Refunds & Cancellations", href: "/refunds" },
                { label: "About Us", href: "/about" },
                { label: "Contact", href: "/contact" },
              ].map(l => (
                <li key={l.label}>
                  <Link href={l.href} className="text-white/45 hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/8">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/30">
          <p>© 2026 MindCanopy. All rights reserved.</p>
          <p>If you are in crisis, please call iCall: <span className="text-white/50 font-semibold">9152987821</span></p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
