import { getViewingSeason } from '@/lib/season'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserRank } from '@/lib/points'
import { calculateStreak } from '@/lib/streak'
import {
  Trophy,
  Zap,
  Calendar,
  Star,
  TrendingUp,
  ChevronRight,
  ArrowUp,
} from 'lucide-react'
import Link from 'next/link'
import { formatDate, formatTime, ordinal, progressPct } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Your VOLT League season overview.',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()
  if (!profile) redirect('/complete-profile')

  // Get active season
  const season = await getViewingSeason()

  if (!season) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--color-text-muted)' }}>
        <p>No active season found. Check back soon!</p>
      </div>
    )
  }

  // Get season event IDs for attendance check
  const { data: seasonEvents } = await supabase.from('events').select('id').eq('season_id', season.id)
  const eventIds = (seasonEvents ?? []).map(e => e.id)

  // Parallel data fetches
  const [rankData, streak, attendanceResult, projectsResult, badgesResult, nextEventResult, challengesResult] =
    await Promise.all([
      getUserRank(user.id, season.id),
      calculateStreak(user.id, season.id),

      supabase
        .from('attendance')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .in('event_id', eventIds.length > 0 ? eventIds : ['00000000-0000-0000-0000-000000000000']),

      supabase
        .from('projects')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('season_id', season.id)
        .eq('is_published', true),

      supabase
        .from('user_badges')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('season_id', season.id),

      supabase
        .from('events')
        .select('*')
        .eq('season_id', season.id)
        .eq('status', 'published')
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true })
        .limit(1)
        .maybeSingle(),

      supabase
        .from('challenges')
        .select('*')
        .eq('season_id', season.id)
        .eq('is_active', true)
        .gt('deadline', new Date().toISOString())
        .order('reward_points', { ascending: false })
        .limit(3),
    ])

  const totalPoints = rankData?.total_points ?? 0
  const rank = rankData?.rank ?? 0
  const totalParticipants = rankData?.total_participants ?? 0
  const eventsAttended = attendanceResult.count ?? 0
  const projectsSubmitted = projectsResult.count ?? 0
  const badgeCount = badgesResult.count ?? 0
  const nextEvent = nextEventResult.data
  const challenges = challengesResult.data ?? []

  // Season total events for progress
  const { count: seasonEventCount } = await supabase
    .from('events')
    .select('id', { count: 'exact', head: true })
    .eq('season_id', season.id)
    .neq('status', 'draft')
    .neq('status', 'cancelled')

  // Next rank info
  let nextRankUser: { full_name: string } | null = null
  let pointsToNextRank: number | null = null
  if (rank > 1) {
    const { data: nextRankData } = await supabase
      .from('leaderboard_view')
      .select('full_name, total_points')
      .eq('season_id', season.id)
      .eq('rank', rank - 1)
      .maybeSingle()
    if (nextRankData) {
      nextRankUser = nextRankData
      pointsToNextRank = (nextRankData.total_points as number) - totalPoints + 1
    }
  }

  // Check registration for next event
  let nextEventRegistration = null
  if (nextEvent) {
    const { data: reg } = await supabase
      .from('registrations')
      .select('status')
      .eq('event_id', nextEvent.id)
      .eq('user_id', user.id)
      .maybeSingle()
    nextEventRegistration = reg
  }

  const progress = progressPct(eventsAttended, seasonEventCount ?? 1)

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Header */}
      <div>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
          {season.name}
        </p>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: 4 }}>
          {profile.full_name.split(' ')[0]}&apos;s Season
        </h1>

        {/* Points + rank hero */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            marginTop: 20,
            padding: '24px',
            borderRadius: 'var(--radius-xl)',
            background: 'linear-gradient(135deg, rgba(245,197,24,0.08) 0%, rgba(255,107,44,0.05) 100%)',
            border: '1px solid rgba(245,197,24,0.15)',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '3.5rem',
                fontWeight: 900,
                letterSpacing: '-0.05em',
                lineHeight: 1,
                background: 'var(--gradient-volt)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {totalPoints}
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>
              VOLT Points
            </div>
          </div>
          <div style={{ width: 1, height: 48, background: 'var(--color-border)' }} />
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1 }}>
              {rank > 0 ? `#${rank}` : '—'}
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>
              of {totalParticipants}
            </div>
          </div>
          {pointsToNextRank && nextRankUser && (
            <div
              style={{
                marginLeft: 'auto',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255,255,255,0.04)',
                fontSize: '0.8rem',
                color: 'var(--color-text-secondary)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                <ArrowUp size={12} color="var(--color-success)" />
                <span style={{ fontWeight: 700, color: 'var(--color-success)' }}>+{pointsToNextRank} pts</span>
              </div>
              <div>to pass {nextRankUser.full_name.split(' ')[0]}</div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
        {[
          { label: 'Events Attended', value: eventsAttended, icon: Calendar, color: '#60A5FA' },
          { label: 'Projects Built', value: projectsSubmitted, icon: Star, color: '#F472B6' },
          { label: 'Badges', value: badgeCount, icon: Trophy, color: '#F5C518' },
          { label: 'Streak', value: `${streak}🔥`, icon: TrendingUp, color: '#FB923C' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="stat-box">
            <Icon size={16} color={color} />
            <div className="stat-value" style={{ color }}>{value}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Season Progress */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Season Progress</span>
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-volt-yellow)' }}>{progress}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 8 }}>
          {eventsAttended} of {seasonEventCount ?? 0} events attended
        </p>
      </div>

      {/* Next Event */}
      {nextEvent && (
        <div className="card" style={{ padding: '20px 24px' }}>
          <div className="section-title" style={{ marginBottom: 12 }}>
            <Calendar size={16} color="var(--color-volt-yellow)" />
            Next Event
          </div>
          <Link
            href={`/events/${nextEvent.slug}`}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <div>
              <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>{nextEvent.title}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                {formatDate(nextEvent.date, { weekday: 'short', month: 'short', day: 'numeric' })} · {formatTime(nextEvent.start_time)}
                {nextEvent.venue && ` · ${nextEvent.venue}`}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {nextEventRegistration ? (
                <span className="badge badge-green">Registered</span>
              ) : nextEvent.registration_open ? (
                <span className="badge badge-yellow">Open</span>
              ) : (
                <span className="badge badge-gray">Closed</span>
              )}
              <ChevronRight size={16} color="var(--color-text-muted)" />
            </div>
          </Link>
        </div>
      )}

      {/* Open Challenges */}
      {challenges.length > 0 && (
        <div>
          <div className="section-title">
            <Zap size={16} color="var(--color-volt-yellow)" />
            Open Challenges
            <Link href="/challenges" style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>View all</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {challenges.map((ch) => (
              <Link
                key={ch.id}
                href={`/challenges/${ch.id}`}
                className="card card-hover"
                style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {ch.is_boss && <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>BOSS</span>}
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{ch.title}</span>
                  </span>
                </div>
                <span style={{ fontWeight: 700, color: 'var(--color-volt-yellow)', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>+{ch.reward_points} pts</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* How to move up */}
      <div className="card" style={{ padding: '20px 24px', borderColor: 'rgba(124,58,237,0.2)', background: 'rgba(124,58,237,0.04)' }}>
        <div className="section-title" style={{ marginBottom: 12 }}>
          <TrendingUp size={16} color="#A78BFA" />
          How to move up
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: 12 }}>
          You&apos;re{rank > 0 ? ` #${rank}` : ''} with {totalPoints} points{pointsToNextRank ? ` — ${pointsToNextRank} pts behind #${rank - 1}` : ''}.
        </p>
        <Link href="/opportunities" className="btn btn-secondary btn-sm">
          View all opportunities <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  )
}
