import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Users, Check, X, Clock } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = { title: 'Student Management' }

export default async function AdminStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; q?: string }>
}) {
  const { filter = 'all', q = '' } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  if (filter === 'verified') query = query.eq('is_verified', true)
  else if (filter === 'pending') query = query.eq('is_verified', false)
  else if (filter === 'suspended') query = query.eq('is_suspended', true)

  if (q) query = query.ilike('full_name', `%${q}%`)

  const { data: students } = await query.limit(100)

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 900 }}>Students</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          {['all', 'verified', 'pending', 'suspended'].map((f) => (
            <Link key={f} href={`/admin/students?filter=${f}`} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`} style={{ textTransform: 'capitalize' }}>{f}</Link>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="input-group" style={{ marginBottom: 20, maxWidth: 360 }}>
        <form method="GET">
          <input type="hidden" name="filter" value={filter} />
          <input type="text" name="q" defaultValue={q} placeholder="Search by name..." />
        </form>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Enrollment</th>
              <th>Batch</th>
              <th>Dept</th>
              <th>Joined</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(students ?? []).map((student) => (
              <tr key={student.id}>
                <td style={{ fontWeight: 600, fontSize: '0.875rem' }}>{student.full_name}</td>
                <td style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>{student.enrollment_number}</td>
                <td style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{student.batch}</td>
                <td style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{student.department?.split(' ').map((w: string) => w[0]).join('').slice(0, 4)}</td>
                <td style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{formatDate(student.created_at, { month: 'short', day: 'numeric' })}</td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {student.is_verified ? <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>Verified</span> : <span className="badge badge-yellow" style={{ fontSize: '0.65rem' }}>Pending</span>}
                    {student.is_suspended && <span className="badge badge-red" style={{ fontSize: '0.65rem' }}>Suspended</span>}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {!student.is_verified && (
                      <form action="/api/admin/students/verify" method="POST">
                        <input type="hidden" name="userId" value={student.id} />
                        <button type="submit" className="btn btn-ghost btn-sm" style={{ padding: '4px 8px', color: 'var(--color-success)' }} title="Verify">
                          <Check size={13} />
                        </button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(students ?? []).length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <Users size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p>No students found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
