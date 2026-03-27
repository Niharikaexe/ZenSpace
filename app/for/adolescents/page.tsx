import type { Metadata } from 'next'
import Navbar from '@/components/home/Navbar'
import Footer from '@/components/home/Footer'
import AdolescentsPageClient from './AdolescentsPageClient'

export const metadata: Metadata = {
  title: 'Online Therapy for Teenagers & Adolescents in India | ZenSpace',
  description:
    'Exam anxiety, social pressure, and feeling alone — teen struggles are real. Online therapy for Indian adolescents aged 14–20. Safe, private, and on your schedule. ZenSpace.',
  keywords: [
    'online therapy for teens',
    'child therapy near me',
    'mental health services youth',
    'behavioral therapy for kids',
    'CBT for ADHD',
    'anger management therapy children',
    'therapy for students india',
    'exam anxiety therapy',
  ],
}

export default function AdolescentsPage() {
  return (
    <>
      <Navbar />
      <AdolescentsPageClient />
      <Footer />
    </>
  )
}
