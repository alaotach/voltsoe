import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check user is verified
  const { data: profile } = await supabase
    .from('users')
    .select('is_verified, email_verified, is_suspended')
    .eq('id', user.id)
    .single()

  if (!profile?.email_verified) {
    return NextResponse.json({ error: 'Email not verified.' }, { status: 403 })
  }
  if (!profile?.is_verified) {
    return NextResponse.json({ error: 'Account pending admin verification.' }, { status: 403 })
  }
  if (profile?.is_suspended) {
    return NextResponse.json({ error: 'Account suspended.' }, { status: 403 })
  }

  // Check event exists and is open
  const { data: event } = await supabase
    .from('events')
    .select('id, registration_open, registration_deadline, status, capacity')
    .eq('id', eventId)
    .eq('status', 'published')
    .single()

  if (!event) {
    return NextResponse.json({ error: 'Event not found or not published.' }, { status: 404 })
  }

  if (!event.registration_open) {
    return NextResponse.json({ error: 'Registration is closed.' }, { status: 400 })
  }

  if (event.registration_deadline && new Date(event.registration_deadline) < new Date()) {
    return NextResponse.json({ error: 'Registration deadline has passed.' }, { status: 400 })
  }

  // Check capacity
  if (event.capacity) {
    const { count } = await supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)
    if ((count ?? 0) >= event.capacity) {
      return NextResponse.json({ error: 'Event is full.' }, { status: 400 })
    }
  }

  // Insert registration
  const { error } = await supabase.from('registrations').insert({
    event_id: eventId,
    user_id: user.id,
    status: 'registered',
  })

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Already registered.' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
