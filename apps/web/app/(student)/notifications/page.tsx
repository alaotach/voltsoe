import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Bell, CheckCheck } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import MarkAllReadButton from './mark-all-read-button'

export const metadata: Metadata = {
  title: 'Notifications',
  description: 'Your VOLT League notifications.',
}

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100)

  const unreadCount = (notifications ?? []).filter((n) => !n.is_read).length

  // Group by date
  const grouped: Record<string, typeof notifications> = {}
  for (const n of notifications ?? []) {
    const date = new Date(n.created_at).toDateString()
    if (!grouped[date]) grouped[date] = []
    grouped[date]!.push(n)
  }

  const TYPE_ICONS: Record<string, string> = {
    registration_open: '📅',
    registration_closing: '⏰',
    event_tomorrow: '🔔',
    attendance_confirmed: '✅',
    points_awarded: '⚡',
    rank_improved: '📈',
    rank_dropped: '📉',
    new_challenge: '🎯',
    challenge_deadline: '⏳',
    badge_unlocked: '🏆',
    submission_reviewed: '📝',
    weekly_digest: '📊',
  }

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: 6 }}>
            Notifications
            {unreadCount > 0 && (
              <span
                style={{
                  marginLeft: 10,
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  background: 'var(--color-volt-yellow)',
                  color: '#0A0A0F',
                }}
              >
                {unreadCount}
              </span>
            )}
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Your activity and updates.</p>
        </div>
        {unreadCount > 0 && <MarkAllReadButton />}
      </div>

      {(notifications ?? []).length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--color-text-muted)' }}>
          <Bell size={40} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <p>No notifications yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
                {new Date(date).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {(items ?? []).map((notif) => (
                  <div
                    key={notif.id}
                    style={{
                      padding: '14px 18px',
                      borderRadius: 'var(--radius-md)',
                      background: notif.is_read ? 'transparent' : 'rgba(245,197,24,0.04)',
                      border: `1px solid ${notif.is_read ? 'var(--color-border)' : 'rgba(245,197,24,0.12)'}`,
                      display: 'flex',
                      gap: 12,
                      alignItems: 'flex-start',
                    }}
                  >
                    <span style={{ fontSize: '1.25rem', flexShrink: 0, lineHeight: 1 }}>
                      {TYPE_ICONS[notif.type] ?? '🔔'}
                    </span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: 2 }}>{notif.title}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{notif.body}</p>
                    </div>
                    {!notif.is_read && (
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-volt-yellow)', flexShrink: 0, marginTop: 4 }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
