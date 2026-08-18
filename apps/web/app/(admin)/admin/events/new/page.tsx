import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import NewEventForm from './new-event-form'
import { getViewingSeason } from '@/lib/season'

export const metadata: Metadata = { title: 'New Event' }

export default async function NewEventPage() {
  const supabase = await createClient()
  
  const season = await getViewingSeason(true)
  if (!season) {
    return (
      <div className="fade-in card" style={{ padding: 40, textAlign: 'center' }}>
        <h2>No Active Season</h2>
        <p style={{ color: 'var(--color-text-muted)', marginTop: 8 }}>Please set an active season or enter preview mode before creating events.</p>
      </div>
    )
  }

  const { data: events } = await supabase.from('events').select('id, title, slug').eq('season_id', season.id).eq('status', 'completed')

  const { data: { user } } = await supabase.auth.getUser()
  const { data: admins } = await supabase.from('users').select('id, full_name, role').in('role', ['core', 'vp', 'president', 'super_admin'])

  return (
    <div className="fade-in">
      <a href="/admin/events" style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 20 }}>← Back to Events</a>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 28 }}>Create New Event</h1>
      <NewEventForm
        seasonId={season.id}
        createdBy={user?.id ?? ''}
        pastEvents={events ?? []}
        organizers={admins ?? []}
      />
    </div>
  )
}
