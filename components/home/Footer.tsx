import Link from "next/link"

const Footer = () => {
  return (
    <footer className="bg-foreground text-background/70 py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4">
            <h3 className="font-display text-xl font-bold text-background">ZenSpace</h3>
            <p className="text-sm leading-relaxed">
              Making professional therapy accessible, affordable, and convenient for everyone.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-display font-semibold text-background text-sm uppercase tracking-wide">Services</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/questionnaire?type=individual" className="hover:text-background transition-colors">Individual Therapy</Link></li>
              <li><Link href="/questionnaire?type=couples" className="hover:text-background transition-colors">Couples Therapy</Link></li>
              <li><Link href="/questionnaire?type=teen" className="hover:text-background transition-colors">Teen Therapy</Link></li>
              <li><Link href="#" className="hover:text-background transition-colors">Psychiatry</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-display font-semibold text-background text-sm uppercase tracking-wide">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-background transition-colors">About Us</Link></li>
              <li><Link href="/therapist/onboard" className="hover:text-background transition-colors">For Therapists</Link></li>
              <li><Link href="#" className="hover:text-background transition-colors">Careers</Link></li>
              <li><Link href="#" className="hover:text-background transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-display font-semibold text-background text-sm uppercase tracking-wide">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="hover:text-background transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-background transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-background transition-colors">Accessibility</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 pt-8 text-center text-sm">
          <p>© 2026 ZenSpace. All rights reserved. If you are in crisis, please call iCall: 9152987821.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
