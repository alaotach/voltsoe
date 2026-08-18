'use client'

import { CalendarPlus, ExternalLink } from 'lucide-react'
import { generateICS, getGoogleCalendarLink } from '@/lib/calendar'
import type { Event } from '@/types/database'

export default function CalendarButton({ event }: { event: Event }) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://volt.club'

  function downloadICS() {
    const ics = generateICS(event, appUrl)
    const blob = new Blob([ics], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${event.slug}.ics`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="card" style={{ padding: '16px 20px' }}>
      <h3 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: 12 }}>Add to Calendar</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button onClick={downloadICS} className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }}>
          <CalendarPlus size={14} /> Download .ics
        </button>
        <a
          href={getGoogleCalendarLink(event, appUrl)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary btn-sm"
          style={{ justifyContent: 'flex-start' }}
        >
          <ExternalLink size={14} /> Google Calendar
        </a>
      </div>
    </div>
  )
}
