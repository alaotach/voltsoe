import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { Calendar, Clock, MapPin, Users, AlertCircle, Star, Download, ExternalLink, CheckCircle } from 'lucide-react'
import { formatDate, formatTime, difficultyColor } from '@/lib/utils'
import RegisterButton from './register-button'
import CalendarButton from './calendar-button'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: event } = await supabase.from('events').select('title, description').eq('slug', slug).single()
  return {
    title: event?.title ?? 'Event',
    description: event?.description ?? '',
  }
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: event } = await supabase
    .from('events')
    .select('*, point_rules(label, points, is_active)')
    .eq('slug', slug)
    .in('status', ['published', 'completed'])
    .single()

  if (!event) notFound()

  // Get user registration
  const { data: registration } = await supabase
    .from('registrations')
    .select('status')
    .eq('event_id', event.id)
    .eq('user_id', user.id)
    .maybeSingle()

  // Get registration count
  const { count: regCount } = await supabase
    .from('registrations')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', event.id)

  // Get organizers
  let organizers: { id: string; full_name: string; role: string }[] = []
  if (event.organizer_ids && event.organizer_ids.length > 0) {
    const { data: orgs } = await supabase
      .from('users')
      .select('id, full_name, role')
      .in('id', event.organizer_ids)
    organizers = orgs ?? []
  }

  const isRegistered = !!registration
  const isFull = event.capacity && (regCount ?? 0) >= event.capacity
  const registrationDeadlinePassed = event.registration_deadline && new Date(event.registration_deadline) < new Date()
  const canRegister = event.registration_open && !isRegistered && !isFull && !registrationDeadlinePassed && event.status === 'published'

  const STATUS_LABELS: Record<string, string> = {
    registered: 'Registered ✓',
    checked_in: 'Checked In ✓',
    attended: 'Attended ✓',
    project_submitted: 'Project Submitted ✓',
    points_awarded: 'Points Awarded ✓',
  }

  return (
    <div className="fade-in">
      {/* Back */}
      <a href="/events" style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 20 }}>
        ← Back to Events
      </a>

      {/* Cover image */}
      {event.cover_image_url && (
        <img
          src={event.cover_image_url}
          alt={event.title}
          style={{
            width: '100%',
            height: 'auto',
            maxHeight: 600,
            objectFit: 'contain',
            borderRadius: 'var(--radius-xl)',
            marginBottom: 28,
            backgroundColor: 'rgba(255,255,255,0.02)'
          }}
        />
      )}

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          {event.difficulty && (
            <span className={`badge ${event.difficulty === 'beginner' ? 'badge-green' : event.difficulty === 'intermediate' ? 'badge-yellow' : 'badge-red'}`}>
              {event.difficulty}
            </span>
          )}
          {event.is_team_event && <span className="badge badge-blue">Team Event</span>}
          <span className={`badge ${event.status === 'completed' ? 'badge-gray' : 'badge-green'}`}>{event.status}</span>
        </div>

        <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: 12 }}>{event.title}</h1>

        {/* Meta row */}
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            <Calendar size={14} />
            {formatDate(event.date, { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            <Clock size={14} />
            {formatTime(event.start_time)}{event.end_time ? ` – ${formatTime(event.end_time)}` : ''}
          </div>
          {event.venue && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              <MapPin size={14} />
              {event.venue}
            </div>
          )}
          {event.capacity && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              <Users size={14} />
              {regCount ?? 0} / {event.capacity} registered
            </div>
          )}
        </div>
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {event.description && (
            <div className="card" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>About</h2>
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8, fontSize: '0.9rem' }}>{event.description}</p>
            </div>
          )}

          {event.what_youll_build && (
            <div className="card" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>What You&apos;ll Build</h2>
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8, fontSize: '0.9rem' }}>{event.what_youll_build}</p>
            </div>
          )}

          {(event.components_provided || event.what_to_bring) && (
            <div className="card" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>Preparation</h2>
              {event.components_provided && (
                <div style={{ marginBottom: 14 }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Components Provided</p>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>{event.components_provided}</p>
                </div>
              )}
              {event.what_to_bring && (
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>What to Bring</p>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>{event.what_to_bring}</p>
                </div>
              )}
            </div>
          )}

          {/* Organizers */}
          {organizers.length > 0 && (
            <div className="card" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 14 }}>Organizers</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {organizers.map((org) => (
                  <div key={org.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: 'var(--color-surface-3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                      }}
                    >
                      {org.full_name.charAt(0)}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{org.full_name}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>{org.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 24 }}>
          {/* Registration card */}
          <div className="card" style={{ padding: '24px' }}>
            {/* Status progression */}
            {registration && (
              <div style={{ marginBottom: 16 }}>
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(16,185,129,0.08)',
                    border: '1px solid rgba(16,185,129,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--color-success)',
                  }}
                >
                  <CheckCircle size={16} />
                  {STATUS_LABELS[registration.status] ?? registration.status}
                </div>
              </div>
            )}

            <RegisterButton
              eventId={event.id}
              eventSlug={event.slug}
              canRegister={canRegister}
              isRegistered={isRegistered}
              isFull={!!isFull}
              registrationOpen={event.registration_open}
              status={registration?.status ?? null}
            />

            {event.registration_deadline && (
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 10, textAlign: 'center' }}>
                Deadline: {formatDate(event.registration_deadline, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
              </p>
            )}
          </div>

          {/* Add to calendar */}
          <CalendarButton event={event} />

          {/* Point actions */}
          {(event.point_rules ?? []).filter((r: any) => r.is_active).length > 0 && (
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: 12 }}>Point Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(event.point_rules ?? []).filter((r: any) => r.is_active).map((rule: any) => (
                  <div key={rule.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>{rule.label}</span>
                    <span style={{ fontWeight: 700, color: 'var(--color-volt-yellow)' }}>+{rule.points}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
