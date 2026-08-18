import { getViewingSeason } from '@/lib/season'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserRank } from '@/lib/points'
import { Target, Zap, Calendar, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { timeRemaining } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Opportunities',
  description: 'How to earn more VOLT points this season.',
}

export default async function OpportunitiesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const season = await getViewingSeason()

  const now = new Date().toISOString()
  const today = new Date().toISOString().split('T')[0]

  const [rankData, challenges, events] = await Promise.all([
    season ? getUserRank(user.id, season.id) : null,
    season
      ? supabase
          .from('challenges')
          .select('*')
          .eq('season_id', season.id)
          .eq('is_active', true)
          .gt('deadline', now)
          .order('reward_points', { ascending: false })
      : { data: [] },
    season
      ? supabase
          .from('events')
          .select('*, point_rules(label, points)')
          .eq('season_id', season.id)
          .eq('status', 'published')
          .gte('date', today)
          .order('date', { ascending: true })
          .limit(5)
      : { data: [] },
  ])

  const rank = rankData?.rank ?? 0
  const points = rankData?.total_points ?? 0

  const challengePoints = (challenges.data ?? []).reduce((sum: number, c: any) => sum + c.reward_points, 0)
  const eventPoints = (events.data ?? []).reduce((sum: number, e: any) => {
    return sum + ((e.point_rules ?? []) as any[]).reduce((s: number, r: any) => s + r.points, 0)
  }, 0)
  const potential = challengePoints + eventPoints

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: 6 }}>
          Your Opportunities
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
          You&apos;re #{rank} with {points} pts. Here&apos;s how to climb.
        </p>
      </div>

      {/* Potential banner */}
      {potential > 0 && (
        <div
          style={{
            padding: '20px 24px',
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, rgba(245,197,24,0.08) 0%, rgba(255,107,44,0.05) 100%)',
            border: '1px solid rgba(245,197,24,0.15)',
            marginBottom: 24,
          }}
        >
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginBottom: 4 }}>If you complete everything below</p>
          <p style={{ fontWeight: 800, fontSize: '1.25rem' }}>
            <span style={{ color: 'var(--color-volt-yellow)' }}>+{potential} pts</span>
            <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500, fontSize: '0.9rem', marginLeft: 10 }}>
              potential earnings
            </span>
          </p>
        </div>
      )}

      {/* Open Challenges */}
      {(challenges.data ?? []).length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div className="section-title"><Zap size={16} color="var(--color-volt-yellow)" /> Open Challenges</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(challenges.data ?? []).map((ch: any) => {
              const rem = timeRemaining(ch.deadline)
              return (
                <Link
                  key={ch.id}
                  href={`/challenges/${ch.id}`}
                  className="card card-hover"
                  style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                      {ch.is_boss && <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>BOSS</span>}
                    </div>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{ch.title}</p>
                    <p style={{ fontSize: '0.75rem', color: rem.hours < 24 ? '#EF4444' : 'var(--color-text-muted)', marginTop: 2 }}>{rem.label}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 800, color: 'var(--color-volt-yellow)', fontSize: '1.1rem' }}>+{ch.reward_points}</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>pts</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Upcoming Events */}
      {(events.data ?? []).length > 0 && (
        <div>
          <div className="section-title"><Calendar size={16} color="#60A5FA" /> Upcoming Events</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(events.data ?? []).map((ev: any) => {
              const rules = ev.point_rules ?? []
              const totalPts = rules.reduce((s: number, r: any) => s + r.points, 0)
              return (
                <Link
                  key={ev.id}
                  href={`/events/${ev.slug}`}
                  className="card card-hover"
                  style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}
                >
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{ev.title}</p>
                    {rules.length > 0 && (
                      <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {rules.slice(0, 3).map((r: any) => (
                          <p key={r.label} style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            → {r.label}: <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>+{r.points} pts</span>
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                  {totalPts > 0 && (
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontWeight: 800, color: '#60A5FA', fontSize: '1.1rem' }}>up to +{totalPts}</p>
                      <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>pts</p>
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {(challenges.data ?? []).length === 0 && (events.data ?? []).length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--color-text-muted)' }}>
          <Target size={40} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <p>No opportunities right now. Check back after the next event is announced!</p>
        </div>
      )}
    </div>
  )
}
