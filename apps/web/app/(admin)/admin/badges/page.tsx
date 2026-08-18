import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Star } from 'lucide-react'

export const metadata: Metadata = { title: 'Badges — Admin' }
export const dynamic = 'force-dynamic'

export default async function AdminBadgesPage() {
  const supabase = await createClient()

  const { data: badges } = await supabase
    .from('badges')
    .select('*, badge_awards(id)')
    .order('created_at', { ascending: false })

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.03em' }}>Badges</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {(badges ?? []).length === 0 ? (
          <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)', gridColumn: '1/-1' }}>
            <Star size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
            <p>No badges configured yet.</p>
          </div>
        ) : (badges ?? []).map((badge) => {
          const awardCount = Array.isArray(badge.badge_awards) ? badge.badge_awards.length : 0
          return (
            <div key={badge.id} className="card" style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <span style={{ fontSize: '2rem' }}>{badge.icon ?? '🏅'}</span>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>{badge.name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{badge.tier?.toUpperCase()}</p>
                </div>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: 12 }}>{badge.description}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-gray">{awardCount} awarded</span>
                {badge.condition_type && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Auto: {badge.condition_type}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
