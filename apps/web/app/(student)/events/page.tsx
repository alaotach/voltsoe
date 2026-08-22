import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Clock, MapPin, Users, Lock, ChevronRight } from 'lucide-react'
import { formatDate, formatTime, difficultyColor } from '@/lib/utils'
import { getViewingSeason } from '@/lib/season'

export const metadata: Metadata = {
  title: 'Events',
  description: 'All workshops and events in the active VOLT League season.',
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  const { filter = 'upcoming' } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const season = await getViewingSeason(false)

  const today = new Date().toISOString().split('T')[0]

  let eventsQuery = supabase
    .from('events')
    .select('*')
    .in('status', ['published', 'completed'])

  if (season) eventsQuery = eventsQuery.eq('season_id', season.id)

  if (filter === 'upcoming') eventsQuery = eventsQuery.gte('date', today)
  else if (filter === 'past') eventsQuery = eventsQuery.lt('date', today)

  eventsQuery = eventsQuery.order('date', { ascending: filter !== 'past' })

  const { data: allEvents } = await eventsQuery

  // Get user's registrations
  const eventIds = (allEvents ?? []).map((e) => e.id)
  const { data: registrations } = user ? await supabase
    .from('registrations')
    .select('event_id, status')
    .eq('user_id', user.id)
    .in('event_id', eventIds) : { data: [] }

  const regMap = Object.fromEntries((registrations ?? []).map((r) => [r.event_id, r.status]))

  // Get registration counts
  const { data: regCounts } = await supabase
    .from('registrations')
    .select('event_id')
    .in('event_id', eventIds)

  const countMap: Record<string, number> = {}
  for (const r of regCounts ?? []) {
    countMap[r.event_id] = (countMap[r.event_id] ?? 0) + 1
  }

  // Filter registered for 'registered' tab
  const events = filter === 'registered'
    ? (allEvents ?? []).filter((e) => regMap[e.id])
    : (allEvents ?? [])

  const FILTERS = [
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'past', label: 'Past' },
    { key: 'registered', label: 'Registered' },
  ]

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: 6 }}>Events</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Workshops, competitions and more this season.</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
        {FILTERS.map(({ key, label }) => (
          <Link
            key={key}
            href={`/events?filter=${key}`}
            className={`btn btn-sm ${filter === key ? 'btn-primary' : 'btn-secondary'}`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Events grid */}
      {events.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-muted)' }}>
          <Calendar size={40} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <p>No events found.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {events.map((event) => {
            const regStatus = regMap[event.id] ?? null
            const regCount = countMap[event.id] ?? 0
            const isFull = event.capacity && regCount >= event.capacity
            const isPast = event.date < today

            return (
              <Link
                key={event.id}
                href={`/events/${event.slug}`}
                className="card card-hover"
                style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', textDecoration: 'none' }}
              >
                {/* Cover */}
                {event.cover_image_url ? (
                  <img
                    src={event.cover_image_url}
                    alt={event.title}
                    style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'contain' }}
                  />
                ) : (
                  <div
                    style={{
                      height: 160,
                      background: 'linear-gradient(135deg, rgba(245,197,24,0.1) 0%, rgba(124,58,237,0.1) 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Calendar size={40} style={{ opacity: 0.3 }} />
                  </div>
                )}

                <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {/* Badges row */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {event.difficulty && (
                      <span className={`badge ${difficultyColor(event.difficulty).includes('emerald') ? 'badge-green' : difficultyColor(event.difficulty).includes('amber') ? 'badge-yellow' : 'badge-red'}`}>
                        {event.difficulty}
                      </span>
                    )}
                    {regStatus && <span className="badge badge-blue">{regStatus.replace(/_/g, ' ')}</span>}
                    {isFull && !regStatus && <span className="badge badge-red">Full</span>}
                    {isPast && <span className="badge badge-gray">Past</span>}
                  </div>

                  <h3 style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.02em' }}>{event.title}</h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      <Calendar size={13} />
                      {formatDate(event.date, { weekday: 'short', month: 'short', day: 'numeric' })}
                      <Clock size={13} />
                      {formatTime(event.start_time)}
                    </div>
                    {event.venue && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        <MapPin size={13} />
                        {event.venue}
                      </div>
                    )}
                    {event.capacity && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        <Users size={13} />
                        {regCount} / {event.capacity} registered
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {!regStatus && event.registration_open && !isFull && !isPast ? (
                      <span className="badge badge-yellow">Registration Open</span>
                    ) : !regStatus && !isPast ? (
                      <span className="badge badge-gray">Registration Closed</span>
                    ) : <span />}
                    <ChevronRight size={16} color="var(--color-text-muted)" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
