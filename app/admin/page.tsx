import { createAdminClient, createClient, getAuthClaims } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminDashboard from '@/components/admin/AdminDashboard'
import type {
  UnmatchedClient,
  TherapistWithProfile,
  ActiveMatch,
  InviteCode,
  TherapistApplication,
  SwitchRequest,
  EmailLog,
  Lead,
  TherapistPayoutSummary,
  PaymentRow,
} from '@/components/admin/AdminDashboard'
import type { FeedbackRow } from '@/components/admin/FeedbackTab'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  // ── Auth check ──────────────────────────────────────────────────────────────
  const supabase = await createClient()
  const user = await getAuthClaims(supabase)
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single() as { data: { role: string; full_name: string } | null; error: unknown }

  if (profile?.role !== 'admin') redirect('/dashboard')

  // Use admin client (bypasses RLS) for all dashboard queries
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any

  // ── Parallel fetches ────────────────────────────────────────────────────────
  const [
    { data: allClients },
    { data: allActiveMatches },
    { data: therapistProfiles },
    { data: rawInvites },
    { data: rawApplications },
    { data: rawSwitchRequests },
  ] = await Promise.all([
    admin.from('profiles')
      .select('id, full_name, avatar_url, email, created_at, first_utm_source, first_utm_medium, first_utm_campaign, first_utm_term, first_utm_content, last_utm_source, last_utm_medium, last_utm_campaign, last_utm_term, last_utm_content, referrer, landing_page, first_seen_at, extra_params, journey, device_type, device_browser, device_os')
      .eq('role', 'client')
      .order('created_at', { ascending: false }),
    admin.from('matches')
      .select('*')
      .in('status', ['active', 'pending'])
      .order('created_at', { ascending: false }),
    admin.from('therapist_profiles')
      .select('*')
      .order('created_at', { ascending: false }),
    admin.from('therapist_invites')
      .select('id, code, created_at, used_by')
      .order('created_at', { ascending: false }),
    admin.from('therapist_applications')
      .select('*')
      .eq('status', 'pending')
      .order('submitted_at', { ascending: false }),
    admin.from('therapist_switch_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false }),
  ])

  const matchedClientIds = new Set<string>((allActiveMatches ?? []).map((m: any) => m.client_id))
  const clientIds: string[] = (allClients ?? []).map((c: any) => c.id)
  const therapistUserIds: string[] = (therapistProfiles ?? []).map((t: any) => t.user_id)

  // ── Client detail fetches (parallel) ────────────────────────────────────────
  const [
    { data: clientProfiles },
    { data: questionnaireResponses },
    { data: allSubscriptions },
    { data: therapistUsers },
    authUsersResp,
  ] = await Promise.all([
    clientIds.length > 0
      ? admin.from('client_profiles').select('*').in('user_id', clientIds)
      : Promise.resolve({ data: [] }),
    clientIds.length > 0
      ? admin.from('questionnaire_responses').select('*').in('client_id', clientIds).order('submitted_at', { ascending: false })
      : Promise.resolve({ data: [] }),
    clientIds.length > 0
      ? admin.from('subscriptions').select('*').in('client_id', clientIds).order('created_at', { ascending: false })
      : Promise.resolve({ data: [] }),
    therapistUserIds.length > 0
      ? admin.from('profiles').select('id, full_name, avatar_url').in('id', therapistUserIds)
      : Promise.resolve({ data: [] }),
    // Auth users for email_confirmed_at — caps at 1000 (Supabase listUsers limit).
    // Past that, switch to paginated scan keyed on a stored cursor.
    admin.auth.admin.listUsers({ perPage: 1000 }),
  ])

  // Map<userId, { email_confirmed_at: string | null; email: string | null }>
  const authMap = new Map<string, { email_confirmed_at: string | null; email: string | null }>()
  for (const u of (authUsersResp?.data?.users ?? [])) {
    authMap.set(u.id, { email_confirmed_at: u.email_confirmed_at ?? null, email: u.email ?? null })
  }

  // ── Build unmatched clients ──────────────────────────────────────────────────
  const unmatchedClients: UnmatchedClient[] = (allClients ?? [])
    .filter((c: any) => !matchedClientIds.has(c.id))
    .map((c: any) => ({
      id: c.id,
      full_name: c.full_name,
      avatar_url: c.avatar_url ?? null,
      created_at: c.created_at,
      email_confirmed_at: authMap.get(c.id)?.email_confirmed_at ?? null,
      clientProfile: (clientProfiles ?? []).find((cp: any) => cp.user_id === c.id) ?? null,
      questionnaire: (questionnaireResponses ?? []).find((q: any) => q.client_id === c.id) ?? null,
      subscription: (allSubscriptions ?? []).find((s: any) => s.client_id === c.id) ?? null,
    }))

  // ── Build therapists list ────────────────────────────────────────────────────
  const therapists: TherapistWithProfile[] = (therapistProfiles ?? []).map((tp: any) => ({
    id: tp.id,
    user_id: tp.user_id,
    license_number: tp.license_number,
    specializations: tp.specializations ?? [],
    bio: tp.bio ?? null,
    years_experience: tp.years_experience ?? 0,
    languages: tp.languages ?? [],
    accepts_new_clients: tp.accepts_new_clients ?? true,
    is_verified: tp.is_verified ?? false,
    weekly_capacity: tp.weekly_capacity ?? 10,
    profile: (therapistUsers ?? []).find((u: any) => u.id === tp.user_id) ?? null,
    activeMatchCount: (allActiveMatches ?? []).filter((m: any) => m.therapist_id === tp.user_id).length,
  }))

  // ── Build active matches with display profiles ───────────────────────────────
  const matchProfileIds = [
    ...(allActiveMatches ?? []).map((m: any) => m.client_id),
    ...(allActiveMatches ?? []).map((m: any) => m.therapist_id),
  ]
  const { data: matchProfiles } = matchProfileIds.length > 0
    ? await admin.from('profiles').select('id, full_name, avatar_url').in('id', [...new Set<string>(matchProfileIds)])
    : { data: [] }

  // ── Flagged-message aggregation per match ────────────────────────────────────
  // Pull only the flagged subset (partial index idx_messages_flagged) — never the
  // message content — so the admin sees flag categories + counts, not the chat.
  const activeMatchIds: string[] = (allActiveMatches ?? []).map((m: any) => m.id)
  const { data: flaggedRows } = activeMatchIds.length > 0
    ? await admin
        .from('messages')
        .select('match_id, flag_reason, created_at')
        .in('match_id', activeMatchIds)
        .eq('flagged', true)
        .order('created_at', { ascending: false })
    : { data: [] }

  const flagsByMatch = new Map<string, { count: number; reasons: string[]; lastAt: string | null }>()
  for (const row of (flaggedRows ?? []) as { match_id: string; flag_reason: string | null; created_at: string }[]) {
    const cur = flagsByMatch.get(row.match_id) ?? { count: 0, reasons: [], lastAt: null }
    cur.count++
    if (!cur.lastAt) cur.lastAt = row.created_at // rows are newest-first
    for (const r of (row.flag_reason ?? '').split(',').map(s => s.trim()).filter(Boolean)) {
      if (!cur.reasons.includes(r)) cur.reasons.push(r)
    }
    flagsByMatch.set(row.match_id, cur)
  }

  // ── Chat read/unread + activity per match ───────────────────────────────────
  // Minimal columns only (no content): sender, read flag, timestamp.
  const matchParties = new Map<string, { client: string; therapist: string }>(
    (allActiveMatches ?? []).map((m: any) => [m.id, { client: m.client_id, therapist: m.therapist_id }])
  )
  const { data: msgRows } = activeMatchIds.length > 0
    ? await admin
        .from('messages')
        .select('match_id, sender_id, is_read, created_at')
        .in('match_id', activeMatchIds)
        .order('created_at', { ascending: false })
    : { data: [] }

  const chatByMatch = new Map<string, ActiveMatch['chatStats']>()
  for (const r of (msgRows ?? []) as { match_id: string; sender_id: string; is_read: boolean; created_at: string }[]) {
    const parties = matchParties.get(r.match_id)
    if (!parties) continue
    const cur = chatByMatch.get(r.match_id) ?? {
      total: 0, unreadByClient: 0, unreadByTherapist: 0,
      lastMessageAt: null, lastSenderRole: null, lastClientReplyAt: null,
    }
    cur.total++
    const fromClient = r.sender_id === parties.client
    const fromTherapist = r.sender_id === parties.therapist
    // rows are newest-first → first row seen for a match is its latest message
    if (cur.lastMessageAt === null) {
      cur.lastMessageAt = r.created_at
      cur.lastSenderRole = fromClient ? 'client' : fromTherapist ? 'therapist' : null
    }
    if (fromClient && cur.lastClientReplyAt === null) cur.lastClientReplyAt = r.created_at
    // is_read is flipped on messages the RECIPIENT has read.
    if (!r.is_read) {
      if (fromTherapist) cur.unreadByClient++   // therapist→client, client hasn't read
      if (fromClient) cur.unreadByTherapist++   // client→therapist, therapist hasn't read
    }
    chatByMatch.set(r.match_id, cur)
  }

  // ── Session monitoring per match (join punctuality + transcript flags) ───────
  // Populated by the Daily webhook. Most recent 5 sessions per match.
  const { data: monitorSessions } = activeMatchIds.length > 0
    ? await admin
        .from('sessions')
        .select('match_id, scheduled_at, status, client_joined_at, therapist_joined_at, client_on_time, therapist_on_time, transcript_flagged, transcript_flag_reason')
        .in('match_id', activeMatchIds)
        .eq('session_type', 'video')
        .order('scheduled_at', { ascending: false })
    : { data: [] }

  const sessionsByMatch = new Map<string, ActiveMatch['sessionMonitor']>()
  for (const s of (monitorSessions ?? []) as any[]) {
    const arr = sessionsByMatch.get(s.match_id) ?? []
    if (arr.length < 5) {
      arr.push({
        scheduled_at: s.scheduled_at,
        status: s.status,
        client_joined_at: s.client_joined_at ?? null,
        therapist_joined_at: s.therapist_joined_at ?? null,
        client_on_time: s.client_on_time ?? null,
        therapist_on_time: s.therapist_on_time ?? null,
        transcript_flagged: s.transcript_flagged ?? false,
        transcript_flag_reason: s.transcript_flag_reason ?? null,
      })
    }
    sessionsByMatch.set(s.match_id, arr)
  }

  const activeMatches: ActiveMatch[] = (allActiveMatches ?? []).map((m: any) => ({
    id: m.id,
    client_id: m.client_id,
    therapist_id: m.therapist_id,
    status: m.status,
    tier: m.tier ?? null,
    notes: m.notes ?? null,
    started_at: m.started_at ?? null,
    created_at: m.created_at,
    client: (matchProfiles ?? []).find((p: any) => p.id === m.client_id) ?? null,
    therapist: (matchProfiles ?? []).find((p: any) => p.id === m.therapist_id) ?? null,
    subscription: (allSubscriptions ?? []).find((s: any) => s.client_id === m.client_id) ?? null,
    flags: flagsByMatch.get(m.id) ?? { count: 0, reasons: [], lastAt: null },
    sessionMonitor: sessionsByMatch.get(m.id) ?? [],
    chatStats: chatByMatch.get(m.id) ?? {
      total: 0, unreadByClient: 0, unreadByTherapist: 0,
      lastMessageAt: null, lastSenderRole: null, lastClientReplyAt: null,
    },
  }))

  const inviteCodes: InviteCode[] = (rawInvites ?? []).map((inv: any) => ({
    id: inv.id,
    code: inv.code,
    created_at: inv.created_at,
    used_by: inv.used_by ?? null,
  }))

  // Generate signed URLs for CVs + certificates so admin can view private files.
  // 1-hour expiry — admin re-fetches the page if links go stale.
  // Two URLs per file: view (inline) and download (Content-Disposition: attachment).
  const SIGNED_URL_TTL = 60 * 60
  async function signDoc(
    path: string | null | undefined,
    downloadAs?: string,
  ): Promise<string | null> {
    if (!path) return null
    const options = downloadAs ? { download: downloadAs } : undefined
    const { data, error } = await admin.storage
      .from('therapist-documents')
      .createSignedUrl(path, SIGNED_URL_TTL, options)
    if (error || !data?.signedUrl) return null
    return data.signedUrl
  }

  function safeName(name: string) {
    return name.replace(/[^a-zA-Z0-9._-]+/g, '_')
  }

  const applications: TherapistApplication[] = await Promise.all(
    (rawApplications ?? []).map(async (a: any) => {
      const nameSlug = safeName(a.full_name ?? 'applicant')
      const cvExt = (a.cv_url as string | null)?.split('.').pop() ?? 'pdf'
      const cvSignedUrl = await signDoc(a.cv_url)
      const cvDownloadUrl = await signDoc(a.cv_url, `${nameSlug}_CV.${cvExt}`)

      const certificateSignedUrls: string[] = []
      const certificateDownloadUrls: string[] = []
      for (let i = 0; i < (a.certificate_urls ?? []).length; i++) {
        const path = (a.certificate_urls as string[])[i]
        const ext = path.split('.').pop() ?? 'pdf'
        const view = await signDoc(path)
        const download = await signDoc(path, `${nameSlug}_Certificate_${i + 1}.${ext}`)
        if (view) certificateSignedUrls.push(view)
        if (download) certificateDownloadUrls.push(download)
      }

      return {
        id: a.id,
        full_name: a.full_name,
        email: a.email,
        email_verified_at: a.email_verified_at ?? null,
        phone: a.phone ?? null,
        city: a.city ?? null,
        state: a.state ?? null,
        country: a.country ?? null,
        gender: a.gender ?? null,
        ethnicity: a.ethnicity ?? null,
        date_of_birth: a.date_of_birth ?? null,
        linkedin_url: a.linkedin_url ?? null,
        license_number: a.license_number ?? null,
        license_body: a.license_body ?? null,
        years_experience: a.years_experience ?? 0,
        education: a.education ?? null,
        expected_session_pay: a.expected_session_pay ?? null,
        expected_session_pay_currency: a.expected_session_pay_currency ?? null,
        specializations: a.specializations ?? [],
        specialization_other: a.specialization_other ?? null,
        languages: a.languages ?? [],
        bio: a.bio ?? null,
        why_mindcanopy: a.why_mindcanopy ?? null,
        cv_signed_url: cvSignedUrl,
        cv_download_url: cvDownloadUrl,
        certificate_signed_urls: certificateSignedUrls,
        certificate_download_urls: certificateDownloadUrls,
        status: a.status,
        admin_notes: a.admin_notes ?? null,
        submitted_at: a.submitted_at,
        reviewed_at: a.reviewed_at ?? null,
      }
    })
  )

  // ── Build switch requests with client + therapist names ──────────────────────
  const switchRequestClientIds: string[] = (rawSwitchRequests ?? []).map((r: any) => r.client_id)
  const switchRequestMatchIds: string[] = (rawSwitchRequests ?? [])
    .map((r: any) => r.match_id)
    .filter(Boolean)

  const [{ data: switchClientProfiles }, { data: switchMatches }] = await Promise.all([
    switchRequestClientIds.length > 0
      ? admin.from('profiles').select('id, full_name').in('id', switchRequestClientIds)
      : Promise.resolve({ data: [] }),
    switchRequestMatchIds.length > 0
      ? admin.from('matches').select('id, therapist_id').in('id', switchRequestMatchIds)
      : Promise.resolve({ data: [] }),
  ])

  const switchTherapistIds: string[] = (switchMatches ?? []).map((m: any) => m.therapist_id).filter(Boolean)
  const { data: switchTherapistProfiles } = switchTherapistIds.length > 0
    ? await admin.from('profiles').select('id, full_name').in('id', switchTherapistIds)
    : { data: [] }

  // ── Email logs (most recent 200) ────────────────────────────────────────────
  const { data: rawEmailLogs } = await admin
    .from('email_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)

  // Resolve recipient names so the admin can search the Emails tab by person,
  // not just by email address. related_user_id is the recipient where known.
  const emailUserIds = Array.from(
    new Set((rawEmailLogs ?? []).map((r: any) => r.related_user_id).filter(Boolean)),
  ) as string[]
  const { data: emailUserProfiles } = emailUserIds.length > 0
    ? await admin.from('profiles').select('id, full_name').in('id', emailUserIds)
    : { data: [] as { id: string; full_name: string }[] }
  const emailNameById = new Map<string, string>(
    (emailUserProfiles ?? []).map((p: any) => [p.id, p.full_name as string]),
  )

  const emailLogs: EmailLog[] = (rawEmailLogs ?? []).map((row: any) => ({
    id: row.id,
    resend_id: row.resend_id ?? null,
    recipient: row.recipient,
    recipient_name: row.related_user_id ? (emailNameById.get(row.related_user_id) ?? null) : null,
    template: row.template,
    subject: row.subject ?? null,
    related_user_id: row.related_user_id ?? null,
    related_application_id: row.related_application_id ?? null,
    related_match_id: row.related_match_id ?? null,
    send_status: row.send_status,
    send_error: row.send_error ?? null,
    resend_status_code: row.resend_status_code ?? null,
    last_status: row.last_status ?? null,
    last_status_at: row.last_status_at ?? null,
    created_at: row.created_at,
  }))

  // Per-template "last sent" + lifetime totals for the Emails > Templates view.
  // Counted over ALL rows (not just the 200 shown in the log) so the numbers are
  // real, and `test:` rows are excluded so test sends never skew them.
  const { data: templateCountRows } = await admin
    .from('email_logs')
    .select('template, created_at, recipient, related_user_id, send_status, last_status')
    .not('template', 'like', 'test:%')
    .order('created_at', { ascending: false })
    .limit(5000)

  // Names for whoever received these, so "who got it" reads as people not addresses.
  const { data: allProfiles } = await admin.from('profiles').select('id, full_name, role')
  const profileById = new Map<string, { name: string; role: string }>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (allProfiles ?? []).map((p: any) => [p.id, {
      name: (p.full_name as string | null) ?? 'Unnamed',
      role: (p.role as string | null) ?? 'client',
    }]),
  )

  const templateStats: Record<string, { lastSentAt: string | null; total: number }> = {}
  // Per-template recipient list, newest first, capped so one busy template can't
  // bloat the payload sent to the browser.
  const RECIPIENTS_PER_TEMPLATE = 50
  const templateRecipients: Record<string, {
    email: string; name: string | null; at: string; failed: boolean; lastStatus: string | null
  }[]> = {}

  for (const row of (templateCountRows ?? []) as {
    template: string; created_at: string; recipient: string
    related_user_id: string | null; send_status: string; last_status: string | null
  }[]) {
    const existing = templateStats[row.template]
    if (existing) {
      existing.total += 1
    } else {
      // Rows arrive newest-first, so the first one seen is the most recent send.
      templateStats[row.template] = { lastSentAt: row.created_at, total: 1 }
    }

    const list = (templateRecipients[row.template] ??= [])
    if (list.length < RECIPIENTS_PER_TEMPLATE) {
      list.push({
        email: row.recipient,
        name: row.related_user_id ? (profileById.get(row.related_user_id)?.name ?? null) : null,
        at: row.created_at,
        failed: row.send_status !== 'sent',
        lastStatus: row.last_status ?? null,
      })
    }
  }

  // ── Session feedback ────────────────────────────────────────────────────────
  // Wrapped in try/catch so the whole admin page still renders if the
  // session_feedback migration has not been run in this environment yet.
  let feedback: FeedbackRow[] = []
  try {
    const { data: rawFeedback } = await admin
      .from('session_feedback')
      .select('id, session_id, client_id, therapist_id, rating, felt_heard, book_again, note, submitted_at, created_at')
      .order('created_at', { ascending: false })
      .limit(300)

    if (rawFeedback?.length) {
      const fbIds = Array.from(new Set(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rawFeedback.flatMap((r: any) => [r.client_id, r.therapist_id]).filter(Boolean),
      )) as string[]
      const { data: fbProfiles } = fbIds.length
        ? await admin.from('profiles').select('id, full_name').in('id', fbIds)
        : { data: [] as { id: string; full_name: string }[] }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fbName = new Map<string, string>((fbProfiles ?? []).map((p: any) => [p.id, p.full_name as string]))

      const sessionIds = Array.from(new Set(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rawFeedback.map((r: any) => r.session_id).filter(Boolean),
      )) as string[]
      const { data: fbSessions } = sessionIds.length
        ? await admin.from('sessions').select('id, scheduled_at').in('id', sessionIds)
        : { data: [] as { id: string; scheduled_at: string }[] }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sessionAt = new Map<string, string>((fbSessions ?? []).map((s: any) => [s.id, s.scheduled_at as string]))

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      feedback = rawFeedback.map((r: any) => ({
        id: r.id,
        sessionId: r.session_id,
        clientName: fbName.get(r.client_id) ?? 'Unknown client',
        therapistName: fbName.get(r.therapist_id) ?? 'Unknown therapist',
        rating: r.rating ?? null,
        feltHeard: r.felt_heard ?? null,
        bookAgain: r.book_again ?? null,
        note: r.note ?? null,
        sessionAt: sessionAt.get(r.session_id) ?? null,
        submitted: !!r.submitted_at,
        createdAt: r.created_at,
      }))
    }
  } catch {
    // Table not present yet. Feedback view will show its empty state.
  }

  // People a test email can be addressed to, without typing an address. Built
  // from the profile map plus authMap (both already fetched above), so this adds
  // no extra queries. Admins first, since they are the usual test target.
  const ROLE_ORDER: Record<string, number> = { admin: 0, therapist: 1, client: 2 }
  const mailRecipients = Array.from(profileById.entries())
    .map(([id, p]) => ({ email: authMap.get(id)?.email ?? '', name: p.name, role: p.role }))
    .filter(r => r.email !== '')
    .sort((a, b) =>
      (ROLE_ORDER[a.role] ?? 9) - (ROLE_ORDER[b.role] ?? 9) || a.name.localeCompare(b.name))
    // Generous cap: the field is searchable, and each entry is only a name,
    // email and role, so the whole list stays a small payload.
    .slice(0, 1000)

  const switchRequests: SwitchRequest[] = (rawSwitchRequests ?? []).map((r: any) => {
    const clientProfile = (switchClientProfiles ?? []).find((p: any) => p.id === r.client_id)
    const matchRow = (switchMatches ?? []).find((m: any) => m.id === r.match_id)
    const therapistProfile = matchRow
      ? (switchTherapistProfiles ?? []).find((p: any) => p.id === matchRow.therapist_id)
      : null
    return {
      id: r.id,
      client_id: r.client_id,
      match_id: r.match_id ?? null,
      reason: r.reason ?? null,
      details: r.details ?? null,
      status: r.status,
      created_at: r.created_at,
      clientName: clientProfile?.full_name ?? 'Unknown client',
      therapistName: therapistProfile?.full_name ?? 'Unknown therapist',
    }
  })

  // ── Leads: unified view of client signups + therapist applications ──────────
  // For the Leads tab we want ALL therapist applications regardless of status,
  // so we fetch them again unfiltered. Client leads come from the existing
  // allClients query (already filtered to role=client).
  const { data: allApplicationsForLeads } = await admin
    .from('therapist_applications')
    .select('id, full_name, email, status, submitted_at, first_utm_source, first_utm_medium, first_utm_campaign, first_utm_term, first_utm_content, last_utm_source, last_utm_medium, last_utm_campaign, last_utm_term, last_utm_content, referrer, landing_page, first_seen_at, extra_params, journey, device_type, device_browser, device_os')
    .order('submitted_at', { ascending: false })

  const clientLeads: Lead[] = (allClients ?? []).map((c: any) => ({
    id: `client-${c.id}`,
    lead_type: 'client',
    name: c.full_name ?? '(no name)',
    email: c.email ?? '',
    created_at: c.created_at,
    status: 'signed_up',
    first_utm_source: c.first_utm_source ?? null,
    first_utm_medium: c.first_utm_medium ?? null,
    first_utm_campaign: c.first_utm_campaign ?? null,
    first_utm_term: c.first_utm_term ?? null,
    first_utm_content: c.first_utm_content ?? null,
    last_utm_source: c.last_utm_source ?? null,
    last_utm_medium: c.last_utm_medium ?? null,
    last_utm_campaign: c.last_utm_campaign ?? null,
    last_utm_term: c.last_utm_term ?? null,
    last_utm_content: c.last_utm_content ?? null,
    referrer: c.referrer ?? null,
    landing_page: c.landing_page ?? null,
    first_seen_at: c.first_seen_at ?? null,
    extra_params: c.extra_params ?? null,
    journey: c.journey ?? null,
    device_type: c.device_type ?? null,
    device_browser: c.device_browser ?? null,
    device_os: c.device_os ?? null,
  }))

  const applicationLeads: Lead[] = (allApplicationsForLeads ?? []).map((a: any) => ({
    id: `app-${a.id}`,
    lead_type: 'therapist',
    name: a.full_name ?? '(no name)',
    email: a.email ?? '',
    created_at: a.submitted_at,
    status: a.status ?? 'pending',
    first_utm_source: a.first_utm_source ?? null,
    first_utm_medium: a.first_utm_medium ?? null,
    first_utm_campaign: a.first_utm_campaign ?? null,
    first_utm_term: a.first_utm_term ?? null,
    first_utm_content: a.first_utm_content ?? null,
    last_utm_source: a.last_utm_source ?? null,
    last_utm_medium: a.last_utm_medium ?? null,
    last_utm_campaign: a.last_utm_campaign ?? null,
    last_utm_term: a.last_utm_term ?? null,
    last_utm_content: a.last_utm_content ?? null,
    referrer: a.referrer ?? null,
    landing_page: a.landing_page ?? null,
    first_seen_at: a.first_seen_at ?? null,
    extra_params: a.extra_params ?? null,
    journey: a.journey ?? null,
    device_type: a.device_type ?? null,
    device_browser: a.device_browser ?? null,
    device_os: a.device_os ?? null,
  }))

  const leads: Lead[] = [...clientLeads, ...applicationLeads]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  // ── Therapist payout balances (Payouts tab) ─────────────────────────────────
  // Across ALL matches (incl. ended), sum each therapist's completed + paid
  // sessions split by payout_status: outstanding (unpaid) vs already settled.
  const { data: allMatchesForPayout } = await admin
    .from('matches').select('id, therapist_id')
  const matchToTherapist = new Map<string, string>(
    (allMatchesForPayout ?? []).map((m: any) => [m.id, m.therapist_id])
  )
  const payoutMatchIds: string[] = (allMatchesForPayout ?? []).map((m: any) => m.id)
  const { data: payoutSessions } = payoutMatchIds.length > 0
    ? await admin.from('sessions')
        .select('match_id, therapist_payout_paise, payout_status')
        .in('match_id', payoutMatchIds)
        .eq('status', 'completed')
        .eq('payment_status', 'paid')
    : { data: [] }

  const payoutAgg = new Map<string, { outstandingPaise: number; outstandingCount: number; paidOutPaise: number }>()
  for (const s of (payoutSessions ?? []) as { match_id: string; therapist_payout_paise: number | null; payout_status: string | null }[]) {
    const tId = matchToTherapist.get(s.match_id)
    if (!tId) continue
    const cur = payoutAgg.get(tId) ?? { outstandingPaise: 0, outstandingCount: 0, paidOutPaise: 0 }
    const amt = s.therapist_payout_paise ?? 0
    if (s.payout_status === 'paid') {
      cur.paidOutPaise += amt
    } else {
      cur.outstandingPaise += amt
      cur.outstandingCount++
    }
    payoutAgg.set(tId, cur)
  }

  const therapistPayouts: TherapistPayoutSummary[] = therapists.map(t => {
    const agg = payoutAgg.get(t.user_id)
    return {
      therapistId: t.user_id,
      therapistName: t.profile?.full_name ?? 'Therapist',
      outstandingPaise: agg?.outstandingPaise ?? 0,
      outstandingCount: agg?.outstandingCount ?? 0,
      paidOutPaise: agg?.paidOutPaise ?? 0,
    }
  })

  // ── Payments (session orders) for the Payments tab ──────────────────────────
  // session_orders is the full payment audit: created (checkout opened) → paid /
  // failed / expired. Newest 200.
  const { data: rawOrders } = await admin
    .from('session_orders')
    .select('order_id, status, client_id, therapist_id, scheduled_at, client_amount_paise, cf_payment_id, created_at, paid_at')
    .order('created_at', { ascending: false })
    .limit(200)

  const orderPartyIds = [...new Set<string>([
    ...(rawOrders ?? []).map((o: any) => o.client_id),
    ...(rawOrders ?? []).map((o: any) => o.therapist_id),
  ])]
  const { data: orderPartyProfiles } = orderPartyIds.length > 0
    ? await admin.from('profiles').select('id, full_name').in('id', orderPartyIds)
    : { data: [] }
  const orderNameById = new Map<string, string>(
    (orderPartyProfiles ?? []).map((p: any) => [p.id, p.full_name])
  )

  const payments: PaymentRow[] = (rawOrders ?? []).map((o: any) => ({
    orderId: o.order_id,
    status: o.status,
    clientName: orderNameById.get(o.client_id) ?? 'Unknown',
    therapistName: orderNameById.get(o.therapist_id) ?? 'Unknown',
    scheduledAt: o.scheduled_at,
    amountPaise: o.client_amount_paise ?? 0,
    cfPaymentId: o.cf_payment_id ?? null,
    createdAt: o.created_at,
    paidAt: o.paid_at ?? null,
  }))

  return (
    <AdminDashboard
      adminName={profile!.full_name}
      unmatchedClients={unmatchedClients}
      therapists={therapists}
      activeMatches={activeMatches}
      totalClientCount={(allClients ?? []).length}
      inviteCodes={inviteCodes}
      applications={applications}
      switchRequests={switchRequests}
      emailLogs={emailLogs}
      templateStats={templateStats}
      templateRecipients={templateRecipients}
      mailRecipients={mailRecipients}
      feedback={feedback}
      leads={leads}
      therapistPayouts={therapistPayouts}
      payments={payments}
    />
  )
}
