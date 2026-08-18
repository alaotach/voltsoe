'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@/types/database'
import {
  LayoutDashboard,
  Calendar,
  Users,
  Zap,
  Trophy,
  Star,
  ShieldAlert,
  ScrollText,
  Bell,
  Layers,
  UserCog,
  LayoutGrid,
  LogOut,
  ArrowLeft,
} from 'lucide-react'

function NavItem({ href, label, icon: Icon, roles, userRole }: {
  href: string; label: string; icon: React.ComponentType<any>; roles: string[]; userRole: string
}) {
  const pathname = usePathname()
  const isActive = href === '/admin' ? pathname === href : pathname === href || pathname.startsWith(href + '/')
  if (!roles.includes(userRole)) return null
  return (
    <Link href={href} className={`nav-item ${isActive ? 'active' : ''}`} style={{ fontSize: '0.83rem' }}>
      <Icon size={15} />
      <span>{label}</span>
    </Link>
  )
}

const NAV_ITEMS = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, roles: ['vp', 'president', 'super_admin'] },
  { href: '/admin/events', label: 'Events', icon: Calendar, roles: ['core', 'vp', 'president', 'super_admin'] },
  { href: '/admin/students', label: 'Students', icon: Users, roles: ['president', 'super_admin'] },
  { href: '/admin/points', label: 'Points', icon: Zap, roles: ['vp', 'president', 'super_admin'] },
  { href: '/admin/challenges', label: 'Challenges', icon: Trophy, roles: ['vp', 'president', 'super_admin'] },
  { href: '/admin/leaderboard', label: 'Leaderboard', icon: LayoutGrid, roles: ['core', 'vp', 'president', 'super_admin'] },
  { href: '/admin/badges', label: 'Badges', icon: Star, roles: ['president', 'super_admin'] },
  { href: '/admin/roles', label: 'Roles', icon: UserCog, roles: ['super_admin'] },
  { href: '/admin/actions', label: 'Action Log', icon: ScrollText, roles: ['president', 'super_admin'] },
  { href: '/admin/notifications', label: 'Notifications', icon: Bell, roles: ['vp', 'president', 'super_admin'] },
  { href: '/admin/season', label: 'Season', icon: Layers, roles: ['super_admin'] },
]

export default function AdminNav({ user, seasonName, isPreviewing }: { user: User; seasonName?: string; isPreviewing?: boolean }) {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: 220,
        height: '100dvh',
        background: 'var(--color-surface-1)',
        borderRight: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 40,
        overflowY: 'auto',
      }}
    >
      {/* Logo + label */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: '1.1rem', fontWeight: 900, letterSpacing: '-0.03em', background: 'var(--gradient-volt)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>VOLT</span>
          <span style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>ADMIN</span>
        </div>
        <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>{user.role.toUpperCase()}</span>
        {seasonName && (
          <div style={{ marginTop: 8, padding: '6px 8px', background: isPreviewing ? 'rgba(124,58,237,0.12)' : 'rgba(255,255,255,0.04)', borderRadius: 'var(--radius-sm)', border: `1px solid ${isPreviewing ? 'rgba(124,58,237,0.3)' : 'var(--color-border)'}` }}>
            {isPreviewing && <p style={{ fontSize: '0.58rem', fontWeight: 700, color: 'var(--color-volt-purple)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>Previewing</p>}
            <p style={{ fontSize: '0.72rem', fontWeight: 600, color: isPreviewing ? 'var(--color-volt-purple)' : 'var(--color-text-muted)', lineHeight: 1.3 }}>{seasonName}</p>
          </div>
        )}
      </div>

      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.href} {...item} userRole={user.role} />
        ))}
      </nav>

      <div style={{ padding: '12px 10px', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Link href="/admin/season" className="nav-item" style={{ fontSize: '0.8rem' }}>
          <Layers size={14} /> {isPreviewing ? '⚠ Switch Season' : 'Season'}
        </Link>
        <Link href="/dashboard" className="nav-item" style={{ fontSize: '0.8rem' }}>
          <ArrowLeft size={14} /> Student View
        </Link>
        <button onClick={handleSignOut} className="nav-item" style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', fontSize: '0.8rem' }}>
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </aside>
  )
}
