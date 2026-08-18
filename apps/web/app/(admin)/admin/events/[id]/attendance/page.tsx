import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import AttendanceSheet from './attendance-sheet'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = { title: 'Attendance' }

export default async function AttendancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: eventId } = await params
  const supabase = await createClient()

  const { data: event } = await supabase.from('events').select('*').eq('id', eventId).single()
  if (!event) notFound()

  // Get all registrations with user info
  const { data: registrations } = await supabase
    .from('registrations')
    .select('*, users(id, full_name, enrollment_number, department)')
    .eq('event_id', eventId)
    .order('registered_at', { ascending: true })

  // Get existing attendance
  const { data: attendance } = await supabase
    .from('attendance')
    .select('user_id, checked_in_at')
    .eq('event_id', eventId)

  const attendedSet = new Set((attendance ?? []).map((a) => a.user_id))

  return (
    <div className="fade-in">
      <a href="/admin/events" style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 20 }}>← Events</a>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 900 }}>{event.title} — Attendance</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>{formatDate(event.date, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        <div className="stat-box" style={{ flexDirection: 'row', gap: 16, padding: '12px 20px' }}>
          <span style={{ fontWeight: 800, color: 'var(--color-success)' }}>{attendedSet.size}</span>
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>marked</span>
          <span style={{ color: 'var(--color-border)' }}>|</span>
          <span style={{ fontWeight: 800 }}>{(registrations ?? []).length}</span>
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>registered</span>
        </div>
      </div>

      <AttendanceSheet
        eventId={eventId}
        registrations={(registrations ?? []).map((r) => ({
          userId: (r.users as any)?.id,
          fullName: (r.users as any)?.full_name,
          enrollmentNumber: (r.users as any)?.enrollment_number,
          department: (r.users as any)?.department,
          status: r.status,
          attended: attendedSet.has((r.users as any)?.id),
        }))}
      />
    </div>
  )
}
