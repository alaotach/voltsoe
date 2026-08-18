import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Bell } from 'lucide-react'

export const metadata: Metadata = { title: 'Notifications — Admin' }
export const dynamic = 'force-dynamic'

export default async function AdminNotificationsPage() {
  const supabase = await createClient()

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*, user:users(full_name)')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.03em' }}>Notifications</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
          System-generated notifications sent to students.
        </p>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Recipient</th>
              <th>Title</th>
              <th>Type</th>
              <th>Read</th>
              <th>Sent</th>
            </tr>
          </thead>
          <tbody>
            {(notifications ?? []).map((n) => (
              <tr key={n.id}>
                <td style={{ fontSize: '0.875rem' }}>{(n.user as any)?.full_name ?? '—'}</td>
                <td>
                  <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{n.title}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{n.body}</p>
                </td>
                <td><span className="badge badge-gray" style={{ fontSize: '0.7rem' }}>{n.type ?? 'general'}</span></td>
                <td>
                  <span className={`badge ${n.is_read ? 'badge-green' : 'badge-gray'}`}>
                    {n.is_read ? 'Read' : 'Unread'}
                  </span>
                </td>
                <td style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  {new Date(n.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(notifications ?? []).length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <Bell size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
            <p>No notifications sent yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
