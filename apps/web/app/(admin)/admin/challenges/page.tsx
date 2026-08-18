import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Trophy, Clock, Star } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { getViewingSeason } from '@/lib/season'

export const metadata: Metadata = { title: 'Challenges Management' }
export const dynamic = 'force-dynamic'

export default async function AdminChallengesPage() {
  const supabase = await createClient()
  const season = await getViewingSeason(true)

  if (!season) {
    return (
      <div className="fade-in card" style={{ padding: 40, textAlign: 'center' }}>
        <h2>No Active Season</h2>
        <p style={{ color: 'var(--color-text-muted)', marginTop: 8 }}>Please set an active season or enter preview mode before managing challenges.</p>
      </div>
    )
  }

  // Fetch challenges
  const { data: challenges } = await supabase
    .from('challenges')
    .select('*, submissions(status)')
    .eq('season_id', season.id)
    .order('deadline', { ascending: false })

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.03em' }}>Challenges</h1>
        <Link href="/admin/challenges/new" className="btn btn-primary btn-sm"><Plus size={14} /> New Challenge</Link>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Challenge</th>
              <th>Reward</th>
              <th>Deadline</th>
              <th>Submissions</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(challenges ?? []).map((c) => {
              const totalSubs = Array.isArray(c.submissions) ? c.submissions.length : 0
              const pendingSubs = Array.isArray(c.submissions) ? c.submissions.filter((s: any) => s.status === 'pending').length : 0
              
              return (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {c.is_boss && <Star size={14} color="var(--color-volt-yellow)" />}
                      <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{c.title}</p>
                    </div>
                  </td>
                  <td style={{ color: 'var(--color-volt-yellow)', fontWeight: 800 }}>+{c.reward_points} pts</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    {formatDate(c.deadline, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.875rem' }}>
                      <span style={{ fontWeight: 600 }}>{totalSubs}</span>
                      {pendingSubs > 0 && (
                        <span className="badge badge-yellow" style={{ padding: '2px 6px', fontSize: '0.7rem' }}>
                          {pendingSubs} pending
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    {c.is_active ? <span className="badge badge-green">Active</span> : <span className="badge badge-gray">Inactive</span>}
                  </td>
                  <td>
                    <Link href={`/admin/challenges/${c.id}`} className="btn btn-secondary btn-sm">
                      Review
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {(challenges ?? []).length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <Trophy size={32} style={{ opacity: 0.3, margin: '0 auto 16px' }} />
            <p>No challenges found. <Link href="/admin/challenges/new" style={{ color: 'var(--color-volt-yellow)' }}>Create one.</Link></p>
          </div>
        )}
      </div>
    </div>
  )
}
