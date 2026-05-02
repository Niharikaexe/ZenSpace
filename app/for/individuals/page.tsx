import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/home/Navbar'
import Footer from '@/components/home/Footer'
import IndividualsPageClient from './IndividualsPageClient'

export const metadata: Metadata = {
  title: 'Online Anxiety & Stress Therapy for Adults in India | ZenSpace',
  description:
    'Feeling burned out, anxious, or just off? Talk to a real therapist online. Free intro chat before you pay. No waiting rooms, no judgment. ZenSpace — therapy for working Indians.',
  keywords: [
    'anxiety therapy online',
    'stress management therapy',
    'anger management therapy online',
    'loneliness therapy',
    'online therapy for breakup',
    'cognitive behavioral therapy for anxiety',
    'online therapy india',
    'therapy for burnout',
  ],
}

export default function IndividualsPage() {
  return (
    <>
      <Navbar />
      <IndividualsPageClient />
      <Footer />
    </>
  )
}
