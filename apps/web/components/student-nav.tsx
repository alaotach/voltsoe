'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@/types/database'
import {
  LayoutDashboard,
  Calendar,
  Trophy,
  Zap,
  FolderOpen,
  Rss,
  User as UserIcon,
  Bell,
  Target,
  LogOut,
  ShieldCheck,
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/events', label: 'Events', icon: Calendar },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/challenges', label: 'Challenges', icon: Zap },
  { href: '/projects', label: 'Projects', icon: FolderOpen },
  { href: '/feed', label: 'Feed', icon: Rss },
  { href: '/opportunities', label: 'Opportunities', icon: Target },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/profile', label: 'Profile', icon: UserIcon },
]

const ADMIN_ROLES = ['core', 'vp', 'president', 'super_admin']

export default function StudentNav({ user }: { user: User | null }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 240,
          height: '100dvh',
          background: 'var(--color-surface-1)',
          borderRight: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 40,
          overflowY: 'auto',
        }}
        className="desktop-nav"
      >
        {/* Logo */}
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--color-border)' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                fontSize: '1.25rem',
                fontWeight: 900,
                letterSpacing: '-0.04em',
                background: 'var(--gradient-volt)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              VOLT
            </span>
            <span
              style={{
                fontSize: '0.6rem',
                fontWeight: 700,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'var(--color-text-muted)',
              }}
            >
              LEAGUE
            </span>
          </Link>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
            return (
              <Link key={href} href={href} className={`nav-item ${isActive ? 'active' : ''}`}>
                <Icon size={17} />
                <span>{label}</span>
              </Link>
            )
          })}

          {/* Admin link */}
          {user && ADMIN_ROLES.includes(user.role) && (
            <>
              <div className="divider" style={{ margin: '12px 0' }} />
              <Link href="/admin" className="nav-item">
                <ShieldCheck size={17} />
                <span>Admin Panel</span>
              </Link>
            </>
          )}
        </nav>

        {/* User footer */}
        <div
          style={{
            padding: '16px 12px',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          {user ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    background: 'var(--gradient-volt)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#0A0A0F',
                    flexShrink: 0,
                  }}
                >
                  {user.full_name.charAt(0).toUpperCase()}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <p
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {user.full_name}
                  </p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{user.role}</p>
                </div>
              </div>
              <button onClick={handleSignOut} className="nav-item" style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left' }}>
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <Link href="/login" className="btn btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              Sign In
            </Link>
          )}
        </div>
      </aside>

      {/* Mobile top bar */}
      <div
        className="mobile-nav"
        style={{
          display: 'none',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 60,
          background: 'var(--color-surface-1)',
          borderBottom: '1px solid var(--color-border)',
          zIndex: 40,
          alignItems: 'center',
          padding: '0 16px',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontSize: '1.1rem',
            fontWeight: 900,
            letterSpacing: '-0.03em',
            background: 'var(--gradient-volt)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          VOLT
        </span>
        <div style={{ display: 'flex', gap: 4 }}>
          {NAV_ITEMS.slice(0, 5).map(({ href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="btn-icon btn-ghost"
              style={{
                color: pathname.startsWith(href) ? 'var(--color-volt-yellow)' : 'var(--color-text-muted)',
              }}
            >
              <Icon size={18} />
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-nav { display: flex !important; }
        }
      `}</style>
    </>
  )
}
