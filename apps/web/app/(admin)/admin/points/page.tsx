import { getViewingSeason } from '@/lib/season'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Zap } from 'lucide-react'

export const metadata: Metadata = { title: 'Points Management' }
export const dynamic = 'force-dynamic'

export default async function AdminPointsPage() {
  const supabase = await createClient()
  const season = await getViewingSeason(true)

  const { data: transactions } = await supabase
    .from('point_transactions')
    .select('*, user:users(full_name, enrollment_number), event:events(title)')
    .eq('season_id', season?.id ?? '')
    .order('created_at', { ascending: false })
    .limit(100)

  const { data: rules } = await supabase
    .from('point_rules')
    .select('*')
    .eq('season_id', season?.id ?? '')
    .eq('is_active', true)

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.03em' }}>Points</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
            Award points to students via an event's detail page.
          </p>
        </div>
        <Link href="/admin/events" className="btn btn-primary btn-sm"><Zap size={14} /> Go to Events</Link>
      </div>

      {/* Point Rules */}
      <div className="card" style={{ marginBottom: 24, padding: '20px 24px' }}>
        <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 16 }}>Active Point Rules</h2>
        {(rules ?? []).length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>No rules configured for this season.</p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {(rules ?? []).map((r) => (
              <div key={r.id} className="badge badge-purple" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                {r.label} — <strong>{r.points} pts</strong>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transaction Log */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', fontWeight: 700 }}>
          Recent Transactions
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Event</th>
              <th>Reason</th>
              <th>Points</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {(transactions ?? []).map((tx) => (
              <tr key={tx.id}>
                <td>
                  <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{(tx.user as any)?.full_name ?? '—'}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{(tx.user as any)?.enrollment_number}</p>
                </td>
                <td style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{(tx.event as any)?.title ?? '—'}</td>
                <td style={{ fontSize: '0.8rem' }}>{tx.reason}</td>
                <td>
                  <span className={`badge ${tx.points >= 0 ? 'badge-green' : 'badge-red'}`}>
                    {tx.points >= 0 ? '+' : ''}{tx.points}
                  </span>
                </td>
                <td style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  {new Date(tx.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(transactions ?? []).length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <p>No point transactions yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
