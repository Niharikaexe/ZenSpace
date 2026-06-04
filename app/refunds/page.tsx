import Navbar from '@/components/home/Navbar'
import Footer from '@/components/home/Footer'

export const metadata = {
  title: 'Refunds and Cancellations — MindCanopy',
  description: 'How payments, cancellations, rescheduling, and refunds work on MindCanopy.',
  alternates: { canonical: 'https://mindcanopy.in/refunds' },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://mindcanopy.in/refunds',
    title: 'Refunds and Cancellations — MindCanopy',
    description: 'How payments, cancellations, rescheduling, and refunds work on MindCanopy.',
  },
}

export const revalidate = 86400

// ─── Helpers (mirrors /terms) ─────────────────────────────────────────────────

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-xl md:text-2xl font-black text-[#233551] leading-tight mt-12 mb-4"
      style={{ fontFamily: 'var(--font-lato)' }}
    >
      {children}
    </h2>
  )
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-[#233551]/70 text-sm md:text-[15px] leading-relaxed mb-3">{children}</p>
}

function Bullets({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-2 mb-4 pl-1">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3 text-[#233551]/70 text-sm md:text-[15px] leading-relaxed">
          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#7EC0B7] flex-shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function RefundsPage() {
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
              className="text-4xl md:text-5xl font-black text-[#233551] leading-tight mb-2"
              style={{ fontFamily: 'var(--font-lato)' }}
            >
              Refunds and Cancellations
            </h1>
            <p className="text-[#233551]/55 text-sm md:text-base leading-relaxed mb-4">
              MindCanopy (operated by MINDCANOPY SERVICES LLP)
            </p>
            <p className="text-[#233551]/50 text-sm mb-12">
              Last Updated: <strong>4 June 2026</strong> &nbsp;|&nbsp; Effective Date: <strong>4 June 2026</strong>
            </p>

            {/* Body */}
            <div>
              <P>
                We want this to be clear and human. Therapy works when you show up — so we keep
                payments simple and tell you upfront exactly what is and isn&rsquo;t refundable.
                This policy applies to all payments made on MindCanopy (www.mindcanopy.in),
                processed securely through our payment partner, Cashfree Payments.
              </P>

              <H2>1. How payment works</H2>
              <P>
                MindCanopy is pay-as-you-go. You start with a free introductory chat — no card,
                no charge. After that, you pay for each therapy session when you book it, or you
                can prepay for a monthly bundle of sessions at a discount. There is no recurring
                subscription and nothing is auto-charged.
              </P>

              <H2>2. The free intro chat is free</H2>
              <P>
                Your introductory chat with a matched therapist costs nothing. You only ever pay
                once you choose to book a session. So there is nothing to refund at this stage.
              </P>

              <H2>3. Sessions are non-refundable</H2>
              <P>
                When you pay for a session, that payment reserves a therapist&rsquo;s time held
                specifically for you. For that reason, completed and booked sessions are
                <span className="font-semibold text-[#233551]"> non-refundable</span>. You can,
                however, reschedule — see below.
              </P>

              <H2>4. Rescheduling and cancellations</H2>
              <Bullets items={[
                <><span className="font-semibold text-[#233551]">Reschedule for free</span> up to 24 hours before your session start time. You can move it to any available slot with the same therapist at no extra cost.</>,
                <><span className="font-semibold text-[#233551]">Within 24 hours or a no-show:</span> the session is considered used and is not refundable or transferable, because the therapist&rsquo;s time was reserved.</>,
                <>If you simply don&rsquo;t want to continue, you don&rsquo;t need to cancel anything — there is no subscription. You just stop booking.</>,
              ]} />

              <H2>5. Monthly bundles (prepaid sessions)</H2>
              <P>
                A monthly bundle is a set of prepaid session credits at a discounted rate. Bundle
                purchases are non-refundable. Credits are valid for the period stated at purchase,
                and each credit is consumed when you book a session. Unused credits do not carry a
                separate cash value and are not exchangeable for money.
              </P>

              <H2>6. Failed, duplicate, or wrong-amount payments</H2>
              <P>
                If money is deducted but your session or bundle is not confirmed, or you are charged
                twice for the same booking, or charged an incorrect amount, that is not a service
                payment — it&rsquo;s an error, and we will refund it in full. Reach out with your
                payment reference and we&rsquo;ll sort it out.
              </P>

              <H2>7. If a therapist cancels</H2>
              <P>
                If your therapist needs to cancel a confirmed session, you can reschedule it at no
                cost, or — if you prefer not to reschedule — receive a full refund of that
                session&rsquo;s payment.
              </P>

              <H2>8. How approved refunds are processed</H2>
              <P>
                Where a refund is due under this policy, it is processed back to your original
                payment method through Cashfree Payments. Once approved, refunds are typically
                completed within <span className="font-semibold text-[#233551]">5–7 business days</span>,
                though the exact timing depends on your bank or card issuer.
              </P>

              <H2>9. How to request a refund or raise a concern</H2>
              <P>
                Email us at <a href="mailto:admin@mindcanopy.in" className="text-[#3D8A80] font-semibold hover:underline">admin@mindcanopy.in</a> with
                your registered email and the payment reference (order or transaction ID). We aim to
                respond within one business day. Nothing in this policy limits the rights you may have
                under the Consumer Protection Act, 2019.
              </P>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
