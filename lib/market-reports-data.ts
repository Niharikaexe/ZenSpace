export type Source = {
  title: string
  org: string
  href: string
  year: string
}

export type KeyStat = {
  figure: string
  label: string
  source: string
}

export type Finding = {
  heading: string
  body: string
  stat?: string
  statLabel?: string
}

export type DeepDiveReport = {
  slug: string
  title: string
  subtitle: string
  section: "national" | "workplace" | "regional"
  sectionLabel: string
  publishedAt: string
  intro: string
  keyStats: KeyStat[]
  findings: Finding[]
  whyThisHappens: { heading: string; body: string }[]
  implications: string
  sources: Source[]
}

// ─── NATIONAL PICTURE ────────────────────────────────────────────────────────

const treatmentGap: DeepDiveReport = {
  slug: "the-treatment-gap",
  title: "The Treatment Gap",
  subtitle: "Why 83% of Indians with mental illness never receive care",
  section: "national",
  sectionLabel: "National Picture",
  publishedAt: "2026-01-15",
  intro:
    "India has one of the largest mental health treatment gaps in the world. The distance between who needs care and who receives it is not a rounding error — it is the defining feature of India's mental health landscape. This report examines the scale, the causes, and what the data actually tells us about the path forward.",
  keyStats: [
    {
      figure: "197M",
      label: "Indians estimated to live with a mental health condition",
      source: "Lancet Psychiatry, 2017",
    },
    {
      figure: "83%",
      label: "Treatment gap — those who need care but receive none",
      source: "WHO Mental Health Atlas, 2020",
    },
    {
      figure: "0.3",
      label: "Psychiatrists per 100,000 people (WHO recommends minimum 3)",
      source: "National Mental Health Survey, 2016",
    },
    {
      figure: "5.7 yrs",
      label: "Median delay between first symptoms and first treatment for psychosis",
      source: "NMHS, 2016",
    },
    {
      figure: "₹2,443",
      label: "Annual per-capita mental health expenditure in India",
      source: "WHO, 2020",
    },
    {
      figure: "<1%",
      label: "Of India's total health budget allocated to mental health",
      source: "Ministry of Health & Family Welfare, 2021",
    },
  ],
  findings: [
    {
      heading: "The scale of unmet need is historically undercounted",
      body: "The 197 million figure from Lancet Psychiatry (2017) is considered a conservative estimate. The National Mental Health Survey (2016) found a current prevalence of mental morbidity of 10.6% in adults — applied to today's population, that exceeds 150 million adults. The WHO's World Mental Health Survey estimates lifetime prevalence of any mental disorder in India at 25.6%. Most of these individuals will never access formal care.",
      stat: "197M",
      statLabel: "minimum estimated cases",
    },
    {
      heading: "The psychiatric workforce is structurally insufficient",
      body: "India has approximately 9,000 psychiatrists for a population of 1.4 billion — a ratio of 0.3 per 100,000. The WHO recommends a minimum of 3 per 100,000. Clinical psychologists number around 2,000. Social workers trained in mental health are fewer than 5,000. At the current rate of training, India would need more than 80 years to reach WHO-recommended psychiatrist levels without population growth. Compounding this, over 70% of these professionals practice in the six largest metro cities.",
      stat: "9,000",
      statLabel: "psychiatrists for 1.4B people",
    },
    {
      heading: "Duration of untreated illness is measured in years, not weeks",
      body: "The NMHS (2016) found that the median duration of untreated illness (DUI) — the gap between symptom onset and first professional contact — is 5.7 years for psychosis, 3.4 years for anxiety disorders, and over 10 years for alcohol use disorders. For depression, nearly 70% of those who eventually seek care report symptoms for more than two years before doing so. Delayed treatment is not benign: every year of untreated illness is associated with worse long-term outcomes, greater disability, and higher treatment costs.",
      stat: "10+",
      statLabel: "years untreated for many conditions",
    },
    {
      heading: "The economic barrier is near-absolute for most of the population",
      body: "India's per-capita mental health expenditure of ₹2,443 per year sounds significant until you examine what it covers: primarily inpatient care for severe conditions. Outpatient psychotherapy is essentially unsubsidised. A single session with a private therapist costs ₹1,500–₹4,000 in urban India — 12–30% of a month's income for the median Indian worker (median monthly wage: approximately ₹10,000, ILO 2023). For informal sector workers, who represent 90% of the workforce, there is no employer-provided mental health coverage of any kind.",
      stat: "90%",
      statLabel: "of workforce has zero mental health coverage",
    },
    {
      heading: "Public mental health services are technically available but practically inaccessible",
      body: "Government hospital psychiatry departments charge nominal fees but operate at extreme capacity. A 2022 NIMHANS audit found average outpatient wait times of 4–8 hours, with consultation durations of 10–15 minutes. A psychiatrist in a busy government OPD may see 80–100 patients per day — making meaningful assessment and follow-up structurally impossible. The District Mental Health Programme (DMHP), designed to extend services to all districts, had functional services in only 40% of India's 743 districts as of 2022.",
      stat: "40%",
      statLabel: "of districts with functional DMHP services",
    },
    {
      heading: "Stigma quantifiably reduces help-seeking even when services exist",
      body: "A 2021 meta-analysis of Indian stigma research (published in the International Journal of Social Psychiatry) found that over 60% of Indians agreed with statements characterising mental illness as a sign of personal weakness. The same research found that perceived stigma — the expectation of being judged — reduced likelihood of help-seeking by 45% even among people who had already identified their distress. Self-stigma (internalising negative beliefs about one's own mental illness) was found in over 55% of help-seeking populations, further reducing treatment adherence once care begins.",
      stat: "45%",
      statLabel: "reduction in help-seeking due to stigma",
    },
  ],
  whyThisHappens: [
    {
      heading: "The specialist-dependency model was wrong from the start",
      body: "India's mental health system was architected around psychiatry — specialist medical care requiring years of postgraduate training. This model works in countries with adequate psychiatric supply. India never had that supply, and the gap has widened as population growth has outpaced workforce development. The design choice to treat mental health as a specialty rather than a primary health priority has produced a system that structurally cannot reach most of its population.",
    },
    {
      heading: "Budget allocation has not matched rhetoric",
      body: "The National Mental Health Policy (2014) and the Mental Healthcare Act (2017) both established strong principles. Implementation has been inadequate. Mental health's share of the health budget — already below 1% — has not materially increased. The National Mental Health Programme's allocated funds are regularly underspent because there is insufficient trained workforce to deploy them. States with the highest need often have the least capacity.",
    },
    {
      heading: "Cultural explanatory frameworks redirect care",
      body: "Mental distress in India is frequently understood through religious, supernatural, or somatic frameworks — karma, spirit possession, the evil eye, or physical ailments requiring Ayurvedic or homeopathic treatment. These are not irrational choices in the absence of accessible mental health infrastructure; they are what's available and culturally coherent. Families seek help from faith healers, local practitioners, and temples before — if ever — reaching a mental health professional. These explanatory frameworks are not primarily the problem; the absence of a credible, affordable alternative is.",
    },
  ],
  implications:
    "The treatment gap is a public health emergency that receives no emergency-level response. Online therapy — while not a substitute for a funded mental health system — materially changes the access equation for the portion of India's population with smartphones and the means to pay. Removing geographic barriers, reducing cost versus private in-person care, and providing anonymity all shift the calculus for people who would not seek in-person help. The gap between 197 million and the number currently in treatment is not going to close through psychiatrists alone.",
  sources: [
    {
      title: "National Mental Health Survey of India 2015–16",
      org: "NIMHANS / Ministry of Health & Family Welfare",
      href: "https://nimhans.ac.in/wp-content/uploads/2019/07/National-Mental-Health-Survey-2015-16-1.pdf",
      year: "2016",
    },
    {
      title: "The burden of mental disorders across the states of India",
      org: "The Lancet Psychiatry",
      href: "https://www.thelancet.com/journals/lanpsy/article/PIIS2215-0366(19)30475-4/fulltext",
      year: "2020",
    },
    {
      title: "Mental Health Atlas 2020",
      org: "World Health Organization",
      href: "https://www.who.int/publications/i/item/9789240036703",
      year: "2021",
    },
    {
      title: "Global, regional, and national incidence, prevalence, and years lived with disability for 354 diseases",
      org: "The Lancet (GBD 2017)",
      href: "https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(18)32279-7/fulltext",
      year: "2018",
    },
    {
      title: "Mental Health and Poverty in Developing Countries",
      org: "Social Science & Medicine",
      href: "https://www.sciencedirect.com",
      year: "2007",
    },
  ],
}

const suicideCrisis: DeepDiveReport = {
  slug: "suicide-in-india",
  title: "Suicide in India",
  subtitle: "What the official numbers miss — and what the research shows",
  section: "national",
  sectionLabel: "National Picture",
  publishedAt: "2026-01-22",
  intro:
    "India accounts for approximately 17% of global suicide deaths. The recorded numbers are likely an undercount. The patterns behind the data — by gender, region, method, and economic condition — reveal a crisis shaped by specific structural factors, most of which are policy-addressable. This report examines what the data shows and why it is underreported.",
  keyStats: [
    {
      figure: "164,033",
      label: "Recorded suicide deaths in India in 2021 — highest ever recorded",
      source: "NCRB, 2022",
    },
    {
      figure: "17%",
      label: "Share of global suicide deaths attributed to India",
      source: "WHO, 2021",
    },
    {
      figure: "14.7",
      label: "Female suicide rate per 100,000 — more than double the global average for women",
      source: "WHO Global Health Observatory",
    },
    {
      figure: "2–3×",
      label: "Estimated undercount factor — actual deaths believed to exceed official records",
      source: "The Lancet, 2012; Registrar General of India",
    },
    {
      figure: "10,881",
      label: "Farmer and agricultural labourer suicides recorded in 2021",
      source: "NCRB, 2022",
    },
    {
      figure: "2017",
      label: "Year suicide was decriminalised in India (Mental Healthcare Act)",
      source: "Ministry of Law and Justice",
    },
  ],
  findings: [
    {
      heading: "The official count is a systematic underestimate",
      body: "A landmark 2012 study published in The Lancet (Registrar General of India / CGHR) compared survey-based mortality data against NCRB official records and found that actual suicide deaths were 2.3–3.1 times higher than officially recorded. In 2010, the NCRB recorded approximately 134,000 suicides; the same study estimated the actual figure at 187,000–260,000. Causes of underreporting include: families citing stigma, insurance policy clauses that void payouts for suicide, lingering social and procedural consequences from the era when suicide was a criminal offence (prior to 2017), and limited forensic capacity in rural areas to distinguish suicide from accidental death.",
      stat: "2–3×",
      statLabel: "the real number vs. official count",
    },
    {
      heading: "Young adults and women are disproportionately affected",
      body: "Adults aged 18–45 account for the majority of suicide deaths in India. The 18–30 cohort is the single largest age group in NCRB data. India's female suicide rate (14.7 per 100,000) is among the highest in the world for women — more than double the global female average of approximately 6.1 per 100,000 (WHO). Research attributes the high female rate to domestic violence, limited economic autonomy, early marriage, and few socially acceptable pathways out of harmful domestic situations. In contrast, the global pattern shows male suicide rates typically exceeding female rates by 2–3 times; in India, the ratio is much closer.",
      stat: "14.7",
      statLabel: "female suicide rate per 100K",
    },
    {
      heading: "Method lethality is a policy-addressable factor",
      body: "In rural India, pesticide ingestion is the leading method of suicide — and one of the most lethal. WHO research estimates that up to 30% of global suicide deaths result from pesticide poisoning, with India and other South/Southeast Asian nations accounting for the majority. The lethality of pesticide ingestion means that impulsive acts — which might result in survivable attempts with less accessible means — are fatal. WHO has identified pesticide restriction as one of the highest-impact single interventions available globally. Sri Lanka's restrictions on highly toxic pesticides correlated with a 70% reduction in suicide rates over 20 years. India has moved slowly on this evidence.",
      stat: "30%",
      statLabel: "of global suicides involve pesticides",
    },
    {
      heading: "Farmer suicide is a distinct and documented sub-crisis",
      body: "India has recorded farmer suicides as a separate category since 1995. The NCRB recorded 10,881 farmer and agricultural labourer suicides in 2021. Research shows strong correlations with crop failure years, indebtedness (particularly to informal moneylenders at high interest rates), and commodity price volatility. Maharashtra, Karnataka, and Andhra Pradesh consistently account for the highest numbers. A 2021 EPW meta-analysis found that suicides peak in the months immediately following crop failure announcement or loan default notification. Crucially, farmers in distress rarely access mental health support — in affected regions, a single ASHA worker may cover populations of 1,000–1,500 with no mental health training.",
      stat: "10,881",
      statLabel: "farmer suicides recorded in 2021",
    },
    {
      heading: "The criminalisation legacy continues to shape behaviour",
      body: "Section 309 of the Indian Penal Code criminalised suicide attempts until its effective repeal through the Mental Healthcare Act 2017. For over 150 years, a person who survived a suicide attempt could be prosecuted. The psychological and social consequences of this legal framework — families concealing deaths, survivors afraid to seek care, medical staff uncertain of obligations — did not evaporate in 2017. Research on stigma persistence after decriminalisation in other jurisdictions consistently shows multi-decade effects. In India, the cultural memory of criminalisation continues to shape both family reporting behaviour and individual willingness to acknowledge suicidal ideation to health workers.",
      stat: "150+",
      statLabel: "years of criminalisation",
    },
    {
      heading: "The relationship between mental health treatment gap and suicide is not incidental",
      body: "An estimated 90% of suicide deaths globally occur in the context of a diagnosable mental health condition (WHO). In India, where 83% of people with mental illness receive no treatment, the mathematical relationship between the treatment gap and suicide mortality is direct. Research on gatekeeper training programs (MANAS trial, iCall, Vandrevala Foundation data) consistently shows that increasing access to basic psychosocial support in communities with high distress reduces suicidal ideation and attempts. The treatment gap is not a passive background condition — it is a contributing cause.",
      stat: "90%",
      statLabel: "of suicides involve untreated mental illness",
    },
  ],
  whyThisHappens: [
    {
      heading: "Legal frameworks created systematic incentives to conceal",
      body: "For 150 years, the criminal status of suicide attempts meant families had active legal and financial reasons to record deaths differently. Insurance policies, police involvement, and social consequences all created pressure toward misclassification. The 2017 Mental Healthcare Act removed the criminal sanction but could not immediately undo the institutional and cultural practices built around concealment. Civil registration of deaths — the mechanism by which cause of death is recorded — varies in quality across states and is near-absent in many rural areas.",
    },
    {
      heading: "Economic precarity amplifies psychological risk",
      body: "India's pattern of suicide differs from high-income countries in the prominence of economic stressors as proximate causes. NCRB data consistently shows 'family problems' and 'illness' as the top cited reasons — but these categories are broad and often include financial distress. Research on farmer suicides specifically identifies debt to informal moneylenders at interest rates of 24–60% per annum as a major structural factor. When economic catastrophe (crop failure, job loss, business failure) carries both material and social consequences — shame, family honour, perceived duty to provide — the psychological impact exceeds what the economic loss alone would predict.",
    },
    {
      heading: "Means restriction has proven impact but faces implementation resistance",
      body: "The evidence for pesticide restriction as a suicide prevention intervention is among the strongest in public health. Sri Lanka, Bangladesh, and South Korea all show significant reductions in suicide rates following restriction of highly toxic pesticides. In India, the Central Insecticide Board has moved to restrict certain highly toxic compounds, but enforcement is uneven and the agricultural lobby has historically resisted restrictions that reduce crop protection options for farmers. The tension between agricultural economics and public health policy has slowed implementation of a proven intervention.",
    },
  ],
  implications:
    "Suicide in India requires responses at multiple levels simultaneously: means restriction at the policy level, mental health workforce expansion at the system level, and accessible, low-stigma support at the individual level. Online therapy does not address the immediate crisis dimensions of suicide — but it is one of the few mechanisms that reaches working adults in distress before they reach crisis point. The evidence on stepped-care models consistently shows that earlier access to lower-intensity support reduces progression to severe states. Closing the treatment gap is, among other things, a suicide prevention strategy.",
  sources: [
    {
      title: "Accidental Deaths & Suicides in India 2021",
      org: "National Crime Records Bureau",
      href: "https://ncrb.gov.in/en/accidental-deaths-suicides-india-2021",
      year: "2022",
    },
    {
      title: "Suicide mortality in India: a nationally representative survey",
      org: "The Lancet",
      href: "https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(12)60606-0/fulltext",
      year: "2012",
    },
    {
      title: "Suicide worldwide in 2019",
      org: "World Health Organization",
      href: "https://www.who.int/publications/i/item/9789240026643",
      year: "2021",
    },
    {
      title: "Pesticides and prevention of suicide",
      org: "WHO Pesticides and Health Series",
      href: "https://www.who.int/publications/i/item/9789241565448",
      year: "2019",
    },
    {
      title: "Farmer suicides in India: magnitude, trends and spatial patterns",
      org: "Economic and Political Weekly",
      href: "https://www.epw.in",
      year: "2021",
    },
    {
      title: "Mental Healthcare Act, 2017",
      org: "Ministry of Law and Justice, India",
      href: "https://www.legislative.gov.in/sites/default/files/A2017-10.pdf",
      year: "2017",
    },
  ],
}

// ─── WORKPLACE ───────────────────────────────────────────────────────────────

const burnoutEconomy: DeepDiveReport = {
  slug: "the-burnout-economy",
  title: "The Burnout Economy",
  subtitle: "How Indian workplaces are producing exhaustion at scale",
  section: "workplace",
  sectionLabel: "Workplace Mental Health",
  publishedAt: "2026-02-05",
  intro:
    "Burnout is categorised by the WHO as an occupational phenomenon. It is not a personal failing or a productivity problem — it is the predictable output of specific working conditions sustained over time. India's professional culture has replicated and amplified several of the conditions most reliably associated with burnout. This report examines what the data shows about the Indian workplace's mental health cost.",
  keyStats: [
    {
      figure: "62%",
      label: "Indian professionals reporting significant work-related stress",
      source: "Deloitte India, 2022",
    },
    {
      figure: "43%",
      label: "Say work has negatively impacted their physical health in the past 12 months",
      source: "EY Work Reimagined Survey, 2022",
    },
    {
      figure: "48.7 hrs",
      label: "Average working week for Indian professionals — above the ILO's 48-hour maximum",
      source: "ILO ILOSTAT, 2022",
    },
    {
      figure: "38%",
      label: "Of Gen Z professionals in India describe themselves as 'frequently burned out'",
      source: "Deloitte Global, 2023",
    },
    {
      figure: "₹7.3L Cr",
      label: "Estimated annual productivity loss in India from depression and anxiety alone",
      source: "WHO (adapted), 2019",
    },
    {
      figure: "23%",
      label: "Of Indian organisations with any formal mental health policy",
      source: "CII / Deloitte, 2022",
    },
  ],
  findings: [
    {
      heading: "Working hours exceed safe thresholds for a majority of professionals",
      body: "The International Labour Organization's recommended maximum of 48 hours per week is a safety threshold, not a productivity optimisation target. A 2021 WHO/ILO joint analysis found that working 55+ hours per week was associated with a 35% higher risk of stroke and 17% higher risk of ischemic heart disease compared to working 35–40 hours. In India, the Periodic Labour Force Survey (2022) found that employed individuals in urban areas worked an average of 48.7 hours — above the ILO threshold — with the professional services, IT, and financial sectors consistently reporting 55–65 hour weeks. A significant proportion of this work is invisible: WhatsApp groups, after-hours emails, and on-call expectations that never formally enter reported hours.",
      stat: "55+",
      statLabel: "hour weeks raise stroke risk by 35%",
    },
    {
      heading: "Gen Z is the most burned-out professional cohort",
      body: "Deloitte's 2023 Global Gen Z and Millennial Survey — which included a large India sample — found that 38% of Gen Z respondents in India described themselves as 'frequently burned out', compared to 28% of Millennials in the same sample. Notably, Gen Z professionals report higher anxiety about financial security despite being earlier in their careers, suggesting that the economic instability of the post-pandemic environment compounds baseline workplace stress. Gen Z also reports the highest levels of intention to quit due to mental health — 46% said they had left or were considering leaving a job specifically due to mental health reasons.",
      stat: "46%",
      statLabel: "of Gen Z have left or considered leaving for mental health reasons",
    },
    {
      heading: "The economic productivity cost is substantial and quantifiable",
      body: "The WHO's 2019 estimate — that depression and anxiety cost the global economy $1 trillion annually in lost productivity — has been extrapolated to India based on disease burden share. India accounts for approximately 14.3% of the global mental disorder burden (Lancet, 2020), suggesting an India-specific productivity cost in the range of ₹7–8 lakh crore annually. This figure includes absenteeism (days missed), presenteeism (reduced productivity while at work), and turnover costs. A 2022 People Matters report specifically on Indian IT companies found that burnout-related attrition cost the sector an estimated ₹15,000–20,000 crore annually in replacement and training costs alone.",
      stat: "₹7–8L Cr",
      statLabel: "estimated annual productivity cost",
    },
    {
      heading: "EAP programs exist on paper but are rarely used",
      body: "Employee Assistance Programs (EAPs) have expanded significantly in Indian companies since 2020 — particularly in tech, financial services, and large manufacturing. However, utilisation rates remain extremely low. Indian EAP providers consistently report average utilisation of 3–5% of eligible employees annually, compared to 10–15% in the US and UK. Research attributes this to: low awareness (many employees don't know the program exists), confidentiality concerns (EAPs often sit within or adjacent to HR), and format mismatch (phone helplines in preference to on-demand digital access). A 2023 People Matters survey found that 61% of employees who knew their company had an EAP didn't trust that usage would be confidential.",
      stat: "3–5%",
      statLabel: "EAP utilisation vs. 10–15% in US/UK",
    },
    {
      heading: "The startup sector has specific and acute burnout dynamics",
      body: "A 2023 Inc42 survey of 400 Indian startup employees found that 71% reported working more than 50 hours per week, 58% reported being available to respond to work communications after 10 PM, and 49% reported having cancelled personal events due to work in the previous month. The 'founder mindset' expectation — that employees should treat company success as personal mission — is explicitly cultivated in Indian startup culture and correlates strongly with boundary erosion. The ESOP incentive structure, which ties financial reward to long vesting periods, creates additional psychological lock-in that makes it harder to leave even when conditions are harmful.",
      stat: "71%",
      statLabel: "of startup employees work 50+ hour weeks",
    },
    {
      heading: "Physical health consequences are now measurable",
      body: "The EY Work Reimagined Survey (2022) found that 43% of Indian professionals reported that work had negatively affected their physical health in the past year. Specific correlates include sleep disruption (reported by 61% of high-stress workers, Ipsos India 2022), musculoskeletal issues from sedentary high-hours work (reported by 47%), and immune-related illness (self-reported sick days increased 34% among high-stress respondents). These physical health consequences create secondary economic costs — medical expenditure, reduced productivity — that compound the direct mental health impact.",
      stat: "61%",
      statLabel: "of high-stress workers report sleep disruption",
    },
  ],
  whyThisHappens: [
    {
      heading: "The cultural legitimisation of overwork",
      body: "Indian professional culture — particularly in tech and finance — has absorbed and amplified the Silicon Valley equation of overwork with virtue. Long hours are a hiring signal ('high agency', 'high ownership'), a retention mechanism (social proof of commitment), and a management style default. The language of 'hustle', 'grind', and 'ownership' frames unsustainable working patterns as personal character attributes rather than as employer demands. This framing shifts responsibility for consequences from the organisation to the individual — burnout becomes a personal failure rather than a predictable organisational output.",
    },
    {
      heading: "Technology has dissolved professional boundaries",
      body: "WhatsApp, Slack, and email have made professional availability a social norm rather than a formal expectation. Non-response after working hours is a visible, politically interpretable act. This dynamic is particularly acute in India, where hierarchical management structures make non-compliance with implicit expectations risky. The result is that the working day for many professionals is not 9 hours — it is 16 hours of intermittent availability with several hours of concentrated work embedded in it. Research on cognitive load shows that interrupted availability — even without active work — is mentally exhausting and prevents psychological recovery.",
    },
    {
      heading: "Economic stakes raise the psychological cost of stopping",
      body: "For many urban Indian professionals, their job is not primarily about self-actualisation — it is the financial lifeline for multiple family members, the justification for sacrifices made in their education, and the proof of worth in a competitive system. These stakes make limits feel dangerous. 'I can't push back on this' is not always irrational; in many workplace cultures, it is an accurate assessment. The psychology of overwork in India is inseparable from the economics of the middle class, where professional employment is both hard-won and precarious.",
    },
  ],
  implications:
    "Burnout in Indian workplaces is not a wellness problem that meditation apps can solve. It is a structural problem requiring structural responses: workload norms, management accountability, genuine EAP confidentiality, and cultural permission to have limits. Therapy has a specific role — helping individuals understand what's happening to them, develop strategies for navigating difficult conditions, and make clearer decisions about what they can and cannot sustain. It does not fix a bad job. But it can be the difference between someone reaching an informed decision and someone reaching a breaking point.",
  sources: [
    {
      title: "2022 Deloitte Global Millennial and Gen Z Survey",
      org: "Deloitte",
      href: "https://www2.deloitte.com/global/en/pages/about-deloitte/articles/millennialsurvey.html",
      year: "2022",
    },
    {
      title: "Long working hours and risk of coronary heart disease and stroke",
      org: "WHO / ILO (The Lancet)",
      href: "https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(21)00637-8/fulltext",
      year: "2021",
    },
    {
      title: "EY Work Reimagined Survey 2022",
      org: "Ernst & Young India",
      href: "https://www.ey.com/en_in/workforce/work-reimagined-survey",
      year: "2022",
    },
    {
      title: "Mental health in the workplace",
      org: "World Health Organization",
      href: "https://www.who.int/teams/mental-health-and-substance-use/promotion-prevention/mental-health-in-the-workplace",
      year: "2022",
    },
    {
      title: "Periodic Labour Force Survey 2022",
      org: "Ministry of Statistics & Programme Implementation, India",
      href: "https://mospi.gov.in",
      year: "2022",
    },
  ],
}

const disclosureProblem: DeepDiveReport = {
  slug: "the-disclosure-problem",
  title: "The Disclosure Problem",
  subtitle: "Why 80% of Indian employees won't tell their employers they're struggling",
  section: "workplace",
  sectionLabel: "Workplace Mental Health",
  publishedAt: "2026-02-12",
  intro:
    "Mental health disclosure at work is a rational decision, not an emotional one. The 80% of Indian employees who say they would not disclose a mental health issue to their employer are making an accurate assessment of the risks. This report examines the data on disclosure, the real consequences of disclosure in Indian workplaces, and what organisations with good intentions keep getting wrong.",
  keyStats: [
    {
      figure: "80%",
      label: "Indian employees who would not disclose a mental health issue to their employer",
      source: "Economic Times / Ipsos, 2023",
    },
    {
      figure: "14%",
      label: "Trust their company to handle mental health disclosures confidentially",
      source: "SHRM India, 2022",
    },
    {
      figure: "3–5%",
      label: "Average EAP utilisation in Indian companies (vs. 10–15% in US/UK)",
      source: "People Matters, 2023",
    },
    {
      figure: "72% / 31%",
      label: "HR professionals who say their company has a mental health policy / employees aware of it",
      source: "CII / People Matters, 2022",
    },
    {
      figure: "46%",
      label: "Indian employees who left or considered leaving a job specifically due to mental health",
      source: "Deloitte Global Gen Z Survey, 2023",
    },
    {
      figure: "₹15,000 Cr",
      label: "Estimated annual cost to Indian IT sector from burnout-related attrition alone",
      source: "People Matters, 2022",
    },
  ],
  findings: [
    {
      heading: "The disclosure gap is rational, not irrational",
      body: "Research consistently shows that mental health disclosure in workplace settings correlates with negative career outcomes in a statistically significant way. A 2023 People Matters India study tracked 800 employees over 18 months post-disclosure: those who disclosed experienced a 34% higher likelihood of receiving a below-average performance rating, a 28% lower likelihood of being shortlisted for promotion, and a 22% higher likelihood of involuntary exit within 12 months compared to matched non-disclosers. These outcomes were not attributed to mental health status by managers — but the correlation was statistically significant. The fear of disclosure is not paranoia; it has an empirical basis.",
      stat: "34%",
      statLabel: "higher risk of negative performance rating post-disclosure",
    },
    {
      heading: "EAP confidentiality is not credible to employees",
      body: "Most Indian EAP programs are administered by or through HR departments. HR's institutional obligation is to the organisation, not the employee. Even when EAPs are delivered by third-party providers, employees correctly note that the organisation is the contractual client — they hold the data and control the reporting. A 2023 survey by People Matters found that 61% of employees who knew about their EAP did not trust that usage would remain confidential from their employer. This trust deficit directly accounts for the 3–5% utilisation rate. Programs with genuinely independent, anonymised access consistently show utilisation 2–3 times higher.",
      stat: "61%",
      statLabel: "of EAP-aware employees don't trust its confidentiality",
    },
    {
      heading: "The awareness-policy gap reveals organisational performativity",
      body: "The gap between the 72% of HR leaders who say their company has a mental health policy and the 31% of employees who are aware one exists is not primarily a communication failure — it's an engagement failure. Where mental health policies are merely documents rather than active practices (manager training, workload limits, culture norms), employees correctly perceive them as performative. Research on organisational authenticity (SHRM, 2022) shows that companies where employees score low on 'leadership walks the talk' on mental health show worse mental health outcomes than companies with no stated policy — because the gap between rhetoric and reality actively erodes trust.",
      stat: "72% vs 31%",
      statLabel: "HR awareness vs. employee awareness of mental health policy",
    },
    {
      heading: "Mental health awareness weeks can backfire",
      body: "A 2023 study published in the Journal of Occupational Health Psychology found that workplace mental health awareness campaigns without structural change were associated with increased stigma perception in some settings — because they make mental illness salient in a context where no safe support exists. In India specifically, where disclosure risk is high, campaigns that encourage openness without first establishing genuine safety create a cruel dynamic: employees are told to speak up in environments where speaking up has real costs. The Ipsos India survey found that 38% of employees who witnessed mental health awareness campaigns at work reported lower trust in their employer's intentions, not higher.",
      stat: "38%",
      statLabel: "employees reported lower trust after mental health campaigns",
    },
    {
      heading: "The talent cost is now quantifiable",
      body: "Deloitte's 2023 Global Gen Z Survey found that 46% of Indian respondents had left or were considering leaving a job specifically due to mental health reasons. At average replacement costs of 50–200% of annual salary (SHRM estimates), this represents a substantial and growing talent cost. People Matters' 2022 analysis of India's IT sector estimated burnout-related attrition cost ₹15,000–20,000 crore annually. The irony is that organisations reluctant to invest in mental health support are already paying the cost of mental health neglect — they are simply paying it in a form they don't attribute to the cause.",
      stat: "50–200%",
      statLabel: "of annual salary to replace one employee",
    },
    {
      heading: "Manager quality is the strongest predictor of employee mental health",
      body: "Gallup's State of the Global Workplace 2023 found that manager behaviour accounts for 70% of variance in team engagement. SHRM India's 2022 workplace mental health survey found that employees who rated their direct manager as 'psychologically safe' were 3.2 times more likely to seek help for a mental health issue — internally or externally — than those who rated their manager as unsupportive. This finding is significant: it suggests that investment in manager development has higher leverage on employee mental health outcomes than any EAP or awareness campaign.",
      stat: "3.2×",
      statLabel: "more likely to seek help with a psychologically safe manager",
    },
  ],
  whyThisHappens: [
    {
      heading: "Corporate mental health is structurally positioned wrong",
      body: "Mental health programs in Indian organisations almost universally sit within HR. HR's primary function is workforce management in service of organisational goals. This structural position makes genuine confidentiality difficult and employee trust harder to earn. In jurisdictions with better outcomes — notably the UK and Australia — occupational health sits separately from HR, with clinical confidentiality obligations. India has no regulatory requirement for this separation, and few organisations have implemented it voluntarily.",
    },
    {
      heading: "The incentive structure doesn't reward long-term thinking",
      body: "The return on investment in employee mental health support accrues over 18–36 months — through reduced attrition, lower absenteeism, and productivity improvements. Quarterly reporting cycles and annual budgets create incentives to cut costs in the short term. Mental health programs are discretionary spending; when budgets are under pressure, they are cut. The companies that maintain mental health investment through economic cycles are not common in India — but available data suggests they perform significantly better on talent retention metrics.",
    },
    {
      heading: "The legal framework provides insufficient protection",
      body: "The Mental Healthcare Act 2017 establishes rights for people with mental illness but provides limited workplace-specific protections. There is no Indian equivalent of the UK's Equality Act provisions or the US ADA protections for people with mental health conditions in employment contexts. Employees who experience discrimination following mental health disclosure have limited legal recourse. This legal gap means that employers face no regulatory consequence for the career penalty associated with disclosure — removing a significant incentive for organisational change.",
    },
  ],
  implications:
    "The disclosure problem is solvable, but not through campaigns. It requires structural changes: genuinely independent mental health support (outside HR), manager training with accountability attached, workload norms that don't require heroics, and — for organisations that can afford it — confidential third-party therapy access. The organisations that get this right will see it in their attrition numbers within two years. Those that don't will continue paying the cost without understanding the cause.",
  sources: [
    {
      title: "State of Mental Health at Work in India 2022",
      org: "SHRM India / Optum",
      href: "https://www.shrmindia.org",
      year: "2022",
    },
    {
      title: "2023 Deloitte Global Gen Z and Millennial Survey",
      org: "Deloitte",
      href: "https://www2.deloitte.com/global/en/pages/about-deloitte/articles/millennialsurvey.html",
      year: "2023",
    },
    {
      title: "EAP Benchmarking and Utilisation Report — India",
      org: "People Matters",
      href: "https://www.peoplematters.in",
      year: "2023",
    },
    {
      title: "State of the Global Workplace 2023",
      org: "Gallup",
      href: "https://www.gallup.com/workplace/349484/state-of-the-global-workplace.aspx",
      year: "2023",
    },
    {
      title: "Disclosure of mental health conditions in the workplace",
      org: "Journal of Occupational Health Psychology",
      href: "https://psycnet.apa.org",
      year: "2023",
    },
  ],
}

// ─── REGIONAL ────────────────────────────────────────────────────────────────

const metroMyth: DeepDiveReport = {
  slug: "the-metro-myth",
  title: "The Metro Myth",
  subtitle: "Why proximity to therapists does not equal access in India's cities",
  section: "regional",
  sectionLabel: "Regional Breakdown",
  publishedAt: "2026-02-20",
  intro:
    "India's metro cities — Delhi, Mumbai, Bengaluru, Chennai, Hyderabad, Kolkata — contain the overwhelming majority of the country's mental health professionals. This has led to a widespread assumption that mental healthcare access in urban India is a solved problem. It is not. Supply concentration and access are not the same thing, and the data on who actually uses mental health services in metro India tells a very different story.",
  keyStats: [
    {
      figure: "60%",
      label: "Of India's mental health professionals located in the 6 metro cities (16% of population)",
      source: "NIMHANS, 2022",
    },
    {
      figure: "₹1,500–5,000",
      label: "Per-session cost of private therapy in metro cities",
      source: "Market survey, 2023",
    },
    {
      figure: "4–8 hrs",
      label: "Average wait time at government hospital psychiatry OPDs in metros",
      source: "NIMHANS audit, 2022",
    },
    {
      figure: "80%+",
      label: "Of metro therapy users in top two income quintiles",
      source: "Socioeconomic analysis, NIMHANS / TISS",
    },
    {
      figure: "90%",
      label: "Of India's workforce in informal sector — zero employer mental health benefits",
      source: "PLFS, 2022",
    },
    {
      figure: "10–15 min",
      label: "Average consultation duration at government psychiatry OPDs",
      source: "NIMHANS clinical audit, 2022",
    },
  ],
  findings: [
    {
      heading: "Professional concentration creates an illusion of access",
      body: "Mumbai has approximately 800–1,000 registered psychologists and psychiatrists for a population of 20 million. The psychiatrist-to-population ratio for Greater Mumbai is approximately 0.4–0.5 per 100,000 — marginally better than the national average of 0.3 per 100,000, but still profoundly below the WHO minimum of 3 per 100,000. More significantly, these professionals are not evenly distributed across the city. A 2022 TISS mapping exercise found that approximately 70% of Mumbai's mental health practitioners were concentrated in the western suburbs and South Mumbai — the high-income, English-speaking corridors. Dharavi, which houses approximately 1 million people, had fewer than 10 mental health practitioners within its boundaries.",
      stat: "0.5",
      statLabel: "psychiatrists per 100K even in Mumbai",
    },
    {
      heading: "Cost effectively excludes the majority of metro populations",
      body: "The median monthly income in Mumbai's formal sector is approximately ₹25,000–30,000. In the informal sector — domestic workers, construction workers, daily wage earners — it is ₹8,000–15,000. A single therapy session at ₹1,500–5,000 represents 5–60% of a monthly income. At weekly or biweekly frequency, sustained therapy is economically impossible for the bottom three income quintiles in metro India. An NSSO analysis of healthcare expenditure found that for the bottom 40% of urban households, any out-of-pocket healthcare cost above ₹500 per visit is considered a financial catastrophe.",
      stat: "5–60%",
      statLabel: "of monthly income for one therapy session",
    },
    {
      heading: "Government services are overwhelmed and structurally inadequate",
      body: "Government hospital psychiatry OPDs in metro cities are technically free or near-free. In practice, they operate at extreme capacity. A 2022 NIMHANS clinical audit found average wait times of 4–8 hours for a 10–15 minute consultation. A single government psychiatrist may see 80–100 patients per day — making individualised assessment, psychotherapy, and meaningful follow-up structurally impossible. Psychotherapy (as distinct from medication management) is almost entirely absent from government mental health services. The government system does medication management; it does not do the kind of talking-based work that is most relevant for anxiety, depression, relationship problems, and adjustment difficulties.",
      stat: "80–100",
      statLabel: "patients per day per government psychiatrist",
    },
    {
      heading: "Informal sector workers are effectively excluded from all support",
      body: "90% of India's workforce is in the informal sector — gig workers, domestic workers, construction workers, street vendors, daily wage earners. This population has no employer-provided health benefits of any kind, no EAP access, and income levels that preclude private care. In metro cities, this population is large and visible — but entirely absent from the mental health data, not because they don't experience mental distress, but because they don't appear in datasets that require someone to seek care. A 2021 study of migrant construction workers in Delhi found that 38% screened positive for depression or anxiety — but fewer than 1% had accessed any mental health support.",
      stat: "38%",
      statLabel: "of migrant construction workers screen positive for depression/anxiety",
    },
    {
      heading: "The language barrier compounds income barriers",
      body: "Mental healthcare in India's private sector is overwhelmingly delivered in English. A 2023 analysis of therapy platforms operating in India found that English was the primary (and often only) language of service delivery. This creates an additional exclusion mechanism: even if cost were addressed, a Hindi-speaking working-class family in Delhi faces a practical barrier to accessing English-medium private mental health services. Public sector services operate in regional languages but, as noted, are overwhelmed and medication-focused. The intersection of language and cost barriers effectively limits private therapy to the English-educated urban middle class.",
      stat: "~80%",
      statLabel: "of private therapy delivered exclusively in English",
    },
    {
      heading: "Cultural stigma operates differently but is not absent in metros",
      body: "Metro populations, particularly English-educated younger cohorts, show measurably lower mental health stigma than rural populations (NMHS, 2016). However, stigma in metro contexts is not absent — it is repositioned. A 2022 study in Indian Journal of Psychiatry found significant enacted stigma (others' discriminatory behaviour) in middle-class metro contexts around marriage, employment, and family reputation. The content of stigma differs: in rural areas, it tends toward supernatural frameworks; in urban areas, it tends toward competence and reliability frameworks ('she's not stable', 'he can't handle pressure'). Both forms reduce help-seeking, but they present differently.",
      stat: "2022",
      statLabel: "Indian Journal of Psychiatry — metro stigma study",
    },
  ],
  whyThisHappens: [
    {
      heading: "The private sector developed without equity design",
      body: "India's mental health private sector emerged primarily to serve an English-educated, upper-middle-class clientele. Pricing, language of service, and location were all calibrated to this market. There were no regulatory requirements for cross-subsidy, geographic distribution, or language access. The result is a private sector that is high-quality but narrow — excellent for those who can access it, irrelevant for the majority of metro populations.",
    },
    {
      heading: "The public sector was never adequately funded to fill the gap",
      body: "India's public mental health system was not designed to absorb the demand that existed even before India's urban population reached current levels. Government hospital psychiatry departments were built for a different era of patient volume and case complexity. The funding increases required to transform them into genuinely accessible services have not materialised. Per-capita public mental health expenditure in India's largest cities is not meaningfully different from the national average.",
    },
    {
      heading: "Online access is not a perfect solution but changes the calculus",
      body: "Digital-first mental health services reduce the cost and geographic barriers — but not to zero. Smartphones are near-universal in urban India, but reliable internet, time, and disposable income remain constraints. The most significant benefit of online therapy in metro contexts may be anonymity: the ability to access care without anyone in a person's building, office, or family network being aware. In dense urban environments where community surveillance is high, this matters.",
    },
  ],
  implications:
    "The assumption that metro India has a mental health access solution is incorrect and consequential — it leads to policy attention being concentrated on supply (training more professionals) without addressing the demand-side barriers (cost, language, stigma, informal sector exclusion). A metro resident with a mental health condition is better positioned than a rural resident — but not by as much as the concentration of professionals would suggest.",
  sources: [
    {
      title: "Human Resources in Mental Health — India Profile",
      org: "NIMHANS / WHO Collaborating Centre",
      href: "https://nimhans.ac.in",
      year: "2022",
    },
    {
      title: "Periodic Labour Force Survey 2021–22",
      org: "Ministry of Statistics & Programme Implementation",
      href: "https://mospi.gov.in",
      year: "2022",
    },
    {
      title: "National Mental Health Survey of India 2015–16",
      org: "NIMHANS",
      href: "https://nimhans.ac.in/wp-content/uploads/2019/07/National-Mental-Health-Survey-2015-16-1.pdf",
      year: "2016",
    },
    {
      title: "Stigma and mental illness in urban India",
      org: "Indian Journal of Psychiatry",
      href: "https://www.indianjpsychiatry.org",
      year: "2022",
    },
    {
      title: "Mental health of migrant workers in India",
      org: "International Journal of Social Psychiatry",
      href: "https://journals.sagepub.com/home/isp",
      year: "2021",
    },
  ],
}

const ruralDesert: DeepDiveReport = {
  slug: "rural-mental-health-desert",
  title: "Rural India's Mental Health Desert",
  subtitle: "For 900 million people, mental healthcare is not expensive — it is absent",
  section: "regional",
  sectionLabel: "Regional Breakdown",
  publishedAt: "2026-02-28",
  intro:
    "Rural India — approximately 65% of the country's population — is almost entirely absent from India's formal mental health system. This is not primarily a cultural problem or a stigma problem; it is an infrastructure problem. The delivery mechanisms that would be necessary to reach rural populations have never been built at the required scale. This report examines the extent of the gap, the evidence on what could close it, and why that evidence has not yet been implemented.",
  keyStats: [
    {
      figure: "65%",
      label: "Of India's population in rural areas — fewer than 10% of mental health professionals serve them",
      source: "NMHS, 2016",
    },
    {
      figure: "100+ km",
      label: "Distance to nearest psychiatrist for an estimated 400 million rural Indians",
      source: "NIMHANS geographic mapping, 2021",
    },
    {
      figure: "40%",
      label: "Of India's 743 districts with any functional District Mental Health Programme services",
      source: "Ministry of Health & Family Welfare, 2022",
    },
    {
      figure: "<2 days",
      label: "Mental health training in the standard ASHA worker curriculum",
      source: "National Health Mission training framework",
    },
    {
      figure: "<2%",
      label: "Telemedicine adoption for mental health in rural India",
      source: "National Digital Health Mission, 2022",
    },
    {
      figure: "11.3%",
      label: "Mental disorder prevalence in rural India (comparable to urban 13.5%)",
      source: "NMHS, 2016",
    },
  ],
  findings: [
    {
      heading: "Prevalence is comparable to urban — infrastructure is not",
      body: "The National Mental Health Survey (2016) found mental disorder prevalence in rural India at 11.3% — only marginally below the urban figure of 13.5%. This finding is important: the need is not substantially lower in rural areas. What is substantially different is the availability of any response. The NMHS found that the treatment gap — the proportion who need care but receive none — was 96.7% in rural areas compared to 79.9% in urban areas. In real terms: for approximately 100 million rural Indians with a significant mental health condition, the treatment gap is near-total.",
      stat: "96.7%",
      statLabel: "treatment gap in rural India",
    },
    {
      heading: "The District Mental Health Programme has failed to scale",
      body: "The District Mental Health Programme (DMHP) was launched in 1996 with the goal of extending mental health services to all of India's districts through integration with general health services. As of 2022, fewer than 300 of India's 743 districts have any functional DMHP services, and 'functional' is defined loosely — many districts have a DMHP on paper with a single part-time mental health professional covering a population of 1–2 million. The reasons for DMHP's limited reach include inadequate funding, insufficient trained workforce, poor coordination between state health ministries, and the chronic prioritisation of communicable disease over non-communicable mental illness in district health planning.",
      stat: "300 of 743",
      statLabel: "districts with any DMHP services",
    },
    {
      heading: "The ASHA worker is the logical frontline — but is undertrained",
      body: "India's 1.1 million ASHA (Accredited Social Health Activists) workers are the world's largest community health workforce and the primary contact point between rural communities and the formal health system. They are present in villages, trusted, and culturally embedded. The National Health Mission's ASHA training module allocates fewer than two days of a multi-month curriculum to mental health — focused primarily on identification of severe mental illness and alcohol use disorders. The evidence base for expanding this is strong: the MANAS trial (2011, Lancet) demonstrated that lay health workers with approximately 5 weeks of specific training could deliver effective psychological treatments for depression and anxiety, achieving outcomes comparable to specialist care. This evidence has not been translated into the ASHA training curriculum at scale.",
      stat: "1.1M",
      statLabel: "ASHA workers — undertrained for mental health",
    },
    {
      heading: "Telemedicine remains largely unrealised for rural mental health",
      body: "The e-Sanjeevani telemedicine platform, launched in 2019 and expanded significantly during COVID-19, has delivered over 100 million consultations as of 2023. Mental health consultations account for fewer than 2% of this total. Barriers include: limited psychiatric availability on the platform, absence of psychotherapy delivery protocols, and patient-side barriers including smartphone access, internet connectivity, and lack of awareness. A 2022 National Digital Health Mission analysis found that telemedicine uptake in the bottom two income quintiles was 60% lower than in the top two, with connectivity as the primary barrier. The infrastructure for remote mental health delivery exists but is not configured or resourced to serve rural populations at meaningful scale.",
      stat: "<2%",
      statLabel: "of telemedicine consultations are for mental health",
    },
    {
      heading: "Farmer distress represents a specific high-severity cluster",
      body: "Agricultural communities in Maharashtra, Karnataka, Andhra Pradesh, and Tamil Nadu show consistently elevated rates of severe psychological distress in research studies. The convergence of debt stress (particularly informal debt at usurious rates), climate-related crop uncertainty, land fragmentation, and masculinity norms that frame financial failure as personal shame creates conditions of extreme psychological pressure. Research in Marathwada specifically (Patel et al., 2021) found that 41% of farming household members screened positive for clinical-level anxiety or depression in the year following a significant crop failure. Mental health support in these communities is near-absent: the closest psychiatric service is typically 80–150km away, and there is no pathway for accessing it even when a family recognises the need.",
      stat: "41%",
      statLabel: "of farming households positive for depression/anxiety after crop failure",
    },
    {
      heading: "Evidence-based community delivery models exist but remain at pilot scale",
      body: "Multiple randomised controlled trials have demonstrated that mental health care can be effectively delivered in rural India through trained community workers: the MANAS trial (lay workers for CMD), the VISHRAM trial (community-level intervention for depression in older adults), and PREMIUM (phone-based psychological treatment). These are not small studies — MANAS enrolled over 2,700 participants and showed significant reductions in depression and anxiety outcomes compared to enhanced usual care. Despite strong evidence, none of these models has been adopted into national policy at scale. The gap between evidence and implementation in Indian rural mental health is one of the largest in global public health.",
      stat: "3 major RCTs",
      statLabel: "proving rural delivery works — none scaled nationally",
    },
  ],
  whyThisHappens: [
    {
      heading: "Mental health was excluded from primary health system design",
      body: "India's primary health system — PHCs, sub-centres, ASHA workers — was designed around communicable disease, maternal health, and child nutrition. Mental health was treated as a specialty requiring specialist institutions, not as a community health priority requiring primary care integration. This design choice, made in the 1970s and 1980s, has created a path dependency that is extremely difficult to reverse. Integrating mental health into primary care requires training existing workers, changing clinical protocols, modifying referral pathways, and sustained funding — all of which require political will and budget that has not materialised consistently.",
    },
    {
      heading: "The specialist production pipeline cannot close the geographic gap",
      body: "Even if India dramatically increased psychiatric training capacity, newly trained psychiatrists would not locate in rural districts in sufficient numbers. The incentive structure — income, professional community, family considerations, access to education for children — all favour urban practice. Task-shifting to non-specialist workers is not a second-best option; it is the only viable strategy for rural mental health at scale. The evidence is clear. The policy response has been inadequate.",
    },
    {
      heading: "Rural mental health lacks an effective political constituency",
      body: "Urban mental health can be championed by educated, English-speaking advocates who have access to policymakers. Rural mental health affects populations with less political voice. Farmer suicides generate episodic media attention; the chronic burden of untreated depression, anxiety, and psychosis in rural communities generates little. NGOs and academic researchers document the scale of the problem effectively. Converting documentation into policy change requires political pressure that has not been consistently generated.",
    },
  ],
  implications:
    "Rural India's mental health gap will not be closed by the private sector. It requires public investment in community health worker training, primary care integration, and telemedicine infrastructure — backed by policy commitment that treats mental health as a priority rather than a specialty. Online platforms like ZenSpace are relevant for the rural population that has smartphone access and disposable income — a growing but still minority group. The majority of rural India needs a different solution, and the evidence for that solution already exists.",
  sources: [
    {
      title: "National Mental Health Survey of India 2015–16",
      org: "NIMHANS",
      href: "https://nimhans.ac.in/wp-content/uploads/2019/07/National-Mental-Health-Survey-2015-16-1.pdf",
      year: "2016",
    },
    {
      title: "Effectiveness of interventions for common mental disorders — MANAS trial",
      org: "The Lancet",
      href: "https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(10)61076-9/fulltext",
      year: "2011",
    },
    {
      title: "District Mental Health Programme Implementation Status",
      org: "Ministry of Health & Family Welfare",
      href: "https://mohfw.gov.in",
      year: "2022",
    },
    {
      title: "e-Sanjeevani Telemedicine Platform: Annual Report",
      org: "National Digital Health Mission",
      href: "https://esanjeevaniopd.in",
      year: "2023",
    },
    {
      title: "PREMIUM: a mobile phone based intervention for depression",
      org: "PLOS Medicine",
      href: "https://journals.plos.org/plosmedicine",
      year: "2017",
    },
    {
      title: "Mental health and farmers in India",
      org: "Economic and Political Weekly",
      href: "https://www.epw.in",
      year: "2021",
    },
  ],
}

// ─── EXPORTS ─────────────────────────────────────────────────────────────────

export const allReports: DeepDiveReport[] = [
  treatmentGap,
  suicideCrisis,
  burnoutEconomy,
  disclosureProblem,
  metroMyth,
  ruralDesert,
]

export const reportsBySection = {
  national: [treatmentGap, suicideCrisis],
  workplace: [burnoutEconomy, disclosureProblem],
  regional: [metroMyth, ruralDesert],
}

export function getReport(slug: string): DeepDiveReport | undefined {
  return allReports.find((r) => r.slug === slug)
}
