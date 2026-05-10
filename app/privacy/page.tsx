import Navbar from '@/components/home/Navbar'
import Footer from '@/components/home/Footer'

export const metadata = {
  title: 'Privacy Policy — ZenSpace',
  description: 'How ZenSpace collects, uses, and protects your personal and health data.',
}

const sections = [
  {
    title: '1. Introduction',
    body: `[PLACEHOLDER — Legal team to draft.] ZenSpace ("we", "us", "our") is committed to protecting the privacy and confidentiality of your personal information. This Privacy Policy explains how we collect, use, store, and share data when you use our platform.`,
  },
  {
    title: '2. Data We Collect',
    body: `[PLACEHOLDER — Legal team to draft.] We collect the following categories of data:\n\n• Account information: your name, email address, and password.\n• Profile and questionnaire data: information you provide about your mental-health needs and preferences.\n• Session data: records of completed therapy sessions (date, duration, session type).\n• Payment data: billing details processed by Razorpay — we do not store card numbers.\n• Usage data: pages visited, features used, and device or browser information.`,
  },
  {
    title: '3. How We Use Your Data',
    body: `[PLACEHOLDER — Legal team to draft.] We use your data to: provide and improve our services; match you with a suitable therapist; process payments; send session reminders and service communications; comply with legal obligations; and prevent fraud or misuse.`,
  },
  {
    title: '4. Sensitive Health Information',
    body: `[PLACEHOLDER — Legal team to draft.] Information you share in questionnaires and therapy sessions is treated as sensitive health data. We apply additional safeguards to this category of data and do not use it for advertising purposes. Access is restricted to your therapist and authorised ZenSpace personnel.`,
  },
  {
    title: '5. Data Sharing',
    body: `[PLACEHOLDER — Legal team to draft.] We do not sell your personal data. We share data only with: your assigned therapist; payment processors (Razorpay); email service providers (Resend); video session infrastructure (Daily.co); and our cloud hosting provider (Supabase). Each provider is contractually bound to protect your data.`,
  },
  {
    title: '6. Data Retention',
    body: `[PLACEHOLDER — Legal team to draft.] We retain your account data for as long as your account is active or as required by law. Health and session data may be retained for a minimum of [X years] in line with applicable medical records regulations in India. You may request deletion subject to our retention obligations.`,
  },
  {
    title: '7. Cookies and Tracking',
    body: `[PLACEHOLDER — Legal team to draft.] We use cookies for authentication and session management only. We do not use third-party advertising cookies. You can manage cookie preferences through your browser settings.`,
  },
  {
    title: '8. Your Rights',
    body: `[PLACEHOLDER — Legal team to draft.] You have the right to: access the personal data we hold about you; correct inaccurate data; request deletion of your data (subject to legal obligations); withdraw consent where processing is based on consent; and lodge a complaint with a supervisory authority.`,
  },
  {
    title: '9. Data Security',
    body: `[PLACEHOLDER — Legal team to draft.] We use industry-standard security measures including encryption in transit (TLS), encryption at rest, row-level security in our database, and strict access controls. No method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.`,
  },
  {
    title: '10. Children\'s Privacy',
    body: `[PLACEHOLDER — Legal team to draft.] ZenSpace offers a teen therapy service for users aged 13–17. For users under 18, parental or guardian consent is required. We take additional care with data belonging to minors and do not share it beyond what is necessary to provide the service.`,
  },
  {
    title: '11. International Data Transfers',
    body: `[PLACEHOLDER — Legal team to draft.] Our service is based in India. Some of our service providers may process data outside India. Where we transfer data internationally, we ensure appropriate safeguards are in place in accordance with applicable law.`,
  },
  {
    title: '12. Changes to This Policy',
    body: `[PLACEHOLDER — Legal team to draft.] We may update this Privacy Policy from time to time. We will notify you of material changes via email or an in-app notice. The "effective date" at the top of this page reflects the date of the most recent revision.`,
  },
  {
    title: '13. Contact Us',
    body: `If you have questions about this Privacy Policy or how we handle your data, please contact us at hello@zenspace.in. For data-related requests, please include "Privacy Request" in the subject line.`,
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main>
        <section className="bg-white pt-20 pb-16 md:pt-28 md:pb-20">
          <div className="max-w-3xl mx-auto px-6">

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-10 bg-[#7EC0B7]" />
              <span className="text-[#3D8A80] text-xs font-black uppercase tracking-[0.2em]">Legal</span>
            </div>
            <h1
              className="text-4xl md:text-5xl font-black text-[#233551] leading-tight mb-4"
              style={{ fontFamily: 'var(--font-lato)' }}
            >
              Privacy Policy
            </h1>
            <p className="text-[#233551]/50 text-sm mb-2">
              Effective date: <strong>[DATE — to be confirmed by legal team]</strong>
            </p>
            <p className="text-[#233551]/55 text-base leading-relaxed mb-12">
              Your privacy matters to us. This policy explains exactly what data we collect, why we collect it, and how it is protected.
            </p>

            {/* Notice banner */}
            <div className="bg-[#7EC0B7]/10 border border-[#7EC0B7]/30 rounded-2xl px-5 py-4 mb-12">
              <p className="text-sm text-[#233551]/70 leading-relaxed">
                <strong className="text-[#233551]">Note:</strong> Sections marked [PLACEHOLDER] are pending review by our legal team and will be updated before launch. The structure and headings reflect final intent.
              </p>
            </div>

            {/* Sections */}
            <div className="space-y-10">
              {sections.map(({ title, body }) => (
                <div key={title}>
                  <h2
                    className="text-lg font-black text-[#233551] mb-3"
                    style={{ fontFamily: 'var(--font-lato)' }}
                  >
                    {title}
                  </h2>
                  <p className="text-[#233551]/65 text-sm leading-relaxed whitespace-pre-line">{body}</p>
                </div>
              ))}
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
