import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Medal } from 'lucide-react'

export const metadata: Metadata = { title: 'Leaderboard — Admin' }
export const dynamic = 'force-dynamic'

export default async function AdminLeaderboardPage() {
  const supabase = await createClient()
  const seasonId = process.env.NEXT_PUBLIC_SEASON_ID
  const { data: season } = await supabase.from('seasons').select('id, name').eq(seasonId ? 'id' : 'is_active', seasonId ?? true).single()

  const { data: entries } = await supabase
    .from('leaderboard_view')
    .select('*')
    .eq('season_id', season?.id ?? '')
    .order('rank', { ascending: true })
    .limit(100)

  const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.03em' }}>Leaderboard</h1>
        {season && <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: 4 }}>{season.name}</p>}
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 60 }}>Rank</th>
              <th>Student</th>
              <th>Department</th>
              <th>Batch</th>
              <th style={{ textAlign: 'right' }}>Points</th>
            </tr>
          </thead>
          <tbody>
            {(entries ?? []).map((entry) => (
              <tr key={entry.id}>
                <td style={{ fontWeight: 700, fontSize: '1rem' }}>
                  {MEDAL[entry.rank] ?? `#${entry.rank}`}
                </td>
                <td>
                  <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{entry.full_name}</p>
                </td>
                <td style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{entry.department}</td>
                <td style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{entry.batch}</td>
                <td style={{ textAlign: 'right' }}>
                  <span className="badge badge-purple">{entry.total_points} pts</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(entries ?? []).length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <Medal size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
            <p>No leaderboard data yet. Award some points first!</p>
          </div>
        )}
      </div>
    </div>
  )
}
