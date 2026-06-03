import type { Metadata } from 'next'
import Navbar from '@/components/home/Navbar'
import Footer from '@/components/home/Footer'
import CouplesPageClient from './CouplesPageClient'

export const metadata: Metadata = {
  title: 'Online Couples Therapy & Marriage Counselling in India | MindCanopy',
  description:
    'Feeling distant from your partner? Communication breaking down? Online couples counselling with licensed therapists. No judgment, no taking sides. First session free. MindCanopy India.',
  keywords: [
    'couples therapy marriage counseling',
    'online couples counseling',
    'online counseling marriage',
    'couples therapy for communication',
    'does couples therapy work',
    'marriage counselling india',
  ],
  alternates: { canonical: 'https://mindcanopy.in/for/couples' },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://mindcanopy.in/for/couples',
    title: 'Online Couples Therapy & Marriage Counselling in India | MindCanopy',
    description:
      'Feeling distant, or stuck in the same argument? Online couples counselling with licensed therapists. No taking sides. First session free.',
  },
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
