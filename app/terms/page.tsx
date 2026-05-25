import Navbar from '@/components/home/Navbar'
import Footer from '@/components/home/Footer'

export const metadata = {
  title: 'Terms and Conditions — MindCanopy',
  description: 'The terms that govern your use of MindCanopy, our online mental health platform.',
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

function Pending({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#FFF5F2] border border-[#E8926A]/25 rounded-xl px-4 py-3 mb-4">
      <p className="text-sm text-[#233551]/65 leading-relaxed">
        <span className="font-semibold text-[#233551]">[Pending finalisation by legal team]</span> {children}
      </p>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

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
              className="text-4xl md:text-5xl font-black text-[#233551] leading-tight mb-2"
              style={{ fontFamily: 'var(--font-lato)' }}
            >
              Terms and Conditions
            </h1>
            <p className="text-[#233551]/55 text-sm md:text-base leading-relaxed mb-4">
              MindCanopy (operated by MINDCANOPY SERVICES LLP)
            </p>
            <p className="text-[#233551]/50 text-sm mb-12">
              Last Updated: <strong>26 May 2026</strong> &nbsp;|&nbsp; Effective Date: <strong>26 May 2026</strong>
            </p>

            {/* Body */}
            <div>

              <H2>1. The Terms and Conditions</H2>
              <P>
                The following are the Terms and Conditions (this &ldquo;Agreement&rdquo;) which govern your access to and use of the online platform through which mental health counselling and talk therapy services may be facilitated (collectively, the &ldquo;Platform&rdquo;). The Platform is owned and operated by MINDCANOPY SERVICES LLP, a limited liability partnership incorporated in India under the Limited Liability Partnership Act, 2008, having its registered office at Bren Edgewaters, Bengaluru, Karnataka, India (LLPIN: [LLPIN to be inserted]) (&ldquo;MindCanopy&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;, or the &ldquo;Company&rdquo;). The Platform may be accessible via multiple websites or applications, including without limitation www.mindcanopy.in and any related mobile applications.
              </P>
              <P>
                By accessing or using the Platform, you (the &ldquo;User&rdquo;, &ldquo;Client&rdquo;, &ldquo;you&rdquo;, or &ldquo;your&rdquo;) are entering into this Agreement with the Company. You should read this Agreement carefully before beginning to use the Platform. If you do not agree to be bound by any term of this Agreement, you must not access or use the Platform.
              </P>
              <div className="bg-[#7EC0B7]/10 border border-[#7EC0B7]/30 rounded-xl px-4 py-3 my-4">
                <p className="text-sm text-[#233551] leading-relaxed">
                  <span className="font-bold">IMPORTANT NOTICE:</span> THIS AGREEMENT IS SUBJECT TO DISPUTE RESOLUTION BY ARBITRATION UNDER THE ARBITRATION AND CONCILIATION ACT, 1996, AS DETAILED IN SECTION 7, SUBJECT TO YOUR RIGHTS AS A CONSUMER UNDER THE CONSUMER PROTECTION ACT, 2019. PLEASE ALSO NOTE THAT THE TELEHEALTH INFORMED CONSENT IS DETAILED IN SECTION 10.
                </p>
              </div>
              <P>
                This Agreement is intended to comply with applicable Indian law, including the Indian Contract Act, 1872; the Information Technology Act, 2000 and the rules made thereunder; the Consumer Protection Act, 2019 and the Consumer Protection (E-Commerce) Rules, 2020; the Digital Personal Data Protection Act, 2023 (&ldquo;DPDP Act&rdquo;); the Mental Healthcare Act, 2017; the Rehabilitation Council of India Act, 1992; the Protection of Children from Sexual Offences Act, 2012; and the Juvenile Justice (Care and Protection of Children) Act, 2015.
              </P>
              <P>
                <span className="font-semibold text-[#233551]">Eligibility.</span> The Platform is intended for adults (eighteen (18) years and above) and teenagers aged thirteen (13) to nineteen (19) years. Teenagers below eighteen (18) years may use the Platform only where permitted by applicable law and with the knowledge and, where required, consent or involvement of a parent or legal guardian, as further set out in Sections 10.5 and 11.1.
              </P>

              <H2>2. The Therapists and Therapist Services</H2>
              <P>
                The Platform may be used to connect you with a mental health professional, variously credentialled and experienced (each, a &ldquo;Therapist&rdquo;) who will provide talk therapy and counselling services to you through the Platform (&ldquo;Therapist Services&rdquo;).
              </P>

              <H3>For Indian-based Therapists</H3>
              <P>
                We require every Therapist based in India and providing Therapist Services on the Platform to hold one or more of the following credentials, as applicable to their professional title:
              </P>
              <Bullets items={[
                <><span className="font-semibold text-[#233551]">(a)</span> An M.Phil. in Clinical Psychology recognised by the Rehabilitation Council of India, together with current registration with the Rehabilitation Council of India under the Rehabilitation Council of India Act, 1992 (&ldquo;Clinical Psychologist&rdquo;);</>,
                <><span className="font-semibold text-[#233551]">(b)</span> A Master&rsquo;s degree (M.A. or M.Sc.) in Psychology, Counselling Psychology, Applied Psychology, or a closely related discipline from a recognised Indian university, together with supervised practical experience (&ldquo;Counsellor&rdquo; or &ldquo;Therapist&rdquo;);</>,
                <><span className="font-semibold text-[#233551]">(c)</span> A Master&rsquo;s degree in Social Work (MSW) with a specialisation in psychiatric or medical social work, together with at least three (3) years of supervised practice (&ldquo;Psychiatric Social Worker&rdquo;); or</>,
                <><span className="font-semibold text-[#233551]">(d)</span> Such registration as may be required under the National Commission for Allied and Healthcare Professions Act, 2021, as and when such registration becomes mandatory for the relevant profession.</>,
              ]} />
              <P>
                In each case, Indian-based Therapists must have at least three (3) years of professional experience and not less than one thousand (1,000) hours of supervised practice. Indian-based Therapists are responsible for maintaining the registration and credentials applicable to their professional title throughout their engagement with the Platform.
              </P>

              <H3>For Non-Indian based Therapists</H3>
              <P>
                We require every Therapist based outside India and providing Therapist Services on the Platform to be registered, trained, and credentialled in their country of practice as a counsellor, psychologist, social worker, marriage and family therapist, or therapist. Non-Indian Therapists must have a relevant post-graduate academic degree in their field, at least three (3) years of experience, and must be qualified and credentialled by their respective professional regulatory body after successfully completing the necessary education, examinations, training, and practice requirements as applicable in their country.
              </P>
              <P>
                For the avoidance of doubt: titles such as &ldquo;Clinical Psychologist&rdquo;, &ldquo;Psychiatrist&rdquo;, and &ldquo;Rehabilitation Psychologist&rdquo; are reserved under Indian law for persons registered with the Rehabilitation Council of India or the National Medical Commission, as applicable. Non-Indian Therapists who do not hold such Indian registration will not be referred to or marketed using these protected titles on the Platform. Non-Indian Therapists will be referred to as &ldquo;Therapist&rdquo;, &ldquo;Counsellor&rdquo;, or &ldquo;Psychotherapist&rdquo;, together with their country of credentialling and credential type.
              </P>
              <P>
                Non-Indian Therapists are subject to the professional and regulatory framework of their primary country of practice. Your rights as a consumer and data principal in relation to the Platform and to MINDCANOPY SERVICES LLP are governed by Indian law as described in this Agreement and our Privacy Policy.
              </P>

              <H3>Therapist Services</H3>
              <P>
                The Therapists are independent professionals who are neither our employees nor our agents nor our representatives. The Platform&rsquo;s role is to operate the Platform and facilitate the Therapist Services by providing the necessary technical and administrative support. The Company does not directly provide therapy services, does not operate a Mental Health Establishment under the Mental Healthcare Act, 2017, and is not a healthcare provider. The Therapists are themselves responsible for the performance of the Therapist Services and remain fully independent when performing them. If you feel the Therapist Services provided by your assigned Therapist do not fit your needs or expectations, you may request a change to a different Therapist who provides services through the Platform.
              </P>
              <P>
                Because of credentialling and licensing requirements that differ from jurisdiction to jurisdiction, not all Therapists available on our database will be available for you to match with at all times. If a Therapist you have been connected with stops providing services through the Platform, we will notify you and provide an opportunity to match with a new Therapist.
              </P>
              <P>
                While we hope the Therapist Services are beneficial to you, you understand, agree, and acknowledge that they may not be the appropriate solution for everyone&rsquo;s needs and may not be appropriate for every situation. The Therapist Services are not a substitute for in-person mental healthcare where such care is required, including but not limited to: active withdrawal from substances; severe eating disorders requiring medical management; acute psychosis; active suicidal crisis; or any condition requiring psychiatric medication, hospitalisation, or in-person evaluation.
              </P>

              <div className="bg-[#E8926A]/10 border border-[#E8926A]/40 rounded-xl px-5 py-5 my-6">
                <p className="text-sm text-[#233551] leading-relaxed font-semibold mb-3">
                  IF YOU ARE THINKING ABOUT SUICIDE OR IF YOU ARE CONSIDERING HARMING YOURSELF OR OTHERS OR IF YOU FEEL THAT ANY OTHER PERSON MAY BE IN ANY DANGER OR IF YOU HAVE ANY MEDICAL EMERGENCY, YOU MUST IMMEDIATELY CALL EMERGENCY SERVICES BY DIALLING 112, OR CONTACT A CRISIS HELPLINE SUCH AS:
                </p>
                <ul className="space-y-1.5 text-sm text-[#233551]">
                  <li>• <span className="font-semibold">iCall:</span> 9152987821</li>
                  <li>• <span className="font-semibold">Vandrevala Foundation Helpline:</span> 1860-2662-345 / 1800-2333-330</li>
                  <li>• <span className="font-semibold">AASRA:</span> 9820466726</li>
                  <li>• <span className="font-semibold">NIMHANS Helpline:</span> 080-46110007</li>
                </ul>
              </div>

              <P>
                THE PLATFORM IS NOT DESIGNED FOR USE IN THE AFOREMENTIONED CASES AND THE THERAPISTS CANNOT PROVIDE THE ASSISTANCE REQUIRED IN ANY OF THE AFOREMENTIONED CASES. IF YOU PROCEED TO USE THE PLATFORM NOTWITHSTANDING THIS NOTICE, YOU DO SO ENTIRELY AT YOUR OWN RISK.
              </P>
              <P>
                THE PLATFORM IS NOT INTENDED FOR THE PROVISION OF CLINICAL DIAGNOSIS REQUIRING AN IN-PERSON EVALUATION AND YOU SHOULD NOT USE IT IF YOU NEED ANY OFFICIAL DOCUMENTATION OR APPROVALS FOR PURPOSES SUCH AS, BUT NOT LIMITED TO, COURT-ORDERED THERAPY, FITNESS CERTIFICATES, OR INSURANCE CLAIM SUBSTANTIATION. IT IS NOT INTENDED FOR ANY INFORMATION REGARDING WHICH MEDICINES OR MEDICAL TREATMENT MAY BE APPROPRIATE FOR YOU. THERAPISTS ON THE PLATFORM DO NOT PRESCRIBE MEDICATION AND CANNOT ISSUE PRESCRIPTIONS.
              </P>
              <P>
                DO NOT DISREGARD, AVOID, OR DELAY OBTAINING IN-PERSON CARE FROM YOUR DOCTOR, PSYCHIATRIST, OR OTHER QUALIFIED PROFESSIONAL BECAUSE OF INFORMATION OR ADVICE YOU RECEIVED THROUGH THE PLATFORM.
              </P>

              <H3>Therapy Services in India</H3>
              <P>
                The Therapist Services provided through the Platform are not reimbursable under any government health scheme or insurance programme operated by the Government of India or any State Government, and are not covered under the Ayushman Bharat or similar public health schemes. The Therapist Services may or may not be reimbursable under private health insurance policies, depending entirely on the terms and conditions of your individual policy.
              </P>
              <P>
                The Therapists on the Platform are not medical professionals (unless separately so qualified and disclosed). They do not perform psychiatric diagnosis, do not prescribe medication, and do not provide medical or psychiatric advice. The Platform does not constitute the practice of medicine, psychiatry, or any service requiring registration as a Mental Health Establishment under Section 65 of the Mental Healthcare Act, 2017.
              </P>

              <H2>3. Privacy and Security</H2>
              <P>
                Protecting and safeguarding any information you provide through the Platform is extremely important to us. Information about our security and privacy practices, our compliance with the Digital Personal Data Protection Act, 2023 (&ldquo;DPDP Act&rdquo;) and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011 (&ldquo;SPDI Rules&rdquo;), can be found in our Privacy Policy available at{' '}
                <a href="/privacy" className="text-[#3D8A80] hover:text-[#233551] underline underline-offset-2 font-semibold">
                  www.mindcanopy.in/privacy
                </a>{' '}
                (the &ldquo;Privacy Policy&rdquo;).
              </P>
              <P>
                BY AGREEING TO THIS AGREEMENT AND/OR BY USING THE PLATFORM, YOU ARE ALSO AGREEING TO THE TERMS OF THE PRIVACY POLICY. THE PRIVACY POLICY IS INCORPORATED INTO AND DEEMED A PART OF THIS AGREEMENT. THE SAME RULES THAT APPLY REGARDING CHANGES AND REVISIONS OF THIS AGREEMENT ALSO APPLY TO CHANGES AND REVISIONS OF THE PRIVACY POLICY.
              </P>
              <P>
                You acknowledge that information you share through the Platform — including information shared during therapy sessions and through messaging — constitutes &ldquo;Sensitive Personal Data or Information&rdquo; under the SPDI Rules and is treated as such under the DPDP Act. You consent to the processing of such data by the Company and your assigned Therapist for the purposes of providing the Therapist Services, in accordance with the Privacy Policy.
              </P>
              <P>
                Where the Platform engages Non-Indian Therapists, your data may be processed by such Therapists outside India. You hereby grant explicit consent for such cross-border processing of your personal data in accordance with the DPDP Act and our Privacy Policy. You may withdraw this consent at any time by writing to{' '}
                <a href="mailto:support@mindcanopy.in" className="text-[#3D8A80] hover:text-[#233551] underline underline-offset-2 font-semibold">
                  support@mindcanopy.in
                </a>
                , in which case you will be matched only with Indian-based Therapists going forward.
              </P>

              <H2>4. Intellectual Property</H2>
              <Pending>
                All content on the Platform — including text, graphics, logos, software, and trademarks — is owned by or licensed to MINDCANOPY SERVICES LLP. Full clause text to be finalised; nothing in this Agreement grants you any right to reproduce, redistribute, or create derivative works from any part of the Platform without our prior written consent.
              </Pending>

              <H2>5. Third Party Content</H2>
              <Pending>
                The Platform may display content, links, or services provided by third parties. The Company does not endorse and is not responsible for any third-party content or services. Full clause text to be finalised.
              </Pending>

              <H2>6. Disclaimer of Warranty and Limitation of Liability</H2>
              <Pending>
                The Platform is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. To the maximum extent permitted under Indian law, the Company disclaims all warranties and limits its liability for indirect, incidental, or consequential damages arising from your use of the Platform. Full clause text to be finalised.
              </Pending>

              <H2>7. Dispute Resolution and Arbitration</H2>
              <Pending>
                Disputes arising out of or in connection with this Agreement shall be resolved by arbitration in accordance with the Arbitration and Conciliation Act, 1996, subject to your rights as a consumer under the Consumer Protection Act, 2019. The seat and venue of arbitration shall be Bengaluru, Karnataka. Full Sections 7.1 and 7.3 onwards to be finalised.
              </Pending>

              <H3>7.2 Pre-Arbitration Dispute Resolution</H3>
              <P>
                Before initiating arbitration, you and the Company shall first attempt to resolve any Dispute informally for a period of thirty (30) days, unless this period is mutually extended by the Parties. The informal negotiation period begins upon receipt of written notice from one Party to the other (the &ldquo;Notice of Dispute&rdquo;). The Notice of Dispute must:
              </P>
              <Bullets items={[
                '(i) include the full name and contact information of the complaining Party;',
                '(ii) describe the nature and basis of the Dispute; and',
                '(iii) set out the specific relief sought.',
              ]} />
              <P>
                The Company will send its Notice of Dispute to your registered email address. You shall send your Notice of Dispute to{' '}
                <a href="mailto:support@mindcanopy.in" className="text-[#3D8A80] hover:text-[#233551] underline underline-offset-2 font-semibold">
                  support@mindcanopy.in
                </a>{' '}
                or by post to MINDCANOPY SERVICES LLP at the registered office address set out in Section 16.
              </P>

              <H2>8. Your Subscription</H2>
              <Pending>
                Subscriptions are billed in advance on the cadence you select (weekly or monthly). Cancellation, renewal, and refund terms, including the non-refundable nature of subscription fees save where required by law, will be set out in full in Sections 8.1–8.7. Full clause text to be finalised.
              </Pending>

              <H2>9. Consent to Receive Electronic Communications</H2>
              <Pending>
                By using the Platform, you consent to receive electronic communications from the Company, including service notifications, session reminders, and policy updates, in the manner set out in Section 14. Full clause text to be finalised.
              </Pending>

              <H2>10. Telehealth Informed Consent</H2>
              <Pending>
                Sections 10.1–10.4 set out the nature of telehealth services, the risks and benefits of receiving therapy over a digital platform, the steps the Company and Therapists take to protect confidentiality, and your acknowledgement that you have provided informed consent to receive Therapist Services via telehealth. Full clause text to be finalised.
              </Pending>

              <H3>10.5 Minors</H3>
              <P>
                Where the Client receiving Therapist Services is a minor (a person under the age of eighteen years), the Telehealth Informed Consent must be provided by the minor&rsquo;s parent or legal guardian in accordance with the requirements of the Mental Healthcare Act, 2017 and Section 9 of the DPDP Act (in respect of processing of personal data of a child). Such parent or guardian shall execute a separate Minor Consent Form before the first session.
              </P>

              <H2>11. Your Account, Representations, Conduct and Commitments</H2>
              <Pending>
                Sections 11.1–11.6 set out your obligations regarding account security, accurate information, lawful use of the Platform, parental consent for minors, and your representations and warranties to the Company. Full clause text to be finalised.
              </Pending>

              <H2>12. Modifications, Termination, Interruption and Disruptions to the Platform</H2>
              <Pending>
                Sets out the Company&rsquo;s right to modify, suspend, or terminate the Platform or any portion of it, the consequences of termination, and the handling of subscription credits in such circumstances. Full clause text to be finalised.
              </Pending>

              <H2>13. Compliance with Indian Law</H2>
              <Pending>
                Confirms that the Company operates the Platform in compliance with applicable Indian law, including the Information Technology Act, 2000, the DPDP Act, and the Consumer Protection Act, 2019. Full clause text to be finalised.
              </Pending>

              <H2>14. Notices and Grievances</H2>
              <P>
                We may provide notices or other communications to you regarding this Agreement or any aspect of the Platform by email to the email address we have on record, by SMS or push notification, or by posting them on the Platform. The date of dispatch shall be deemed the date on which such notice is given.
              </P>

              <H3>14.1 Contact for Notices, Grievances and Data Requests</H3>
              <P>
                For any notices, complaints, grievances, or requests relating to this Agreement, the Platform, or the processing of your personal data, you may write to:
              </P>
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 my-4">
                <p className="text-sm md:text-[15px] text-[#233551] leading-relaxed">
                  <span className="font-semibold">MINDCANOPY SERVICES LLP</span><br />
                  Bren Edgewaters, Bengaluru, Karnataka, India<br />
                  Email:{' '}
                  <a href="mailto:support@mindcanopy.in" className="text-[#3D8A80] hover:text-[#233551] underline underline-offset-2 font-semibold">
                    support@mindcanopy.in
                  </a>
                </p>
              </div>
              <P>
                We will acknowledge and address complaints within timelines prescribed under applicable law, including the DPDP Act and the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, as applicable to us. If your grievance is not adequately addressed, you may approach the appropriate Consumer Disputes Redressal Commission or the competent authority under the DPDP Act.
              </P>

              <H2>15. Contact and Complaints</H2>
              <P>
                For any general communications or complaints regarding the Platform or the Therapist Services, please contact us at{' '}
                <a href="mailto:support@mindcanopy.in" className="text-[#3D8A80] hover:text-[#233551] underline underline-offset-2 font-semibold">
                  support@mindcanopy.in
                </a>
                . You retain your right to file a complaint with the appropriate Consumer Disputes Redressal Commission under the Consumer Protection Act, 2019, or with any other competent authority, where applicable.
              </P>

              <H2>16. Important Notes about our Agreement</H2>

              <H3>16.1 Governing Law</H3>
              <P>
                This Agreement and any disputes arising out of or in connection with it shall be governed by and construed in accordance with the laws of India.
              </P>

              <H3>16.2 Jurisdiction</H3>
              <P>
                Subject to Section 7 (Dispute Resolution and Arbitration), the courts in Bengaluru, Karnataka, India shall have exclusive jurisdiction over any matter not subject to arbitration, without prejudice to your rights as a consumer to approach the appropriate Consumer Disputes Redressal Commission under the Consumer Protection Act, 2019.
              </P>

              <H3>16.3 Entire Agreement</H3>
              <P>
                This Agreement, together with the Privacy Policy, the Refund and Cancellation Policy, the Telehealth Informed Consent, and any other policies referenced herein, constitutes the entire agreement between you and the Company in relation to the subject matter. You confirm that you have not relied upon any promises or representations except as set forth in this Agreement.
              </P>

              <H3>16.4 Modifications to this Agreement</H3>
              <P>
                We may modify this Agreement by posting modifications on the Platform. Unless otherwise specified, all modifications shall be effective upon posting. We will use commercially reasonable efforts to notify you of material changes through email or in-app notice. You are encouraged to review this Agreement periodically. The &ldquo;Last Updated&rdquo; date at the bottom of this Agreement reflects the date of the most recent revision. By using the Platform after the changes become effective, you agree to be bound by the revised Agreement. If you do not agree to the changes, you must terminate your access to the Platform and discontinue use of its services.
              </P>

              <H3>16.5 Assignment</H3>
              <P>
                We may freely transfer or assign this Agreement or any of its obligations to any successor entity, affiliate, or in connection with a merger, acquisition, or sale of substantially all of our assets. You may not assign your rights or obligations under this Agreement without our prior written consent.
              </P>

              <H3>16.6 Headings</H3>
              <P>
                The paragraph headings in this Agreement are for convenience only and shall not be used in the interpretation of this Agreement.
              </P>

              <H3>16.7 Severability</H3>
              <P>
                If any provision of this Agreement is held by a court of competent jurisdiction or by an arbitrator to be illegal, invalid, unenforceable, or otherwise contrary to law, the remaining provisions of this Agreement shall remain in full force and effect.
              </P>

              <H3>16.8 Survival</H3>
              <P>
                All clauses regarding dispute resolution, limitations of liability, indemnification, confidentiality, and intellectual property shall survive the termination or expiration of this Agreement.
              </P>

              <H3>16.9 Waiver</H3>
              <P>
                No failure or delay by the Company in exercising any right, power, or remedy under this Agreement shall operate as a waiver of such right, power, or remedy.
              </P>

              {/* Footer block */}
              <div className="mt-14 pt-8 border-t border-slate-200">
                <p className="text-[#233551]/50 text-sm mb-3">
                  Last Updated: <strong>26 May 2026</strong>
                </p>
                <p className="text-sm md:text-[15px] text-[#233551] leading-relaxed">
                  <span className="font-semibold">MINDCANOPY SERVICES LLP</span><br />
                  LLPIN: [LLPIN]<br />
                  Bren Edgewaters<br />
                  Bengaluru, Karnataka, India<br />
                  www.mindcanopy.in
                </p>
              </div>

            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
