import { createClient } from '@/lib/supabase/server'
import { logAdminAction } from '@/lib/points'
import { checkAndAwardBadges } from '@/lib/badges'
import { createNotification, notificationTemplates } from '@/lib/notifications'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: adminProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const allowedRoles = ['core', 'vp', 'president', 'super_admin']
  if (!adminProfile || !allowedRoles.includes(adminProfile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { studentId, overrideReason } = body

  if (!studentId) {
    return NextResponse.json({ error: 'studentId required' }, { status: 400 })
  }

  const { data: event } = await supabase.from('events').select('title, season_id').eq('id', eventId).single()
  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

  // Upsert attendance
  const { error } = await supabase.from('attendance').upsert(
    {
      event_id: eventId,
      user_id: studentId,
      marked_by: user.id,
      method: overrideReason ? 'manual' : 'manual',
      override_reason: overrideReason ?? null,
    },
    { onConflict: 'event_id,user_id' }
  )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Update registration status
  await supabase
    .from('registrations')
    .update({ status: 'attended' })
    .eq('event_id', eventId)
    .eq('user_id', studentId)
    .in('status', ['registered', 'checked_in'])

  // Create notification for student
  const tmpl = notificationTemplates.attendance_confirmed(event.title)
  await createNotification({ userId: studentId, type: 'attendance_confirmed', title: tmpl.title, body: tmpl.body })

  // Log admin action
  await logAdminAction({
    adminId: user.id,
    action: 'mark_attendance',
    targetType: 'user',
    targetId: studentId,
    metadata: { eventId, overrideReason },
  })

  // Check badge awards
  await checkAndAwardBadges(studentId, event.season_id)

  return NextResponse.json({ success: true })
}
