import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact us',
  description:
    'Get in touch with MindCanopy. Questions about therapy, pricing, or how the platform works, send us a message and a real person will reply.',
  alternates: {
    canonical: 'https://mindcanopy.in/contact',
  },
  openGraph: {
    title: 'Contact MindCanopy',
    description:
      'Questions about therapy, pricing, or the platform, send us a message and a real person will reply.',
    url: 'https://mindcanopy.in/contact',
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
