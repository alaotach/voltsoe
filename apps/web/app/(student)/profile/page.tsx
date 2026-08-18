import { getViewingSeason } from '@/lib/season'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { User, Trophy, Zap, Calendar, FolderOpen, Star } from 'lucide-react'
import { getUserRank } from '@/lib/points'
import { ordinal, formatDate } from '@/lib/utils'
import AvatarUpload from './avatar-upload'

export const metadata: Metadata = {
  title: 'My Profile',
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()
  if (!profile) redirect('/complete-profile')

  const season = await getViewingSeason()

  const [rankData, badgesResult, txResult, projectsResult, attendanceResult] = await Promise.all([
    season ? getUserRank(user.id, season.id) : null,
    season
      ? supabase.from('user_badges').select('*, badges(*)').eq('user_id', user.id).eq('season_id', season.id).order('awarded_at', { ascending: false })
      : { data: [] },
    season
      ? supabase.from('point_transactions').select('*').eq('user_id', user.id).eq('season_id', season.id).order('created_at', { ascending: false }).limit(20)
      : { data: [] },
    season
      ? supabase.from('projects').select('*').eq('user_id', user.id).eq('season_id', season.id).eq('is_published', true).order('created_at', { ascending: false })
      : { data: [] },
    season
      ? supabase.from('registrations').select('*, events(title, slug, date)').eq('user_id', user.id).order('registered_at', { ascending: false })
      : { data: [] },
  ])

  const badges = badgesResult.data ?? []
  const transactions = txResult.data ?? []
  const projects = projectsResult.data ?? []
  const registrations = attendanceResult.data ?? []
  const totalPoints = rankData?.total_points ?? 0
  const rank = rankData?.rank ?? 0

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Profile header */}
      <div
        style={{
          padding: '28px',
          borderRadius: 'var(--radius-xl)',
          background: 'linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(37,99,235,0.05) 100%)',
          border: '1px solid rgba(124,58,237,0.15)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 20 }}>
          <AvatarUpload userId={user.id} currentUrl={profile.avatar_url} />
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.03em' }}>{profile.full_name}</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
              {profile.enrollment_number} · {profile.batch} · {profile.department}
            </p>
          </div>
          {!profile.is_verified && (
            <span className="badge badge-yellow" style={{ marginLeft: 'auto' }}>Pending Verification</span>
          )}
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { label: 'Points', value: totalPoints, icon: Zap, color: 'var(--color-volt-yellow)' },
            { label: 'Rank', value: rank > 0 ? `#${rank}` : '—', icon: Trophy, color: '#A78BFA' },
            { label: 'Events', value: registrations.length, icon: Calendar, color: '#60A5FA' },
            { label: 'Projects', value: projects.length, icon: FolderOpen, color: '#F472B6' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="stat-box" style={{ textAlign: 'center' }}>
              <Icon size={14} color={color} style={{ margin: '0 auto 4px' }} />
              <div className="stat-value" style={{ color }}>{value}</div>
              <div className="stat-label">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div>
          <div className="section-title"><Star size={16} color="var(--color-volt-yellow)" /> Badges</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {badges.map((ub: any) => (
              <div
                key={ub.id}
                title={ub.badges?.description}
                style={{
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(245,197,24,0.08)',
                  border: '1px solid rgba(245,197,24,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                <span>{ub.badges?.icon}</span>
                <span>{ub.badges?.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Point History */}
      {transactions.length > 0 && (
        <div>
          <div className="section-title"><Zap size={16} color="var(--color-volt-yellow)" /> Point History</div>
          <div className="card" style={{ overflow: 'hidden' }}>
            <table className="data-table">
              <tbody>
                {transactions.map((tx: any) => (
                  <tr key={tx.id}>
                    <td style={{ width: 70, fontWeight: 700, color: tx.points > 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                      {tx.points > 0 ? `+${tx.points}` : tx.points}
                    </td>
                    <td style={{ fontSize: '0.875rem' }}>{tx.reason}</td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'right' }}>
                      {formatDate(tx.created_at, { month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div>
          <div className="section-title" style={{ justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FolderOpen size={16} color="#F472B6" /> My Projects</span>
            <Link href="/projects/new" className="btn btn-sm btn-secondary">+ Add</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
            {projects.map((p: any) => (
              <div key={p.id} className="card" style={{ padding: '16px' }}>
                <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>{p.title}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{p.likes_count} likes</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
