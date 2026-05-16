import Navbar from '@/components/home/Navbar'
import Footer from '@/components/home/Footer'

export const metadata = {
  title: 'Terms of Service — MindCanopy',
  description: 'The terms that govern your use of MindCanopy, our therapy platform.',
}

const sections = [
  {
    title: '1. Acceptance of Terms',
    body: `[PLACEHOLDER — Legal team to draft.] By accessing or using MindCanopy, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use the platform.`,
  },
  {
    title: '2. Description of Service',
    body: `[PLACEHOLDER — Legal team to draft.] MindCanopy is an online platform that connects clients with licensed mental-health professionals for therapeutic services delivered via video and chat. We are a technology platform and are not a medical provider.`,
  },
  {
    title: '3. Eligibility',
    body: `[PLACEHOLDER — Legal team to draft.] You must be at least 13 years old to use MindCanopy. Users under 18 require parental or guardian consent. By registering, you confirm that the information you provide is accurate and complete.`,
  },
  {
    title: '4. User Accounts',
    body: `[PLACEHOLDER — Legal team to draft.] You are responsible for maintaining the confidentiality of your account credentials. You must not share your account with any other person. You agree to notify us immediately of any unauthorised use of your account.`,
  },
  {
    title: '5. Therapist Relationship',
    body: `[PLACEHOLDER — Legal team to draft.] Therapists on MindCanopy are independent professionals, not employees of MindCanopy. The therapeutic relationship is solely between you and your therapist. MindCanopy does not provide clinical supervision or override professional judgements made by therapists.`,
  },
  {
    title: '6. Subscriptions and Payments',
    body: `[PLACEHOLDER — Legal team to draft.] Subscriptions are billed in advance on a weekly or monthly basis. All payments are processed securely via Razorpay. Subscription fees are non-refundable except as required by law or our refund policy.`,
  },
  {
    title: '7. Cancellations and Refunds',
    body: `[PLACEHOLDER — Legal team to draft.] You may cancel your subscription at any time from your dashboard. Cancellation takes effect at the end of the current billing period. Refund eligibility will be determined on a case-by-case basis in line with our Refund Policy.`,
  },
  {
    title: '8. Prohibited Conduct',
    body: `[PLACEHOLDER — Legal team to draft.] You agree not to misuse the platform, including but not limited to: impersonating others, uploading harmful content, attempting to circumvent security measures, or using the platform for any unlawful purpose.`,
  },
  {
    title: '9. Intellectual Property',
    body: `[PLACEHOLDER — Legal team to draft.] All content on MindCanopy — including text, graphics, logos, and software — is owned by or licensed to MindCanopy. You may not reproduce or redistribute any part of the platform without our express written permission.`,
  },
  {
    title: '10. Limitation of Liability',
    body: `[PLACEHOLDER — Legal team to draft.] MindCanopy is provided "as is." To the maximum extent permitted by law, we disclaim all warranties and limit our liability for any indirect or consequential damages arising from your use of the platform.`,
  },
  {
    title: '11. Crisis and Emergency Situations',
    body: `[PLACEHOLDER — Legal team to draft.] MindCanopy is not a crisis service. If you or someone you know is in immediate danger, please call emergency services (112) or a crisis helpline such as iCall (9152987821). Our platform is not equipped to handle psychiatric emergencies.`,
  },
  {
    title: '12. Changes to These Terms',
    body: `[PLACEHOLDER — Legal team to draft.] We may update these terms from time to time. We will notify you of material changes via email or an in-app notice. Continued use of the platform after changes take effect constitutes your acceptance of the revised terms.`,
  },
  {
    title: '13. Governing Law',
    body: `[PLACEHOLDER — Legal team to draft.] These terms are governed by the laws of India. Any disputes will be subject to the exclusive jurisdiction of the courts located in Bengaluru, Karnataka.`,
  },
  {
    title: '14. Contact',
    body: `If you have questions about these terms, please contact us at admin@mindcanopy.in.`,
  },
]

export default function TermsPage() {
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
              Terms of Service
            </h1>
            <p className="text-[#233551]/50 text-sm mb-2">
              Effective date: <strong>[DATE — to be confirmed by legal team]</strong>
            </p>
            <p className="text-[#233551]/55 text-base leading-relaxed mb-12">
              Please read these terms carefully before using MindCanopy. They explain your rights and responsibilities as a user of our platform.
            </p>

            {/* Notice banner */}
            <div className="bg-[#FFF5F2] border border-[#E8926A]/30 rounded-2xl px-5 py-4 mb-12">
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
                  <p className="text-[#233551]/65 text-sm leading-relaxed">{body}</p>
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
