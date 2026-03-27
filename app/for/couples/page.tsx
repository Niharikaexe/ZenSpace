import type { Metadata } from 'next'
import Navbar from '@/components/home/Navbar'
import Footer from '@/components/home/Footer'
import CouplesPageClient from './CouplesPageClient'

export const metadata: Metadata = {
  title: 'Online Couples Therapy & Marriage Counselling in India | ZenSpace',
  description:
    'Feeling distant from your partner? Communication breaking down? Online couples counselling with licensed therapists. No judgment, no taking sides. First session free. ZenSpace India.',
  keywords: [
    'couples therapy marriage counseling',
    'online couples counseling',
    'online counseling marriage',
    'couples therapy for communication',
    'does couples therapy work',
    'marriage counselling india',
  ],
}

export default function CouplesPage() {
  return (
    <>
      <Navbar />
      <CouplesPageClient />
      <Footer />
    </>
  )
}
