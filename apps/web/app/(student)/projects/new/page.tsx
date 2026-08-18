import { getViewingSeason } from '@/lib/season'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NewProjectForm from './new-project-form'

export const metadata: Metadata = {
  title: 'Submit Project',
  description: 'Share what you built with the VOLT League community.',
}

export default async function NewProjectPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('users').select('is_verified, email_verified').eq('id', user.id).single()

  const season = await getViewingSeason()

  const { data: events } = await supabase
    .from('events')
    .select('id, title')
    .eq('season_id', season?.id ?? '')
    .in('status', ['published', 'completed'])
    .order('date', { ascending: false })

  return (
    <div className="fade-in">
      <a href="/projects" style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 20 }}>← Back to Projects</a>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: 6 }}>Submit a Project</h1>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: 28 }}>Share what you built with the community.</p>

      {!profile?.is_verified && (
        <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'rgba(245,197,24,0.08)', border: '1px solid rgba(245,197,24,0.2)', marginBottom: 20, fontSize: '0.875rem', color: 'var(--color-warning)' }}>
          Your account is pending admin verification. Projects will be visible once verified.
        </div>
      )}

      <NewProjectForm userId={user.id} seasonId={season?.id ?? ''} events={events ?? []} />
    </div>
  )
}
