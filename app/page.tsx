import Navbar from "@/components/home/Navbar"
import HeroSection from "@/components/home/HeroSection"
import TrustBar from "@/components/home/TrustBar"
import ProblemRecognition from "@/components/home/ProblemRecognition"
import TherapyNeeds from "@/components/home/TherapyNeeds"
import HowItWorks from "@/components/home/HowItWorks"
import TherapistCards from "@/components/home/TherapistCards"
import PricingPlans from "@/components/home/PricingPlans"
import Testimonials from "@/components/home/Testimonials"
import PrivacySection from "@/components/home/PrivacySection"
import CTASection from "@/components/home/CTASection"
import FAQ from "@/components/home/FAQ"
import Footer from "@/components/home/Footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <TrustBar />
      <ProblemRecognition />
      <TherapyNeeds />
      <HowItWorks />
      <TherapistCards />
      <PricingPlans />
      <Testimonials />
      <PrivacySection />
      <CTASection />
      <FAQ />
      <Footer />
    </div>
  )
}
