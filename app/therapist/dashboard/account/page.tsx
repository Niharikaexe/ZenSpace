import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TherapistNav } from '@/components/therapist/TherapistNav'
import { TherapistAccountForm } from '@/components/therapist/TherapistAccountForm'

export const dynamic = 'force-dynamic'

export default async function TherapistAccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single() as { data: { role: string; full_name: string } | null; error: unknown }

  if (profile?.role !== 'therapist') redirect('/login')

  const admin = createAdminClient()
  const { data: tProfile } = await (admin as any)
    .from('therapist_profiles')
    .select('bio, approach, years_experience, weekly_capacity, specializations, languages, accepts_new_clients, is_verified')
    .eq('user_id', user.id)
    .maybeSingle()

  const initialData = {
    fullName: profile!.full_name,
    email: user.email ?? '',
    bio: tProfile?.bio ?? '',
    approach: tProfile?.approach ?? '',
    yearsExperience: tProfile?.years_experience ?? 0,
    weeklyCapacity: tProfile?.weekly_capacity ?? 10,
    specializations: (tProfile?.specializations as string[]) ?? [],
    languages: (tProfile?.languages as string[]) ?? ['English'],
    acceptsNewClients: tProfile?.accepts_new_clients ?? true,
    isVerified: tProfile?.is_verified ?? false,
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <TherapistNav therapistName={profile!.full_name} />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1
            className="text-2xl font-black text-[#233551]"
            style={{ fontFamily: 'var(--font-lato)' }}
          >
            My Account
          </h1>
          <p className="text-sm text-[#233551]/45 mt-1">
            Update your profile, specialisations, and availability.
          </p>
        </div>

        <TherapistAccountForm initialData={initialData} />
      </main>
    </div>
  )
}
