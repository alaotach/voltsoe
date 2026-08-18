import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Calendar, Users, Eye } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { getViewingSeason } from '@/lib/season'

export const metadata: Metadata = { title: 'Event Management' }

export default async function AdminEventsPage() {
  const supabase = await createClient()
  const season = await getViewingSeason(true)

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('season_id', season?.id ?? '')
    .order('date', { ascending: false })

  const STATUS_COLORS: Record<string, string> = {
    draft: 'badge-gray',
    published: 'badge-green',
    completed: 'badge-blue',
    cancelled: 'badge-red',
  }

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.03em' }}>Events</h1>
        <Link href="/admin/events/new" className="btn btn-primary btn-sm"><Plus size={14} /> New Event</Link>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Date</th>
              <th>Status</th>
              <th>Registered</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(events ?? []).map((ev) => (
              <tr key={ev.id}>
                <td>
                  <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{ev.title}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{ev.venue ?? 'No venue'}</p>
                </td>
                <td style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{formatDate(ev.date, { month: 'short', day: 'numeric' })}</td>
                <td><span className={`badge ${STATUS_COLORS[ev.status] ?? 'badge-gray'}`}>{ev.status}</span></td>
                <td style={{ fontSize: '0.875rem' }}>—</td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Link href={`/admin/events/${ev.id}`} className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }}><Eye size={13} /></Link>
                    <Link href={`/admin/events/${ev.id}/attendance`} className="btn btn-secondary btn-sm">Attendance</Link>
                    <Link href={`/admin/events/${ev.id}/points`} className="btn btn-secondary btn-sm">Points</Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(events ?? []).length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <p>No events yet. <Link href="/admin/events/new" style={{ color: 'var(--color-volt-yellow)' }}>Create one.</Link></p>
          </div>
        )}
      </div>
    </div>
  )
}
