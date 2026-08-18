import { getViewingSeason } from '@/lib/season'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Trophy, Medal } from 'lucide-react'
import { getLeaderboard, getUserRank } from '@/lib/points'

export const metadata: Metadata = {
  title: 'Leaderboard',
  description: 'VOLT League season rankings.',
}

export default async function LeaderboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const season = await getViewingSeason()

  const [leaderboard, myRankData] = await Promise.all([
    season ? getLeaderboard(season.id, 50) : Promise.resolve([]),
    season ? getUserRank(user.id, season.id) : Promise.resolve(null),
  ])

  const myRank = myRankData?.rank ?? 0
  const myPoints = myRankData?.total_points ?? 0

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: 4 }}>
          Leaderboard
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
          {season?.name} · Live rankings
        </p>
      </div>

      {/* Podium for top 3 */}
      {leaderboard.length >= 3 && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 28, alignItems: 'flex-end' }}>
          {/* 2nd */}
          <div
            className="card"
            style={{
              flex: 1,
              padding: '20px 16px',
              textAlign: 'center',
              borderColor: 'rgba(192,192,192,0.2)',
              background: 'rgba(192,192,192,0.04)',
              height: 160,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
            }}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>🥈</div>
            <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{leaderboard[1].full_name.split(' ')[0]}</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{leaderboard[1].total_points} pts</p>
          </div>
          {/* 1st */}
          <div
            className="card"
            style={{
              flex: 1,
              padding: '20px 16px',
              textAlign: 'center',
              borderColor: 'rgba(245,197,24,0.3)',
              background: 'rgba(245,197,24,0.06)',
              height: 200,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              boxShadow: '0 0 32px rgba(245,197,24,0.12)',
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: 4 }}>🥇</div>
            <p style={{ fontWeight: 800, fontSize: '1rem' }}>{leaderboard[0].full_name.split(' ')[0]}</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-volt-yellow)', fontWeight: 700 }}>{leaderboard[0].total_points} pts</p>
          </div>
          {/* 3rd */}
          <div
            className="card"
            style={{
              flex: 1,
              padding: '20px 16px',
              textAlign: 'center',
              borderColor: 'rgba(205,127,50,0.2)',
              background: 'rgba(205,127,50,0.04)',
              height: 140,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
            }}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>🥉</div>
            <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{leaderboard[2].full_name.split(' ')[0]}</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{leaderboard[2].total_points} pts</p>
          </div>
        </div>
      )}

      {/* My rank callout */}
      {myRank > 0 && (
        <div
          style={{
            padding: '14px 20px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(245,197,24,0.06)',
            border: '1px solid rgba(245,197,24,0.15)',
            marginBottom: 20,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Your position</span>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <span style={{ fontWeight: 800, color: 'var(--color-volt-yellow)' }}>#{myRank}</span>
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{myPoints} pts</span>
          </div>
        </div>
      )}

      {/* Full table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 60 }}>Rank</th>
              <th>Student</th>
              <th style={{ textAlign: 'right', paddingRight: 24 }}>Points</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry) => {
              const isMe = entry.id === user.id
              return (
                <tr
                  key={entry.id}
                  style={{
                    background: isMe ? 'rgba(245,197,24,0.05)' : undefined,
                    fontWeight: isMe ? 700 : undefined,
                  }}
                >
                  <td style={{ padding: '12px 16px' }}>
                    {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : (
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>#{entry.rank}</span>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: '50%',
                          background: isMe ? 'var(--gradient-volt)' : 'var(--color-surface-3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: isMe ? '#0A0A0F' : 'var(--color-text-secondary)',
                          flexShrink: 0,
                        }}
                      >
                        {entry.full_name.charAt(0)}
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                          {entry.full_name}
                          {isMe && <span style={{ marginLeft: 6, color: 'var(--color-volt-yellow)', fontSize: '0.75rem' }}>you</span>}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{entry.department?.split(' ').map((w: string) => w[0]).join('').slice(0, 4)}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', paddingRight: 24, fontWeight: 700, color: entry.rank <= 3 ? 'var(--color-volt-yellow)' : undefined }}>
                    {entry.total_points}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {leaderboard.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-muted)' }}>
            <Trophy size={36} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p>No rankings yet. Earn points to appear here!</p>
          </div>
        )}
      </div>
    </div>
  )
}
