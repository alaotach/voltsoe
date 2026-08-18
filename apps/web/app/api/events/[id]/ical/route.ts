import { createClient } from '@/lib/supabase/server'
import { generateICS } from '@/lib/calendar'
import { NextResponse } from 'next/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params
  const supabase = await createClient()

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .in('status', ['published', 'completed'])
    .single()

  if (!event) {
    return NextResponse.json({ error: 'Event not found.' }, { status: 404 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://volt.club'
  const ics = generateICS(event, appUrl)

  return new Response(ics, {
    headers: {
      'Content-Type': 'text/calendar',
      'Content-Disposition': `attachment; filename="${event.slug}.ics"`,
    },
  })
}
