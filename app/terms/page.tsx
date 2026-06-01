import Navbar from '@/components/home/Navbar'
import Footer from '@/components/home/Footer'

export const metadata = {
  title: 'Terms and Conditions — MindCanopy',
  description: 'The terms that govern your use of MindCanopy, our online mental health platform.',
  alternates: { canonical: 'https://mindcanopy.in/terms' },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://mindcanopy.in/terms',
    title: 'Terms and Conditions — MindCanopy',
    description: 'The terms that govern your use of MindCanopy, our online mental health platform.',
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
              <P>
                The Platform, the website www.mindcanopy.in and its related applications (&ldquo;MindCanopy Intellectual Property&rdquo;), and all rights, title, and interest, including all related intellectual property rights therein, are owned by the Company, its licensors, or other providers of such material. These rights are protected under the Copyright Act, 1957, the Trade Marks Act, 1999, and other applicable Indian intellectual property laws. This Agreement is not a sale and does not convey or grant you any rights in or related to the Platform, or any intellectual property rights owned by the Company.
              </P>
              <P>
                &ldquo;MindCanopy&rdquo;, &ldquo;www.mindcanopy.in&rdquo;, and all related names, logos, product and service names, designs, and slogans (&ldquo;MindCanopy Marks&rdquo;) are trade marks or pending trade mark applications of the Company or its affiliates or licensors. You must not use the MindCanopy Marks without the prior written permission of the Company. All other names, logos, product and service names, designs, and slogans on the Platform and the website are the trade marks of their respective owners.
              </P>
              <P>
                Subject to your compliance with these Terms, the Company grants you a limited, non-exclusive, non-sublicensable, revocable, non-transferable licence to: (i) access and use the Platform solely in connection with your use of the Services on your personal device; and (ii) access and use any content, information, and related materials made available through the Services, in each case solely for your personal, non-commercial use. Any rights not expressly granted herein are reserved by the Company and its licensors.
              </P>

              <H2>5. Third Party Content</H2>
              <P>
                The Platform may contain content, products, or services offered or provided by third parties (&ldquo;Third Party Content&rdquo;), links to Third Party Content (including but not limited to links to other websites), or references to third-party services. We have no responsibility for the creation of any such Third Party Content, including but not limited to any related products, practices, terms, or policies, and we will not be liable for any damage or loss caused by any Third Party Content.
              </P>
              <P>
                The Platform integrates with third-party service providers in the course of providing the Therapist Services, including without limitation payment processors and communication infrastructure providers as listed in our Privacy Policy. Your use of these third-party services may also be subject to those third parties&rsquo; own terms and conditions, which you should review.
              </P>

              <H2>6. Disclaimer of Warranty and Limitation of Liability</H2>
              <P>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, AND SUBJECT TO YOUR MANDATORY RIGHTS UNDER THE CONSUMER PROTECTION ACT, 2019, YOU HEREBY RELEASE US AND AGREE TO HOLD US HARMLESS FROM ANY AND ALL CAUSES OF ACTION AND CLAIMS OF ANY NATURE RESULTING FROM THE THERAPIST SERVICES OR THE PLATFORM, INCLUDING (WITHOUT LIMITATION) ANY ACT, OMISSION, OPINION, RESPONSE, ADVICE, SUGGESTION, INFORMATION, OR SERVICE OF ANY THERAPIST AND/OR ANY OTHER CONTENT OR INFORMATION ACCESSIBLE THROUGH THE PLATFORM.
              </P>
              <P>
                YOU UNDERSTAND, AGREE, AND ACKNOWLEDGE THAT THE PLATFORM IS PROVIDED &ldquo;AS IS&rdquo; WITHOUT ANY EXPRESS OR IMPLIED WARRANTIES OF ANY KIND, INCLUDING BUT NOT LIMITED TO MERCHANTABILITY, NON-INFRINGEMENT, SECURITY, FITNESS FOR A PARTICULAR PURPOSE, OR ACCURACY. THE USE OF THE PLATFORM IS AT YOUR OWN RISK. TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, WE EXPRESSLY DISCLAIM ALL WARRANTIES OF ANY KIND, WHETHER EXPRESSED OR IMPLIED.
              </P>
              <P>
                YOU UNDERSTAND, AGREE, AND ACKNOWLEDGE THAT WE SHALL NOT BE LIABLE TO YOU OR TO ANY THIRD PARTY FOR ANY INDIRECT, INCIDENTAL, CONSEQUENTIAL, SPECIAL, PUNITIVE, OR EXEMPLARY DAMAGES.
              </P>
              <P>
                YOU UNDERSTAND, AGREE, AND ACKNOWLEDGE THAT OUR AGGREGATE LIABILITY FOR DAMAGES ARISING IN CONNECTION WITH THIS AGREEMENT AND ANY AND ALL USE OF THE PLATFORM WILL NOT EXCEED THE TOTAL AMOUNT OF MONEY PAID BY YOU OR ON YOUR BEHALF THROUGH THE PLATFORM IN THE TWELVE (12) MONTHS PRECEDING THE DATE OF THE CLAIM.
              </P>
              <P>
                Nothing in this Agreement shall limit or exclude any liability that cannot be limited or excluded under applicable Indian law, including but not limited to liability arising from gross negligence, fraud, or wilful misconduct, or any rights you may have as a consumer under the Consumer Protection Act, 2019.
              </P>
              <P>
                If the applicable law does not permit the limitation of liability as set forth above, the limitation will be deemed modified solely to the extent necessary to comply with applicable law. This Section 6 shall survive the termination or expiration of this Agreement.
              </P>

              <H2>7. Dispute Resolution and Arbitration</H2>
              <div className="bg-[#7EC0B7]/10 border border-[#7EC0B7]/30 rounded-xl px-4 py-3 my-4">
                <p className="text-sm text-[#233551] leading-relaxed">
                  THIS SECTION 7 OF THIS AGREEMENT SHALL BE REFERRED TO AS THE &ldquo;DISPUTE RESOLUTION AGREEMENT&rdquo;.
                </p>
              </div>
              <P>
                Subject to your statutory rights as a consumer under the Consumer Protection Act, 2019, you and the Company (collectively, the &ldquo;Parties&rdquo;) agree that any dispute, claim, or controversy (except those specifically exempted below) arising out of or relating to (i) this Agreement and prior versions of this Agreement, or concerning the existence, applicability, breach, termination, enforcement, interpretation, scope, waiver, or validity thereof; and (ii) the use of the Platform or Therapist Services (collectively, &ldquo;Disputes&rdquo;) will be resolved by binding arbitration in accordance with the provisions of this Section.
              </P>

              <H3>7.1 Preservation of Consumer Rights</H3>
              <P>
                Notwithstanding anything to the contrary in this Section, <span className="font-semibold text-[#233551]">if you are a &ldquo;consumer&rdquo; within the meaning of the Consumer Protection Act, 2019, you retain the right to approach the appropriate Consumer Disputes Redressal Commission (District, State, or National, as the case may be) in respect of any deficiency in service, unfair trade practice, or any other matter falling within the jurisdiction of such Commission.</span> This Agreement does not waive, limit, or exclude any rights you have as a consumer under the Consumer Protection Act, 2019 or any other applicable consumer protection law.
              </P>

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
              <P>
                All offers, promises, conduct, and statements, whether oral or written, made in the course of pre-arbitration negotiation by any of the Parties, their agents, employees, or counsel are confidential, privileged, and inadmissible for any purpose, including as evidence of liability, in any subsequent arbitration or proceeding.
              </P>

              <H3>7.3 Arbitration Procedure</H3>
              <P>
                If the Parties are unable to resolve the Dispute within thirty (30) days of the Notice of Dispute, either Party may refer the Dispute to arbitration in accordance with the following:
              </P>
              <Bullets items={[
                <><span className="font-semibold text-[#233551]">(a) Governing Law of Arbitration:</span> The arbitration shall be governed by the Arbitration and Conciliation Act, 1996, as amended from time to time.</>,
                <><span className="font-semibold text-[#233551]">(b) Number of Arbitrators:</span> The arbitration shall be conducted by a sole arbitrator mutually appointed by the Parties. If the Parties fail to agree on the appointment of the sole arbitrator within thirty (30) days, the sole arbitrator shall be appointed in accordance with Section 11 of the Arbitration and Conciliation Act, 1996.</>,
                <><span className="font-semibold text-[#233551]">(c) Seat and Venue:</span> The seat of arbitration shall be Bengaluru, Karnataka, India. The venue of arbitration may be physical or virtual, as the arbitrator may direct, having regard to the convenience of the Parties.</>,
                <><span className="font-semibold text-[#233551]">(d) Language:</span> The language of the arbitration shall be English.</>,
                <><span className="font-semibold text-[#233551]">(e) Confidentiality:</span> The arbitration proceedings, the award, and all documents and information exchanged in connection with the arbitration shall be kept strictly confidential by the Parties and the arbitrator, save where disclosure is required by law or for the enforcement of the award.</>,
                <><span className="font-semibold text-[#233551]">(f) Costs:</span> The arbitrator shall determine the allocation of costs of the arbitration, including the fees of the arbitrator and reasonable legal fees, between the Parties having regard to the conduct of the Parties and the merits of their claims.</>,
                <><span className="font-semibold text-[#233551]">(g) Award:</span> The award of the arbitrator shall be final and binding on the Parties, subject only to challenge under the Arbitration and Conciliation Act, 1996. The Parties shall comply with the award without undue delay.</>,
              ]} />

              <H3>7.4 Exceptions to Arbitration</H3>
              <P>
                Notwithstanding the foregoing, this Section 7 shall not require arbitration of the following claims:
              </P>
              <Bullets items={[
                '(i) consumer claims brought before the Consumer Disputes Redressal Commissions established under the Consumer Protection Act, 2019;',
                <>(ii) applications for interim or injunctive relief in a court of competent jurisdiction to prevent the actual or threatened infringement, misappropriation, or violation of a Party&rsquo;s copyrights, trade marks, trade secrets, patents, or other intellectual property rights;</>,
                '(iii) individual claims arising out of sexual harassment or sexual misconduct, which shall be governed by the Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013 and applicable criminal law; and',
                '(iv) any claim that may not be subject to arbitration under applicable Indian law.',
              ]} />

              <H3>7.5 Survival</H3>
              <P>
                This Section 7 (Dispute Resolution and Arbitration) shall survive after the termination or expiration of this Agreement.
              </P>

              <H2>8. Your Subscription</H2>
              <P>
                We offer different subscription options, with billing that may occur weekly, every four (4) weeks, monthly, or quarterly. Any subscription you choose will continue and automatically renew until you cancel it. By choosing a recurring subscription service, you acknowledge that such paid services have recurring payments, and you accept responsibility for all recurring charges prior to cancellation.
              </P>

              <H3>8.1 Charging and Billing Cycle</H3>
              <P>
                Once you provide complete payment information and complete the payment transaction, you will be charged for the subscription immediately. However, it may take some time before you are matched and can begin therapy with your Therapist. Your subscription and billing period will run from the date you are matched to a Therapist to ensure you are given the entire duration of that billing cycle to use the services. For example, if you pay on the 1st of a month and are matched with a Therapist on the 2nd, your four-week billing period will run from the 2nd onwards.
              </P>
              <P>
                All amounts payable under this Agreement are denominated in Indian Rupees (INR). Subscription fees are inclusive of all applicable taxes including the Goods and Services Tax (GST) levied under the Central Goods and Services Tax Act, 2017 and the relevant State Goods and Services Tax legislation, unless expressly stated otherwise. The Company shall issue a GST-compliant tax invoice on each successful charge.
              </P>

              <H3>8.2 Automatic Renewal and Cancellation</H3>
              <P>
                You may cancel your subscription at any time, for any reason, through your dashboard. Cancellation takes effect at the end of the current billing period. Your subscription must be cancelled before it renews in order to avoid the next billing cycle. Unless otherwise advised by the Company, any sessions (video, audio, or chat) accrued but unused within a billing cycle will not roll over or be eligible for use after that billing cycle concludes.
              </P>
              <P>
                For recurring payments processed through e-mandates, the Company shall comply with the Reserve Bank of India&rsquo;s framework on processing of e-mandates on recurring transactions, including pre-debit notifications and additional factor authentication where applicable.
              </P>

              <H3>8.3 Refunds</H3>
              <P>
                Refund eligibility shall be governed by our Refund and Cancellation Policy available at www.mindcanopy.in/refund-policy, which is incorporated into and deemed a part of this Agreement. Notwithstanding anything to the contrary, you shall be entitled to refunds in such circumstances as required under the Consumer Protection Act, 2019 and the Consumer Protection (E-Commerce) Rules, 2020.
              </P>

              <H3>8.4 Price Changes</H3>
              <P>
                We reserve the right to change our subscription offerings or adjust prices of our services. Any changes to your subscription will only take effect following at least thirty (30) days&rsquo; prior notice to you. You will have the opportunity to cancel your subscription before any such change takes effect.
              </P>

              <H3>8.5 Free Introductory Chat</H3>
              <P>
                We may offer a free fifteen (15) minute introductory chat with a Therapist before you commit to a paid subscription. Once the free introductory chat concludes, no paid subscription will commence unless you affirmatively elect to subscribe and provide payment.
              </P>

              <H3>8.6 Session Cancellation Policy</H3>
              <P>
                Late cancellations (within twenty-four (24) hours of the scheduled session time) and missed sessions may impact your Therapist&rsquo;s availability and earnings. Repeated late cancellations or no-shows may result in a charge as set out in our Refund and Cancellation Policy. Timely cancellations help your Therapist utilise open slots for other clients seeking help.
              </P>

              <H3>8.7 Therapist Matching</H3>
              <P>
                How you are matched with a Therapist depends on a number of factors. As a threshold matter, we require every Therapist to be credentialled and experienced in accordance with Section 2. Matches are based on your intake questionnaire responses, Therapist availability and capacity, Therapist specialisation, language preferences, and other factors considered relevant to a sustained and productive therapeutic relationship.
              </P>

              <H2>9. Consent to Receive Electronic Communications</H2>
              <P>
                You agree that MindCanopy and/or the Therapists may contact you regarding the Therapist Services or any related services you enquire about through our website or mobile application. You consent to receive such communications electronically, including session reminders, confirmation emails, scheduling enquiries, service updates, updates to these Terms and Conditions, the Privacy Policy, or any other policies.
              </P>
              <P>
                When providing us with your email address and phone number, you represent that they are accurate and current. You consent to receive text messages (SMS), WhatsApp messages, push notifications, and emails relating to the services you have signed up for, at the contact information you have provided.
              </P>
              <P>
                Such communications are sent in accordance with the Information Technology Act, 2000 and, in respect of any commercial communications by SMS, in accordance with the Telecom Regulatory Authority of India&rsquo;s framework on Unsolicited Commercial Communications and the Telecom Commercial Communications Customer Preference Regulations, 2018.
              </P>
              <P>
                Your consent to conduct interactions electronically covers all interactions between you and MindCanopy. If you later decide that you do not want to receive certain future communications electronically, please contact us via the contact information set out in Section 14. You may also opt out of certain electronic communications through your account settings or by following the unsubscribe instructions in any communication you receive from us. Your withdrawal of consent will be effective within a reasonable time after we receive your withdrawal notice.
              </P>
              <P>
                MindCanopy or the Therapists may need to send you certain communications electronically regarding the Therapist Services from which you may not opt out without discontinuing the Services. These include notifications of updates to these Terms and Conditions, billing-related information, and crisis-related safety communications. Your withdrawal of consent will not affect the legal validity or enforceability of these Terms and Conditions. If you withdraw your consent to receive communications electronically, certain Services may become unavailable to you.
              </P>

              <H2>10. Telehealth Informed Consent</H2>
              <P>
                By using the Platform, you provide your informed consent to receive Therapist Services remotely through electronic communications, including via online messaging, chat, audio, or video as applicable (&ldquo;Telehealth&rdquo;). You consent to other aspects of Telehealth including, but not limited to, electronic transmission of your therapy-related personal data and any other Sensitive Personal Data or Information.
              </P>

              <H3>10.1 Understanding of Telehealth</H3>
              <P>You understand that:</P>
              <Bullets items={[
                '(a) Telehealth involves the delivery of therapy services via electronic communication and may not be appropriate for every situation;',
                <>(b) there are inherent risks and benefits to Telehealth, including potential interruptions to service, technical failures, and limitations on a Therapist&rsquo;s ability to observe non-verbal cues fully;</>,
                '(c) Telehealth services are not a substitute for in-person mental healthcare where such care is required;',
                '(d) in the event of a technical failure, your Therapist will attempt to reconnect with you and, if not possible, will reschedule your session; and',
                '(e) your Therapist may, at their professional discretion, refer you to in-person care or to a psychiatrist if your needs are beyond the scope of Telehealth services.',
              ]} />

              <H3>10.2 Location and Identity Verification</H3>
              <P>
                Before participating in each session, if required by the Company or your Therapist, you agree to accurately verify your identity and disclose your physical location. This is necessary because applicable laws and emergency response procedures vary by jurisdiction.
              </P>

              <H3>10.3 Limits of Confidentiality</H3>
              <P>
                You understand and agree that, while your Therapist will maintain strict confidentiality of your communications, there are circumstances in which your Therapist may be required by law to disclose information without your consent, including but not limited to:
              </P>
              <Bullets items={[
                '(a) where there is a credible risk of imminent harm to yourself or to others;',
                '(b) where the Therapist becomes aware of an offence against a child, in which case mandatory reporting under Section 19 of the Protection of Children from Sexual Offences Act, 2012 applies;',
                '(c) where reporting is required under the Juvenile Justice (Care and Protection of Children) Act, 2015;',
                '(d) where disclosure is required under the Mental Healthcare Act, 2017, including but not limited to circumstances involving the safe handling of a person with mental illness;',
                '(e) pursuant to a lawful order of a court or competent authority; and',
                '(f) where disclosure is required for the prevention or investigation of an offence.',
              ]} />
              <P>
                You acknowledge that you have been informed of these limits and consent to such disclosures where required by law.
              </P>

              <H3>10.4 Withdrawal of Telehealth Consent</H3>
              <P>
                You may withdraw your consent to Telehealth at any time without affecting your right to seek future care. Please note, your Therapist may have additional consents or documentation for you to complete prior to commencing services.
              </P>

              <H3>10.5 Minors</H3>
              <P>
                Where the Client receiving Therapist Services is a minor (a person under the age of eighteen years), the Telehealth Informed Consent must be provided by the minor&rsquo;s parent or legal guardian in accordance with the requirements of the Mental Healthcare Act, 2017 and Section 9 of the DPDP Act (in respect of processing of personal data of a child). Such parent or guardian shall execute a separate Minor Consent Form before the first session.
              </P>

              <H2>11. Your Account, Representations, Conduct and Commitments</H2>
              <P>
                You hereby confirm that you are legally able to consent to receive Therapist Services or have the consent of a parent or legal guardian, and are legally able to enter into a binding contract under Section 11 of the Indian Contract Act, 1872. Generally, only persons of the age of majority (eighteen years and above), of sound mind, and not disqualified from contracting by any law to which they are subject, may enter into this Agreement.
              </P>

              <H3>11.1 Minor Consent</H3>
              <P>
                Where consent from a parent or legal guardian is required for a minor to receive Therapist Services, you hereby confirm that, as the consenting parent or legal guardian, you have the legal right to consent to Therapist Services on behalf of the minor in your sole or joint capacity. You provide affirmative consent on behalf of the minor to the provisions set out in the accompanying Privacy Policy regarding the collection, processing, and use of the minor&rsquo;s personal data, including any &ldquo;sensitive personal data&rdquo; as defined under the SPDI Rules and any data relating to a &ldquo;child&rdquo; as defined under the DPDP Act. You agree that consent to Therapist Services on behalf of the minor remains valid until withdrawn in writing or until the subscription is cancelled.
              </P>

              <H3>11.2 Accuracy of Information</H3>
              <P>
                You confirm and agree that all information you have provided in or through the Platform, and all information you will provide in or through the Platform in the future, is accurate, true, current, and complete. You agree to maintain and update this information so it remains accurate, current, and complete.
              </P>

              <H3>11.3 Account Security</H3>
              <P>
                You acknowledge that you are responsible for maintaining the confidentiality of your password and any other security information related to your account (collectively, &ldquo;Account Access&rdquo;). We advise you to change your password frequently and to take all reasonable steps to safeguard your password.
              </P>
              <P>
                You agree to notify us immediately of any unauthorised use of your Account Access or any other concern about the security of your account.
              </P>
              <P>
                You acknowledge that we will not be liable for any loss or damage incurred as a result of someone else using your account, whether with or without your consent or knowledge. You acknowledge that you are solely and fully liable and responsible for all activities performed using your Account Access. You agree to indemnify us for any damage or loss incurred as a result of the use of your Account Access by any person, whether authorised by you or not.
              </P>
              <P>
                You agree not to use the account or Account Access of any other person for any reason. You confirm that your use of the Platform, including the Therapist Services, is for your own personal use and that you are not using the Platform or the Therapist Services for or on behalf of any other person or organisation, except in the case of a parent or guardian acting on behalf of a minor as set out above.
              </P>

              <H3>11.4 Prohibited Conduct</H3>
              <P>You agree not to:</P>
              <Bullets items={[
                '(a) interfere with or disrupt, or attempt to interfere with or disrupt, any of our systems, services, servers, networks, or infrastructure, including obtaining unauthorised access to any of the foregoing;',
                <>(b) use the Platform for the posting, sending, or delivering of: (i) unsolicited email or advertisement or promotion of goods and services; (ii) malicious software or code; (iii) unlawful, harassing, privacy-invading, abusive, threatening, vulgar, obscene, racist, casteist, or otherwise harmful content; (iv) any content that infringes a third party&rsquo;s rights, including intellectual property rights; or (v) any content that constitutes, causes, or encourages a criminal offence or violates any applicable law, including under the Bharatiya Nyaya Sanhita, 2023 or the Information Technology Act, 2000;</>,
                '(c) violate any applicable local, state, national, or international law, statute, ordinance, rule, regulation, or ethical code in relation to your use of the Platform and your relationship with the Therapists and us;',
                '(d) make any audio or video recording, transcript, screenshot, or other capture of any therapy session or chat communication without the express prior written consent of the Company and your Therapist; or',
                '(e) impersonate any person or misrepresent your identity, age, or affiliation with any person or entity.',
              ]} />
              <P>
                If you receive any file from us or from a Therapist, whether through the Platform or otherwise, you agree to scan this file for any virus or malicious software prior to opening or using the file.
              </P>

              <H3>11.5 Indemnification</H3>
              <P>
                You will indemnify, defend, and hold harmless the Company and its officers, employees, designated partners, agents, and contractors from and against any and all claims, losses, causes of action, demands, liabilities, costs, or expenses (including reasonable legal fees and expenses) arising out of or relating to: (a) your access to or use of the Platform; (b) any actions made with your account or Account Access, whether by you or by someone else; (c) your violation of any provision of this Agreement; (d) non-payment for any of the services (including Therapist Services) provided through the Platform; or (e) your violation of any third-party right, including any intellectual property right, publicity, confidentiality, property, or privacy right. This clause shall survive the expiration or termination of this Agreement.
              </P>

              <H3>11.6 Payment Information</H3>
              <P>
                You confirm that you will use only credit cards, debit cards, UPI, net banking, or other payment means (&ldquo;Payment Means&rdquo;) that you are duly and fully authorised to use, and that all payment-related information you have provided or will provide is accurate, current, and correct. By providing us with your Payment Means, you authorise us to bill and charge you through that Payment Means in accordance with this Agreement and the Reserve Bank of India&rsquo;s regulations on electronic payments and e-mandates.
              </P>

              <H2>12. Modifications, Termination, Interruption and Disruptions to the Platform</H2>
              <P>
                You understand, agree, and acknowledge that we may modify, suspend, disrupt, or discontinue the Platform, any part of the Platform, or your use of the Platform — whether to all clients or to you specifically — at any time with or without notice. You agree and acknowledge that we will not be liable for any losses or damages caused by any of the aforementioned actions, save where such liability cannot be excluded by law.
              </P>
              <P>
                The Platform depends on various factors such as software, hardware, and tools, either our own or those owned and operated by our contractors and suppliers. While we make commercially reasonable efforts to ensure the Platform&rsquo;s reliability and accessibility, you understand and agree that no platform can be one hundred percent (100%) reliable and accessible. We cannot guarantee that access to the Platform will be uninterrupted, consistent, timely, or error-free at all times.
              </P>
              <P>
                We may terminate your access to the Platform if you breach any provision of this Agreement, including non-payment of subscription fees. Termination by us shall not affect any rights or remedies that have accrued prior to termination.
              </P>

              <H2>13. Compliance with Indian Law</H2>
              <P>You represent and warrant that:</P>
              <Bullets items={[
                '(a) you are not a person resident in any jurisdiction in respect of which India has imposed restrictions on financial or service transactions, including persons designated under any sanctions list maintained by the Ministry of External Affairs, Government of India, pursuant to its obligations under United Nations Security Council resolutions and the Unlawful Activities (Prevention) Act, 1967;',
                '(b) your use of the Platform does not violate any applicable laws relating to anti-money laundering, including the Prevention of Money Laundering Act, 2002;',
                '(c) you will comply with the Foreign Exchange Management Act, 1999 in respect of any payments you make to or receive from the Company, where applicable; and',
                '(d) you will not use the Platform for any unlawful purpose or in furtherance of any criminal activity.',
              ]} />

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
