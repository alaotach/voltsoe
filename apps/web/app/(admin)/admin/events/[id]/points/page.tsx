import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import PointsManager from './points-manager'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = { title: 'Event Points' }

export default async function EventPointsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: eventId } = await params
  const supabase = await createClient()

  // Get event
  const { data: event } = await supabase.from('events').select('*').eq('id', eventId).single()
  if (!event) notFound()

  // Get attendees (users who are registered and checked in, or just anyone registered)
  const { data: registrations } = await supabase
    .from('registrations')
    .select('*, users(id, full_name, enrollment_number, avatar_url)')
    .eq('event_id', eventId)

  // Get point transactions for this event
  const { data: transactions } = await supabase
    .from('point_transactions')
    .select('*, users!point_transactions_user_id_fkey(full_name)')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })

  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="fade-in">
      <a href="/admin/events" style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 20 }}>← Events</a>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 900 }}>{event.title} — Points</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>{formatDate(event.date, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      </div>

      <PointsManager 
        eventId={eventId} 
        seasonId={event.season_id}
        awardedBy={user?.id ?? ''}
        attendees={(registrations ?? []).map((r) => ({
          userId: (r.users as any)?.id,
          fullName: (r.users as any)?.full_name,
          enrollment: (r.users as any)?.enrollment_number,
        }))}
        transactions={(transactions ?? []).map((t) => ({
          id: t.id,
          userId: t.user_id,
          userName: (t.users as any)?.full_name,
          points: t.points,
          reason: t.reason,
          date: t.created_at,
        }))}
      />
    </div>
  )
}
