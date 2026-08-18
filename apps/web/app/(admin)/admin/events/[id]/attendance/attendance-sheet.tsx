'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader2, Search } from 'lucide-react'

interface Student {
  userId: string
  fullName: string
  enrollmentNumber: string
  department: string
  status: string
  attended: boolean
}

export default function AttendanceSheet({
  eventId,
  registrations,
}: {
  eventId: string
  registrations: Student[]
}) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState<string | null>(null)
  const [attended, setAttended] = useState<Set<string>>(
    new Set(registrations.filter((r) => r.attended).map((r) => r.userId))
  )

  const filtered = registrations.filter(
    (r) =>
      r.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      r.enrollmentNumber?.toLowerCase().includes(search.toLowerCase())
  )

  async function markAttended(userId: string) {
    setLoading(userId)
    const res = await fetch(`/api/events/${eventId}/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: userId }),
    })
    if (res.ok) {
      setAttended((prev) => new Set([...prev, userId]))
      router.refresh()
    }
    setLoading(null)
  }

  return (
    <div>
      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 16, maxWidth: 400 }}>
        <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or enrollment..."
          style={{ paddingLeft: 36 }}
        />
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Enrollment</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((student) => {
              const isAttended = attended.has(student.userId)
              const isLoading = loading === student.userId
              return (
                <tr key={student.userId} style={{ background: isAttended ? 'rgba(16,185,129,0.04)' : undefined }}>
                  <td>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{student.fullName}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{student.department?.split(' ').map((w: string) => w[0]).join('').slice(0, 4)}</p>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{student.enrollmentNumber}</td>
                  <td>
                    {isAttended ? (
                      <span className="badge badge-green">✓ Attended</span>
                    ) : (
                      <span className="badge badge-gray">{student.status}</span>
                    )}
                  </td>
                  <td>
                    {!isAttended && (
                      <button
                        onClick={() => markAttended(student.userId)}
                        disabled={isLoading}
                        className="btn btn-secondary btn-sm"
                      >
                        {isLoading ? <Loader2 size={12} className="animate-spin" /> : <><Check size={12} /> Mark Attended</>}
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>No students found.</p>
        )}
      </div>
    </div>
  )
}
