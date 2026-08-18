import type { Event } from '@/types/database'

/**
 * Generate an iCal (.ics) file content for an event
 */
export function generateICS(event: Event, appUrl: string): string {
  const formatDate = (dateStr: string, timeStr: string) => {
    const d = new Date(`${dateStr}T${timeStr}`)
    return d.toISOString().replace(/[-:]/g, '').replace('.000', '')
  }

  const dtStart = formatDate(event.date, event.start_time)
  const dtEnd = event.end_time
    ? formatDate(event.date, event.end_time)
    : formatDate(event.date, '23:59:00')

  const description = [
    event.what_youll_build ? `What you'll build: ${event.what_youll_build}` : '',
    event.components_provided ? `Components provided: ${event.components_provided}` : '',
    event.what_to_bring ? `What to bring: ${event.what_to_bring}` : '',
    `More info: ${appUrl}/events/${event.slug}`,
  ]
    .filter(Boolean)
    .join('\n')

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//VOLT League//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${event.title} — VOLT League`,
    `LOCATION:${event.venue ?? 'TBA'}`,
    `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
    `URL:${appUrl}/events/${event.slug}`,
    `UID:volt-${event.id}@voltleague`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}

/**
 * Generate a Google Calendar link for an event
 */
export function getGoogleCalendarLink(event: Event, appUrl: string): string {
  const formatGCal = (dateStr: string, timeStr: string) => {
    return new Date(`${dateStr}T${timeStr}`)
      .toISOString()
      .replace(/[-:]/g, '')
      .replace('.000', '')
  }

  const start = formatGCal(event.date, event.start_time)
  const end = event.end_time
    ? formatGCal(event.date, event.end_time)
    : formatGCal(event.date, '23:59:00')

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${event.title} — VOLT League`,
    dates: `${start}/${end}`,
    details: `${event.what_youll_build ?? event.description ?? ''}\n\nMore: ${appUrl}/events/${event.slug}`,
    location: event.venue ?? '',
    sf: 'true',
    output: 'xml',
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}
