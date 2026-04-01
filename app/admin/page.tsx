import { createAdminClient, createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminDashboard from '@/components/admin/AdminDashboard'
import type {
  UnmatchedClient,
  TherapistWithProfile,
  ActiveMatch,
  InviteCode,
  TherapistApplication,
} from '@/components/admin/AdminDashboard'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  // ── Auth check ──────────────────────────────────────────────────────────────
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
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
  ] = await Promise.all([
    admin.from('profiles')
      .select('id, full_name, avatar_url, created_at')
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
  ])

  // ── Build unmatched clients ──────────────────────────────────────────────────
  const unmatchedClients: UnmatchedClient[] = (allClients ?? [])
    .filter((c: any) => !matchedClientIds.has(c.id))
    .map((c: any) => ({
      id: c.id,
      full_name: c.full_name,
      avatar_url: c.avatar_url ?? null,
      created_at: c.created_at,
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

  const activeMatches: ActiveMatch[] = (allActiveMatches ?? []).map((m: any) => ({
    id: m.id,
    client_id: m.client_id,
    therapist_id: m.therapist_id,
    status: m.status,
    notes: m.notes ?? null,
    started_at: m.started_at ?? null,
    created_at: m.created_at,
    client: (matchProfiles ?? []).find((p: any) => p.id === m.client_id) ?? null,
    therapist: (matchProfiles ?? []).find((p: any) => p.id === m.therapist_id) ?? null,
    subscription: (allSubscriptions ?? []).find((s: any) => s.client_id === m.client_id) ?? null,
  }))

  const inviteCodes: InviteCode[] = (rawInvites ?? []).map((inv: any) => ({
    id: inv.id,
    code: inv.code,
    created_at: inv.created_at,
    used_by: inv.used_by ?? null,
  }))

  const applications: TherapistApplication[] = (rawApplications ?? []).map((a: any) => ({
    id: a.id,
    full_name: a.full_name,
    email: a.email,
    phone: a.phone ?? null,
    city: a.city ?? null,
    license_number: a.license_number,
    license_body: a.license_body ?? null,
    years_experience: a.years_experience ?? 0,
    education: a.education ?? null,
    specializations: a.specializations ?? [],
    languages: a.languages ?? [],
    bio: a.bio,
    why_zenspace: a.why_zenspace ?? null,
    status: a.status,
    submitted_at: a.submitted_at,
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
    />
  )
}
