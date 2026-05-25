import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ClientNav from '@/components/client/ClientNav'
import { ContactForm } from './ContactForm'

export const dynamic = 'force-dynamic'

export default async function ContactPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .maybeSingle() as { data: { full_name: string; role: string } | null; error: unknown }

  if (!profile || profile.role !== 'client') redirect('/dashboard')

  const { data: match } = await supabase
    .from('matches')
    .select('id')
    .eq('client_id', user.id)
    .eq('status', 'active')
    .maybeSingle() as { data: { id: string } | null; error: unknown }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <ClientNav userName={profile.full_name} isMatched={!!match} />
      <ContactForm />
    </div>
  )
}
