import Navbar from "@/components/home/Navbar"
import HeroSection from "@/components/home/HeroSection"
import TrustBar from "@/components/home/TrustBar"
import WhyNow from "@/components/home/WhyNow"
import HowItWorks from "@/components/home/HowItWorks"
import TherapistCards from "@/components/home/TherapistCards"
import Testimonials from "@/components/home/Testimonials"
import PrivacySafety from "@/components/home/PrivacySafety"
import CTASection from "@/components/home/CTASection"
import FAQ from "@/components/home/FAQ"
import Footer from "@/components/home/Footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <TrustBar />
      <WhyNow />
      <HowItWorks />
      <TherapistCards />
      <Testimonials />
      <PrivacySafety />
      <CTASection />
      <FAQ />
      <Footer />
    </div>
  )
}
