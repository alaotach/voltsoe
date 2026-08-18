import { getViewingSeason } from '@/lib/season'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Zap, Clock, ChevronRight } from 'lucide-react'
import { timeRemaining } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Challenges',
  description: 'Active and past VOLT League challenges.',
}

export default async function ChallengesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const season = await getViewingSeason()

  const { data: challenges } = await supabase
    .from('challenges')
    .select('*')
    .eq('season_id', season?.id ?? '')
    .order('deadline', { ascending: true })

  const now = new Date().toISOString()
  const active = (challenges ?? []).filter((c) => c.is_active && c.deadline > now)
  const past = (challenges ?? []).filter((c) => !c.is_active || c.deadline <= now)

  // Get user submissions
  const challengeIds = (challenges ?? []).map((c) => c.id)
  const { data: submissions } = await supabase
    .from('submissions')
    .select('challenge_id, status')
    .eq('user_id', user.id)
    .in('challenge_id', challengeIds)

  const subMap = Object.fromEntries((submissions ?? []).map((s) => [s.challenge_id, s.status]))

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: 6 }}>Challenges</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Complete challenges to earn extra points.</p>
      </div>

      {/* Boss Challenges first */}
      {active.filter((c) => c.is_boss).length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div className="section-title">
            <span>⚡</span> Boss Challenges
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {active.filter((c) => c.is_boss).map((ch) => {
              const rem = timeRemaining(ch.deadline)
              const sub = subMap[ch.id]
              return (
                <Link
                  key={ch.id}
                  href={`/challenges/${ch.id}`}
                  className="card card-hover boss-glow"
                  style={{ padding: '24px', display: 'block' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                        <span className="badge badge-purple">BOSS</span>
                        {sub && <span className={`badge ${sub === 'approved' ? 'badge-green' : sub === 'rejected' ? 'badge-red' : 'badge-gray'}`}>{sub}</span>}
                      </div>
                      <h3 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: 8 }}>{ch.title}</h3>
                      <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                        {ch.description.slice(0, 140)}{ch.description.length > 140 ? '...' : ''}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#A78BFA' }}>+{ch.reward_points}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>POINTS</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: rem.hours < 24 ? '#EF4444' : 'var(--color-text-muted)' }}>
                    <Clock size={13} />
                    {rem.label}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Regular active challenges */}
      {active.filter((c) => !c.is_boss).length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div className="section-title"><Zap size={16} color="var(--color-volt-yellow)" /> Active Challenges</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {active.filter((c) => !c.is_boss).map((ch) => {
              const rem = timeRemaining(ch.deadline)
              const sub = subMap[ch.id]
              return (
                <Link
                  key={ch.id}
                  href={`/challenges/${ch.id}`}
                  className="card card-hover"
                  style={{ padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                      {sub && <span className={`badge ${sub === 'approved' ? 'badge-green' : sub === 'rejected' ? 'badge-red' : 'badge-gray'}`} style={{ fontSize: '0.7rem' }}>{sub}</span>}
                    </div>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>{ch.title}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: rem.hours < 24 ? '#EF4444' : 'var(--color-text-muted)' }}>
                      <Clock size={11} /> {rem.label}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontWeight: 700, color: 'var(--color-volt-yellow)' }}>+{ch.reward_points} pts</span>
                    <ChevronRight size={16} color="var(--color-text-muted)" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Past */}
      {past.length > 0 && (
        <div>
          <div className="section-title" style={{ color: 'var(--color-text-muted)' }}>Past Challenges</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {past.map((ch) => {
              const sub = subMap[ch.id]
              return (
                <Link
                  key={ch.id}
                  href={`/challenges/${ch.id}`}
                  className="card"
                  style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.7 }}
                >
                  <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{ch.title}</span>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {sub && <span className={`badge ${sub === 'approved' ? 'badge-green' : sub === 'rejected' ? 'badge-red' : 'badge-gray'}`} style={{ fontSize: '0.7rem' }}>{sub}</span>}
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>+{ch.reward_points} pts</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {(challenges ?? []).length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--color-text-muted)' }}>
          <Zap size={40} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <p>No challenges yet. Check back soon!</p>
        </div>
      )}
    </div>
  )
}
