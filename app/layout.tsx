import type { Metadata } from "next";
import { Inter, Lora, Lato } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  display: "swap",
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ZenSpace — Online Therapy for India",
    template: "%s | ZenSpace",
  },
  description:
    "Talk to a globally trained therapist from home. Weekly video sessions, unlimited text messaging, free 15-minute intro call. No waiting rooms. No prescriptions. Starting ₹2,999/week.",
  keywords: [
    "online therapy India",
    "online therapist India",
    "mental health India",
    "therapy online",
    "anxiety therapy India",
    "depression therapy India",
    "couples therapy India",
    "talk therapy India",
    "therapist near me",
    "online counselling India",
  ],
  authors: [{ name: "ZenSpace" }],
  creator: "ZenSpace",
  metadataBase: new URL("https://zenspace.in"),
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://zenspace.in",
    siteName: "ZenSpace",
    title: "ZenSpace — Online Therapy for India",
    description:
      "Talk to a globally trained therapist from home. Weekly video sessions, unlimited text messaging, free 15-minute intro call. Starting ₹2,999/week.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ZenSpace — Online Therapy for India",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ZenSpace — Online Therapy for India",
    description:
      "Talk to a globally trained therapist from home. Weekly video sessions, unlimited text messaging, free 15-minute intro call.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://zenspace.in",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "MedicalBusiness",
  name: "ZenSpace",
  description:
    "Online therapy platform for India. Weekly video sessions with globally trained therapists, unlimited async text messaging.",
  url: "https://zenspace.in",
  areaServed: "IN",
  serviceType: "Online Therapy",
  priceRange: "₹₹",
  medicalSpecialty: "Psychiatry",
  availableService: [
    { "@type": "MedicalTherapy", name: "Individual Therapy" },
    { "@type": "MedicalTherapy", name: "Couples Therapy" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} ${lora.variable} ${lato.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
