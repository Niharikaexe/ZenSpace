// Maps raw questionnaire_responses JSON into labeled sections for the admin UI.
// Source-of-truth for question labels: the on-page <h2> text shown to clients
// in app/questionnaire/{individual,couples,teen}/page.tsx. Labels here are
// short admin-scanner versions; full clinical detail lives in the stored JSON.

type LabelMap = Record<string, string>

const INDIVIDUAL_LABELS: LabelMap = {
  age: 'Age range',
  q1: 'Why now',
  q2: 'Main themes',
  q3: 'Support type',
  q4: 'Self-relationship',
  q5: 'Sleep',
  q6: 'Racing thoughts at night',
  q7: 'Social situations',
  q8: 'Hope statement',
  q9: 'Coping habits',
  q10: 'Areas of life affected',
  q11: 'Medical / medication?',
  q11a: 'Medical notes',
  q12: 'Past therapy?',
  q12a: 'Past therapy reflection',
  q12b: 'Preferred therapist style',
  q13: 'Therapist gender preference',
  q14: 'Other therapist characteristics',
  q15: 'Languages',
  q15Other: 'Other language',
}

const TEEN_LABELS: LabelMap = {
  age: 'Age range',
  q1: 'Current state',
  q2: 'Feelings about therapy',
  q3: 'Who wanted them in therapy',
  q4: 'Feeling understood by adults',
  q5: 'Impact on school',
  q6: 'Family relationship',
  q7: 'Friendships',
  q8: 'Bullying experience',
  q9: 'Hobbies and interest',
  q10: 'Worry frequency',
  q11: 'Trouble at home / school',
  q12: 'Sleep',
  q13: 'Self-image',
  q14: 'Talking to adults',
  q15: 'Main themes',
  q16: 'Preferred therapist qualities',
  q17: 'Past therapy?',
  q17a: 'Past therapy reflection',
  q18: 'Anything else',
  q19: 'Languages',
  q19Other: 'Other language',
}

const COUPLES_COMMON_LABELS: LabelMap = {
  c1: 'Relationship feeling now',
  c2: 'Closeness',
  c3: 'Conflict style',
  c4: 'Relationship status',
  c5: 'Difficulty duration',
  c6: 'Areas of conflict',
  c6Other: 'Other conflict area',
  c7: 'Communication satisfaction (1–10)',
  c8: 'Trust level',
  c9: 'Therapy goals',
  c9Other: 'Other therapy goal',
  c10: 'Past couples counseling?',
  c10a: 'Preferred therapist style',
  c11: 'Therapist gender preference',
  c12: 'Specific experiences / identities to be familiar with',
  c13: 'Languages',
  c13Other: 'Other language',
}

function valueToString(v: unknown): string | null {
  if (v === null || v === undefined) return null
  if (typeof v === 'string') return v.trim() || null
  if (typeof v === 'number') return String(v)
  if (typeof v === 'boolean') return v ? 'Yes' : 'No'
  if (Array.isArray(v)) {
    const filtered = (v as unknown[])
      .filter((x) => typeof x === 'string' && (x as string).trim() !== '') as string[]
    return filtered.length > 0 ? filtered.join(', ') : null
  }
  return null
}

export type QuestionnaireSection = {
  heading: string
  items: Array<{ label: string; value: string }>
}

export type AdminQuestionnaireView = {
  typeLabel: string
  sections: QuestionnaireSection[]
} | null

export function formatQuestionnaireForAdmin(
  responses: Record<string, unknown> | null | undefined,
): AdminQuestionnaireView {
  if (!responses) return null
  const type = typeof responses.type === 'string' ? (responses.type as string) : null
  if (!type) return null

  if (type === 'individual' || type === 'teen') {
    const labels = type === 'individual' ? INDIVIDUAL_LABELS : TEEN_LABELS
    const answers = (responses.answers ?? {}) as Record<string, unknown>
    const items: Array<{ label: string; value: string }> = []
    for (const key of Object.keys(labels)) {
      const val = valueToString(answers[key])
      if (val) items.push({ label: labels[key], value: val })
    }
    return {
      typeLabel: type === 'individual' ? 'Individual questionnaire' : 'Teen questionnaire',
      sections: items.length > 0 ? [{ heading: 'Intake answers', items }] : [],
    }
  }

  if (type === 'couples') {
    const sections: QuestionnaireSection[] = []
    const common = (responses.common ?? {}) as Record<string, unknown>
    const commonItems: Array<{ label: string; value: string }> = []
    for (const key of Object.keys(COUPLES_COMMON_LABELS)) {
      const val = valueToString(common[key])
      if (val) commonItems.push({ label: COUPLES_COMMON_LABELS[key], value: val })
    }
    if (commonItems.length > 0) {
      sections.push({ heading: 'Shared answers (both partners)', items: commonItems })
    }

    // Privacy: do NOT show partner1.* / partner2.* contents.
    // The questionnaire UI promises clients those answers are visible only to
    // them and their therapist. Surface attendance flag only.
    const partnerInfo: Array<{ label: string; value: string }> = []
    if (typeof responses.attendingAlone === 'boolean') {
      partnerInfo.push({
        label: 'Filled by',
        value: responses.attendingAlone ? 'One partner' : 'Both partners',
      })
    }
    const partner1 = (responses.partner1 ?? null) as Record<string, unknown> | null
    const partner2 = (responses.partner2 ?? null) as Record<string, unknown> | null
    if (partner1) {
      const age1 = valueToString(partner1.p0)
      if (age1) partnerInfo.push({ label: 'Partner 1 age range', value: age1 })
      partnerInfo.push({ label: 'Partner 1 private section', value: 'Recorded — therapist-only' })
    }
    if (partner2) {
      const age2 = valueToString(partner2.p0)
      if (age2) partnerInfo.push({ label: 'Partner 2 age range', value: age2 })
      partnerInfo.push({ label: 'Partner 2 private section', value: 'Recorded — therapist-only' })
    }
    if (partnerInfo.length > 0) {
      sections.push({ heading: 'Partner attendance', items: partnerInfo })
    }

    return { typeLabel: 'Couples questionnaire', sections }
  }

  return null
}
