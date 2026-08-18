import { getViewingSeason } from '@/lib/season'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Users, Zap, TrendingUp, Clock } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = { title: 'Admin Overview' }

export default async function AdminOverviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const season = await getViewingSeason(true)
  const today = new Date().toISOString().split('T')[0]

  const { data: seasonEvents } = await supabase.from('events').select('id').eq('season_id', season?.id ?? '')
  const eventIds = (seasonEvents ?? []).map(e => e.id)

  const [totalUsers, activeUsers, eventsCompleted, totalRegistrations, recentActions, upcomingEvents] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('point_transactions').select('user_id').eq('season_id', season?.id ?? '').limit(1000),
    supabase.from('events').select('id', { count: 'exact', head: true }).eq('status', 'completed').eq('season_id', season?.id ?? ''),
    supabase.from('registrations').select('id', { count: 'exact', head: true }).in('event_id', eventIds.length > 0 ? eventIds : ['00000000-0000-0000-0000-000000000000']),
    supabase.from('admin_actions').select('*, users(full_name)').order('created_at', { ascending: false }).limit(10),
    supabase.from('events').select('*, registrations(id)').eq('season_id', season?.id ?? '').eq('status', 'published').gte('date', today).order('date', { ascending: true }).limit(5),
  ])

  const activeParticipants = new Set((activeUsers.data ?? []).map((r: any) => r.user_id)).size

  const { data: totalPts } = await supabase.from('point_transactions').select('points').eq('season_id', season?.id ?? '')
  const totalPoints = (totalPts ?? []).reduce((sum: number, t: any) => sum + t.points, 0)

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Admin Panel</p>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.04em' }}>{season?.name ?? 'Overview'}</h1>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'Total Students', value: totalUsers.count ?? 0, icon: Users, color: '#60A5FA' },
          { label: 'Active This Season', value: activeParticipants, icon: TrendingUp, color: '#34D399' },
          { label: 'Events Completed', value: eventsCompleted.count ?? 0, icon: Calendar, color: '#F5C518' },
          { label: 'Registrations', value: totalRegistrations.count ?? 0, icon: Users, color: '#A78BFA' },
          { label: 'Points Awarded', value: totalPoints, icon: Zap, color: '#FB923C' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="stat-box">
            <Icon size={14} color={color} />
            <div className="stat-value" style={{ color, fontSize: '1.5rem' }}>{typeof value === 'number' ? value.toLocaleString() : value}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Upcoming events */}
        <div>
          <div className="section-title"><Calendar size={15} /> Upcoming Events</div>
          <div className="card" style={{ overflow: 'hidden' }}>
            {(upcomingEvents.data ?? []).length === 0 ? (
              <p style={{ padding: '20px', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>No upcoming events.</p>
            ) : (
              <table className="data-table">
                <thead><tr><th>Event</th><th>Registered</th><th>Date</th></tr></thead>
                <tbody>
                  {(upcomingEvents.data ?? []).map((ev: any) => (
                    <tr key={ev.id}>
                      <td><Link href={`/admin/events/${ev.id}`} style={{ fontWeight: 600, fontSize: '0.875rem' }}>{ev.title}</Link></td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        {ev.registrations?.length ?? 0}{ev.capacity ? ` / ${ev.capacity}` : ''}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{formatDate(ev.date, { month: 'short', day: 'numeric' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Recent admin actions */}
        <div>
          <div className="section-title"><Clock size={15} /> Recent Actions</div>
          <div className="card" style={{ overflow: 'hidden' }}>
            {(recentActions.data ?? []).length === 0 ? (
              <p style={{ padding: '20px', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>No actions yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {(recentActions.data ?? []).slice(0, 8).map((action: any) => (
                  <div key={action.id} style={{ padding: '10px 16px', borderBottom: '1px solid var(--color-border)', fontSize: '0.8rem' }}>
                    <span style={{ fontWeight: 600 }}>{(action.users as any)?.full_name ?? 'Admin'}</span>
                    <span style={{ color: 'var(--color-text-muted)', marginLeft: 6 }}>{action.action.replace(/_/g, ' ')}</span>
                    <span style={{ float: 'right', color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>
                      {formatDate(action.created_at, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
