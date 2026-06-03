import Navbar from '@/components/home/Navbar'
import Footer from '@/components/home/Footer'

export const metadata = {
  title: 'Privacy Policy — MindCanopy',
  description: 'How MindCanopy collects, uses, and protects your personal and health data.',
  alternates: { canonical: 'https://mindcanopy.in/privacy' },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://mindcanopy.in/privacy',
    title: 'Privacy Policy — MindCanopy',
    description: 'How MindCanopy collects, uses, and protects your personal and health data.',
  },
}

export const revalidate = 86400

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="text-base md:text-lg font-black text-[#233551] mt-7 mb-3"
      style={{ fontFamily: 'var(--font-lato)' }}
    >
      {children}
    </h3>
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
          <span className="text-[#7EC0B7] mt-2 w-1.5 h-1.5 rounded-full bg-[#7EC0B7] flex-shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

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
            <p className="text-[#233551]/50 text-sm mb-12">
              Last updated: <strong>25 May 2026</strong>
            </p>

            {/* Body */}
            <div>
              <H2>1. Introduction</H2>
              <P>
                This Privacy Policy (&ldquo;Policy&rdquo;) explains how MINDCANOPY SERVICES LLP (&ldquo;Mind Canopy&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) collects, uses, shares, and protects personal information of individuals who visit our website or use our online mental health platform and related services.
              </P>
              <P>
                By accessing or using our website and services, you agree to the collection and use of your information in accordance with this Policy and our Terms of Use.
              </P>
              <P>
                Mind Canopy provides an online platform that connects clients with independent mental health professionals (&ldquo;Therapists&rdquo;) for counselling and related services. Mind Canopy itself does not provide clinical services or act as your treating clinician; those services are provided solely by Therapists who are listed on our platform under agreements with us.
              </P>
              <P>
                <span className="font-semibold text-[#233551]">Mind Canopy is not an emergency or crisis service.</span> If you are in immediate danger, considering self-harm, or experiencing any other emergency, please contact your local emergency number or visit the nearest hospital or crisis service immediately.
              </P>

              <H2>2. Who We Are and How to Contact Us</H2>
              <P>
                <span className="font-semibold text-[#233551]">MINDCANOPY SERVICES LLP</span><br />
                Bren Edgewaters, Bengaluru, Karnataka, India<br />
                Email (support and privacy):{' '}
                <a href="mailto:support@mindcanopy.in" className="text-[#3D8A80] hover:text-[#233551] underline underline-offset-2 font-semibold">
                  support@mindcanopy.in
                </a>
              </P>
              <P>
                If you have any questions, complaints, or requests relating to this Privacy Policy or your personal data, you may contact us at support@mindcanopy.in, and we will review your request in accordance with applicable law, including the Digital Personal Data Protection Act, 2023 (&ldquo;DPDP Act&rdquo;).
              </P>

              <H2>3. Who This Policy Applies To</H2>
              <P>This Policy applies to:</P>
              <Bullets items={[
                'Visitors to our website.',
                <>Individuals who create an account and use Mind Canopy to seek or receive counselling or therapy (&ldquo;Clients&rdquo;).</>,
                <>Mental health professionals who register and list their services on Mind Canopy (&ldquo;Therapists&rdquo;).</>,
              ]} />
              <P>
                For personal data processed through our platform, Mind Canopy acts as a data fiduciary under the DPDP Act.
              </P>

              <H2>4. Age and Eligibility</H2>
              <P>Mind Canopy is designed for:</P>
              <Bullets items={[
                'Adults (18+); and',
                'Teenagers aged 13–19, with appropriate parental or guardian involvement where required.',
              ]} />
              <P>Teenagers aged 13–17 may use Mind Canopy only:</P>
              <Bullets items={[
                'Where permitted by applicable law; and',
                'With the knowledge and, where required, consent or involvement of a parent or legal guardian, which may be confirmed during registration or by the Therapist before or during services.',
              ]} />
              <P>
                Therapists may decide, based on professional judgment, local law, and safeguarding needs, whether they can work with a particular teen client and whether parental or guardian involvement is needed in that case.
              </P>
              <P>
                Mind Canopy does not knowingly offer services to children under 13. If you are under 13, please do not use this platform. If we become aware that we have collected personal data from a child under 13, we will take reasonable steps to delete it.
              </P>

              <H2>5. Information We Collect</H2>
              <P>We collect only the information that is reasonably necessary to operate our platform and enable counselling services.</P>

              <H3>5.1 Information you provide as a Client</H3>
              <Bullets items={[
                <><span className="font-semibold text-[#233551]">Account and profile information:</span> Name, email address, phone number (where provided), age or date of birth, gender, location (city/state), and password or other login credentials.</>,
                <><span className="font-semibold text-[#233551]">Therapy preferences:</span> Areas you want to work on, preferred therapist characteristics, language preferences, availability, and communication preferences.</>,
                <><span className="font-semibold text-[#233551]">Intake and session information:</span> Answers to onboarding forms, screening or intake questionnaires, information about your mental health concerns and goals, and details you choose to share before or during sessions.</>,
                <><span className="font-semibold text-[#233551]">Session records and notes (online):</span> Session booking history (dates, times, duration, status); session notes or summaries created on the platform for you and your Therapist to view, as part of your care.</>,
                <><span className="font-semibold text-[#233551]">Communication data:</span> Messages you send via our platform (where messaging is enabled) and emails or other communications with our support team.</>,
                <><span className="font-semibold text-[#233551]">Billing and payment information:</span> Name, contact details, subscription or plan details, and transaction information (such as payment method, masked card information, transaction ID). Payment credentials are processed by our payment partners and are not stored in full by Mind Canopy.</>,
              ]} />
              <P>
                Therapists may also maintain their own private notes offline, outside the Mind Canopy platform. Those offline notes are created and controlled solely by the Therapist and are not governed by this Policy.
              </P>

              <H3>5.2 Information you provide as a Therapist</H3>
              <P>If you register as a Therapist, we may collect:</P>
              <Bullets items={[
                'Identity and contact details (name, email, phone, address).',
                'Professional qualifications, licenses/registrations, experience, areas of specialization, languages, and profile photo.',
                'Fees, availability, and scheduling preferences.',
                'Bank or payout details (handled through secure payment partners where possible).',
                'Communications with clients via the platform, and communications with Mind Canopy.',
              ]} />

              <H3>5.3 Information collected automatically</H3>
              <P>When you visit or use the platform, we may automatically collect:</P>
              <Bullets items={[
                'Device and technical data (IP address, browser type, device identifiers, operating system, referring pages, access times).',
                'Usage data (pages visited, features used, clicks, scrolls, time spent, error logs).',
                <>Cookie identifiers and similar tracking data, as described in the &ldquo;Cookies and Tracking Technologies&rdquo; section.</>,
              ]} />

              <H2>6. How We Use Your Information</H2>
              <P>We use your information in line with the DPDP Act and other applicable Indian laws for the following purposes.</P>

              <H3>6.1 To provide the Mind Canopy service</H3>
              <Bullets items={[
                'Create and manage your account, authenticate logins, and maintain your user profile.',
                'Match clients with appropriate Therapists, based on preferences and intake information.',
                'Schedule, manage, and record online sessions conducted via daily.co as our video session provider.',
                'Facilitate secure messaging and communication (where enabled) between Clients and Therapists.',
                'Maintain online session notes for Clients and Therapists to view through the platform.',
                'Handle billing, payments, subscriptions, and invoices through our payment partners.',
              ]} />

              <H3>6.2 To communicate with you</H3>
              <Bullets items={[
                'Send booking confirmations, reminders, and updates about sessions.',
                'Send important service announcements, policy updates, and security or support notifications.',
                'Respond to your support queries and feedback.',
              ]} />

              <H3>6.3 For safety, legal, and compliance purposes</H3>
              <Bullets items={[
                'Detect, prevent, and respond to fraud, unauthorized access, abuse, or security incidents.',
                'Comply with legal obligations, lawful requests, or court orders.',
                'Protect the rights, property, or safety of Mind Canopy, our users, Therapists, or the public, including in situations involving serious risk of harm.',
              ]} />

              <H3>6.4 For analytics and service improvement</H3>
              <Bullets items={[
                'Use aggregated and de-identified data where possible to understand how our website and platform are used.',
                'Improve user experience, develop new features, and optimize performance.',
              ]} />

              <H3>6.5 For marketing and advertising (non-clinical data)</H3>
              <P>
                We use standard digital marketing tools (such as Google Ads, Google Analytics, Google Tag Manager, Meta Pixel, and TikTok Pixel) to understand campaign performance and show relevant ads to potential users.
              </P>
              <P>For these purposes, we may use:</P>
              <Bullets items={[
                'Cookie and pixel identifiers.',
                'Approximate location, device type, and general usage patterns.',
                'Non-clinical information such as the fact that a device visited certain pages on our website.',
              ]} />
              <P>We do not use or share:</P>
              <Bullets items={[
                'Session notes;',
                'Assessment responses or detailed intake answers about your mental health;',
                'Therapist notes or detailed clinical information;',
                'Any content of your therapy sessions;',
              ]} />
              <P>for advertising, profiling, or campaign targeting.</P>
              <P>
                Where required, we will request your consent for non-essential cookies or marketing emails and provide options to opt out.
              </P>

              <H2>7. Legal Basis and Consent (DPDP Act)</H2>
              <P>Under the DPDP Act, we rely on the following grounds for processing:</P>
              <Bullets items={[
                <><span className="font-semibold text-[#233551]">Your consent:</span> For most client-related data, especially mental health–related information and non-essential cookies/marketing, we rely on your free, specific, informed, unconditional, and unambiguous consent.</>,
                <><span className="font-semibold text-[#233551]">Performance of the services you request:</span> Many processing activities (like account creation, matching, and session handling) are necessary to deliver the services you choose.</>,
                <><span className="font-semibold text-[#233551]">Certain legitimate uses permitted by law:</span> For example, complying with legal obligations, responding to safety risks, and preventing fraud.</>,
              ]} />
              <P>You may withdraw your consent at any time, but this may affect our ability to provide some or all services.</P>

              <H2>8. How We Share Your Information</H2>
              <P>We do not sell your personal data. We share it only as described below and only to the extent necessary.</P>

              <H3>8.1 With Therapists</H3>
              <P>When you book or are matched with a Therapist, we share relevant information so they can assess whether they can work with you and deliver services, such as:</P>
              <Bullets items={[
                'Your name (or chosen display name), age range, and city/state;',
                'Intake and preference information;',
                'Session history and online notes made available to you and your Therapist.',
              ]} />
              <P>
                Therapists listed on Mind Canopy are independent professionals, not employees of Mind Canopy. They are bound by their own professional ethics, applicable regulations, and contractual obligations with Mind Canopy to keep your information confidential and to use it only for providing services to you through or in connection with our platform.
              </P>

              <H3>8.2 With service providers</H3>
              <P>We use trusted third-party vendors to operate our platform, for example:</P>
              <Bullets items={[
                'Cloud hosting and infrastructure (with servers in India or Asia data centers).',
                'Video session provider (daily.co).',
                'Payment gateways and payment processors.',
                'Email and notification service providers.',
                'Analytics, tag management, and advertising platforms (as listed above).',
              ]} />
              <P>
                These service providers act on our instructions and are required to handle data securely and only for the purposes described in this Policy.
              </P>

              <H3>8.3 For legal reasons and safety</H3>
              <P>We may disclose information if we reasonably believe it is necessary to:</P>
              <Bullets items={[
                'Comply with any applicable law, regulation, legal process, or enforceable governmental request.',
                'Protect the safety, rights, or property of you or others, including in situations of serious or imminent risk of self-harm or harm to others, or in cases of suspected abuse where law requires reporting.',
                'Detect, prevent, or address fraud, security, or technical issues.',
              ]} />

              <H3>8.4 Business transfers</H3>
              <P>
                If Mind Canopy is involved in a merger, acquisition, reorganization, or sale of assets, your information may be transferred as part of that transaction, subject to continued protection consistent with this Policy or a successor policy that provides at least comparable protection.
              </P>

              <H2>9. International Therapists and Cross-Border Access</H2>
              <P>Mind Canopy primarily serves Clients in India, but Therapists may be located worldwide.</P>
              <P>
                When you are matched with or book sessions with a Therapist located outside India, certain personal and session-related information will be accessible to that Therapist so they can provide services to you.
              </P>
              <P>
                Our infrastructure and key systems are hosted on servers located in India or within Asia data centers, but some of our service providers or support tools may involve transfers or remote access from other countries.
              </P>
              <P>
                Where such cross-border transfers or access occur, we take reasonable steps to ensure that your information remains protected and that such processing complies with the DPDP Act and other applicable Indian requirements.
              </P>

              <H2>10. Data Retention</H2>
              <P>
                We retain personal data only for as long as necessary for the purposes described in this Policy or as required by law, whichever is longer.
              </P>
              <P>Unless a different period is required by law or professional obligations:</P>
              <Bullets items={[
                <><span className="font-semibold text-[#233551]">Account, profile, and contact details:</span> Retained while your account is active and for up to 3 years after your last activity or account closure, to handle queries, disputes, or legal requirements.</>,
                <><span className="font-semibold text-[#233551]">Intake forms, online session notes, and session history:</span> Retained for up to 3 years from the date of your last session, unless a longer or shorter period is required by applicable law.</>,
                <><span className="font-semibold text-[#233551]">Payment and invoice records:</span> Retained for at least 3 years or longer if required by tax, accounting, or regulatory obligations.</>,
                <><span className="font-semibold text-[#233551]">Backups and logs:</span> Retained for shorter, rolling periods necessary for security, troubleshooting, and continuity.</>,
              ]} />
              <P>
                After the relevant retention period, we will delete or anonymize your personal data in accordance with our internal policies and applicable law.
              </P>

              <H2>11. Your Rights</H2>
              <P>Subject to verification and applicable exceptions under the DPDP Act and other laws, you may exercise the following rights:</P>
              <Bullets items={[
                <><span className="font-semibold text-[#233551]">Access:</span> Request information about the categories of personal data we process and obtain access to your data.</>,
                <><span className="font-semibold text-[#233551]">Correction:</span> Ask us to correct or update inaccurate or incomplete personal data.</>,
                <><span className="font-semibold text-[#233551]">Erasure:</span> Request deletion of your personal data when it is no longer needed for the stated purposes or where you withdraw consent and there is no other lawful basis for retention, subject to legal and legitimate interests (for example, regulatory or legal defense needs).</>,
                <><span className="font-semibold text-[#233551]">Withdrawal of consent:</span> Withdraw your consent at any time for processing that is based on consent, without affecting the lawfulness of processing prior to withdrawal.</>,
                <><span className="font-semibold text-[#233551]">Grievance / complaint:</span> Lodge a complaint with us regarding our data practices and escalate further to the competent authority under the DPDP Act if you are not satisfied with our response.</>,
              ]} />
              <P>
                You can exercise these rights by emailing{' '}
                <a href="mailto:support@mindcanopy.in" className="text-[#3D8A80] hover:text-[#233551] underline underline-offset-2 font-semibold">
                  support@mindcanopy.in
                </a>{' '}
                with your request. We may ask for additional information to verify your identity and ensure that we are interacting with the correct person.
              </P>

              <H2>12. Confidentiality of Therapy Content</H2>
              <P>Mind Canopy recognizes that mental health and therapy-related information is highly sensitive.</P>
              <P>
                Information you share through intake forms, during sessions, and in online notes is treated as confidential and is accessible only to you, your Therapist, and a strictly limited set of authorized Mind Canopy personnel who require access for support, quality assurance, or legal/compliance reasons.
              </P>
              <P>
                Therapist private notes kept offline (outside the Mind Canopy platform) are created and maintained solely by the Therapist and are subject to their professional and legal obligations, not this Policy.
              </P>
              <P>Confidentiality may be overridden only in limited circumstances, such as:</P>
              <Bullets items={[
                'Imminent risk of serious harm to you or others.',
                'Suspected abuse or exploitation where reporting is required by law.',
                'Valid legal process (such as a court order) requiring disclosure.',
              ]} />
              <P>
                We do not use or share therapy content, session notes, therapist notes, or detailed mental health information for advertising, marketing, or unrelated analytics.
              </P>

              <H2>13. Cookies and Tracking Technologies</H2>
              <P>We use cookies, pixels, and similar technologies to:</P>
              <Bullets items={[
                'Enable essential functionality such as login and security.',
                'Understand how users interact with our website (analytics).',
                'Measure and improve the effectiveness of our marketing campaigns (advertising).',
              ]} />
              <P>These tools may include Google Analytics, Google Ads, Google Tag Manager, Meta Pixel, and TikTok Pixel.</P>
              <P>You can control cookies through:</P>
              <Bullets items={[
                'Your browser settings, where you can block or delete cookies; and',
                'Any cookie banner or settings we provide on our website to manage non-essential cookies.',
              ]} />
              <P>If you disable certain cookies, parts of our website may not function properly.</P>

              <H2>14. Security</H2>
              <P>
                We use reasonable technical and organizational measures to protect your information from unauthorized access, alteration, disclosure, or destruction.
              </P>
              <P>These measures may include:</P>
              <Bullets items={[
                'Encryption in transit, secure server configurations, and firewalls.',
                'Access controls limiting which staff and systems can access sensitive data.',
                'Regular updates, monitoring, and internal policies for handling personal data securely.',
              ]} />
              <P>
                While we strive to protect your data, no system can be wholly secure. You are also responsible for keeping your login credentials confidential and for logging out after using shared devices.
              </P>

              <H2>15. Data Breach</H2>
              <P>
                If we become aware of a personal data breach that is likely to result in a significant risk to your rights or interests, we will:
              </P>
              <Bullets items={[
                'Take steps to contain and investigate the breach;',
                'Notify relevant authorities where required by law; and',
                'Inform affected users, where appropriate, with information and guidance on protective steps you can take.',
              ]} />

              <H2>16. Third-Party Links</H2>
              <P>
                Our website may contain links to external websites, apps, or services that are not operated or controlled by Mind Canopy.
              </P>
              <P>
                This Policy does not apply to those third parties. You are encouraged to review their privacy policies before providing them with your personal information.
              </P>

              <H2>17. Changes to This Policy</H2>
              <P>
                We may revise this Privacy Policy from time to time to reflect changes in our services, legal requirements, or other operational needs.
              </P>
              <P>
                When we make material changes, we will update the &ldquo;Last updated&rdquo; date at the top of this page and may provide additional notice (for example, on the website or by email). Your continued use of Mind Canopy after such changes become effective will mean that you accept the updated Policy.
              </P>
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
