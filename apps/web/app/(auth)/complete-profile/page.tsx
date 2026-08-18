import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CompleteProfileForm from './complete-profile-form'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Complete Your Profile',
  description: 'Set up your VOLT League student profile.',
}

export default async function CompleteProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Check if profile already complete
  const { data: profile } = await supabase
    .from('users')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()

  if (profile) redirect('/dashboard')

  return <CompleteProfileForm userId={user.id} email={user.email!} fullName={user.user_metadata?.full_name ?? ''} />
}
