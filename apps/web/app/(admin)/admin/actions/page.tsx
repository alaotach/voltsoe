import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { ScrollText } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = { title: 'Admin Action Log' }

export default async function AdminActionsPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string }>
}) {
  const { action: filterAction } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('admin_actions')
    .select('*, users(full_name)')
    .order('created_at', { ascending: false })
    .limit(200)

  if (filterAction) query = query.eq('action', filterAction)

  const { data: actions } = await query

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 900 }}>Admin Action Log</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: 4 }}>Append-only audit trail. Nothing can be deleted.</p>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Admin</th>
              <th>Action</th>
              <th>Target</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {(actions ?? []).map((action) => (
              <tr key={action.id}>
                <td style={{ fontWeight: 600, fontSize: '0.875rem' }}>{(action.users as any)?.full_name ?? 'Unknown'}</td>
                <td><span className="badge badge-gray" style={{ fontSize: '0.7rem' }}>{action.action.replace(/_/g, ' ')}</span></td>
                <td style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  {action.target_type && <span>{action.target_type} </span>}
                  {action.target_id && <span style={{ fontFamily: 'monospace' }}>{action.target_id.slice(0, 8)}...</span>}
                </td>
                <td style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                  {formatDate(action.created_at, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(actions ?? []).length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <ScrollText size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p>No actions logged yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
