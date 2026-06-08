import type { Metadata } from "next";
import { Inter, Lora, Lato } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { AttributionCapture } from "@/components/shared/AttributionCapture";
import "./globals.css";

const GTM_ID = "GTM-N8HZ2VCG";

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
    default: "MindCanopy — Online Therapy for India",
    template: "%s | MindCanopy",
  },
  description:
    `Talk to a globally trained therapist from home. Weekly video sessions, unlimited text messaging, free intro chat. No waiting rooms. No prescriptions.`,
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
  authors: [{ name: "MindCanopy" }],
  creator: "MindCanopy",
  metadataBase: new URL("https://mindcanopy.in"),
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://mindcanopy.in",
    siteName: "MindCanopy",
    title: "MindCanopy — Online Therapy for India",
    description:
      `Talk to a globally trained therapist from home. Weekly video sessions, unlimited text messaging, free intro chat.`,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MindCanopy — Online Therapy for India",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@mindcanopy_in",
    creator: "@mindcanopy_in",
    title: "MindCanopy — Online Therapy for India",
    description:
      "Talk to a globally trained therapist from home. Weekly video sessions, unlimited text messaging, free intro chat.",
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
    canonical: "https://mindcanopy.in",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "MedicalBusiness",
  name: "MindCanopy",
  description:
    "Online therapy platform for India. Weekly video sessions with globally trained therapists, unlimited async text messaging.",
  url: "https://mindcanopy.in",
  areaServed: "IN",
  serviceType: "Online Therapy",
  priceRange: "₹₹",
  medicalSpecialty: "Psychotherapy",
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
        {/* Google Tag Manager */}
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} ${lora.variable} ${lato.variable} antialiased`}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <AttributionCapture />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
