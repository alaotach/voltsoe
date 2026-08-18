import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Rss } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Activity Feed',
  description: 'Live season activity feed.',
}

const FEED_LABELS: Record<string, (content: any) => string> = {
  badge_earned: (c) => `earned the "${c.badgeName}" badge ${c.badgeIcon}`,
  rank_changed: (c) => `moved up to #${c.rank} on the leaderboard`,
  project_published: (c) => `published "${c.projectTitle}"`,
  points_awarded: (c) => `earned ${c.points} points for ${c.reason}`,
  challenge_completed: (c) => `completed "${c.challengeTitle}"`,
  event_registered: (c) => `${c.count} students registered for ${c.eventTitle}`,
}

const FEED_ICONS: Record<string, string> = {
  badge_earned: '🏆',
  rank_changed: '📈',
  project_published: '🗂️',
  points_awarded: '⚡',
  challenge_completed: '✅',
  event_registered: '📅',
}

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const seasonId = process.env.NEXT_PUBLIC_SEASON_ID
  const { data: season } = await supabase.from('seasons').select('id').eq(seasonId ? 'id' : 'is_active', seasonId ?? true).single()

  const { data: feed } = await supabase
    .from('activity_feed')
    .select('*, users(full_name)')
    .eq('season_id', season?.id ?? '')
    .order('created_at', { ascending: false })
    .limit(60)

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
        <span className="live-dot" />
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.04em' }}>Activity Feed</h1>
      </div>

      {(feed ?? []).length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--color-text-muted)' }}>
          <Rss size={40} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <p>No activity yet this season.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {(feed ?? []).map((item) => {
            const label = FEED_LABELS[item.type]?.(item.content) ?? item.type
            const icon = FEED_ICONS[item.type] ?? '📢'
            const name = (item.users as any)?.full_name ?? 'Someone'
            const isBadge = item.type === 'badge_earned'
            return (
              <div
                key={item.id}
                style={{
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-md)',
                  background: isBadge ? 'rgba(245,197,24,0.04)' : 'transparent',
                  border: `1px solid ${isBadge ? 'rgba(245,197,24,0.12)' : 'var(--color-border)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  marginBottom: 2,
                }}
              >
                <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>{icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.875rem' }}>
                    <strong>{item.user_id ? name : 'Activity'}</strong>{' '}
                    <span style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
                  </p>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                  {formatDate(item.created_at, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
