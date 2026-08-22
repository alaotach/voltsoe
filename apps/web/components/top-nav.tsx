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
  ChevronDown,
  Menu,
  X
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

const MAIN_NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/projects', label: 'Projects', icon: FolderOpen },
  { href: '/events', label: 'Events', icon: Calendar },
]

const MORE_NAV_ITEMS = [
  { href: '/challenges', label: 'Challenges', icon: Zap },
  { href: '/feed', label: 'Feed', icon: Rss },
  { href: '/opportunities', label: 'Opportunities', icon: Target },
]

const ADMIN_ROLES = ['core', 'vp', 'president', 'super_admin']

export default function TopNav({ user }: { user: User | null }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  
  const moreRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setMoreDropdownOpen(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const isAdmin = user && ADMIN_ROLES.includes(user.role)

  return (
    <>
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 32px',
          borderBottom: '1px solid var(--color-border)',
          background: 'rgba(10, 10, 15, 0.85)',
          backdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                fontSize: '1.5rem',
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
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'var(--color-text-muted)',
                marginTop: 4,
              }}
              className="hide-on-mobile"
            >
              LEAGUE
            </span>
          </Link>

          {/* Desktop Nav Items */}
          {user && (
            <div style={{ display: 'flex', gap: 8 }} className="hide-on-mobile">
              {MAIN_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`btn-ghost`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                      background: isActive ? 'var(--color-surface-2)' : 'transparent',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Icon size={16} color={isActive ? 'var(--color-volt-yellow)' : 'currentColor'} />
                    {label}
                  </Link>
                )
              })}

              {/* More Dropdown */}
              <div style={{ position: 'relative' }} ref={moreRef}>
                <button
                  onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                  className="btn-ghost"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  More <ChevronDown size={14} />
                </button>

                {moreDropdownOpen && (
                  <div
                    className="fade-in"
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      marginTop: 8,
                      width: 200,
                      background: 'var(--color-surface-1)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                      boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                    }}
                  >
                    {MORE_NAV_ITEMS.map(({ href, label, icon: Icon }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setMoreDropdownOpen(false)}
                        className="btn-ghost hover-white"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.9rem',
                          color: 'var(--color-text-secondary)',
                          textAlign: 'left'
                        }}
                      >
                        <Icon size={16} />
                        {label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Guest Links */}
          {!user && (
            <div style={{ display: 'flex', gap: 24 }} className="hide-on-mobile">
              <Link href="/leaderboard" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-secondary)' }} className="hover-white">Leaderboard</Link>
              <Link href="/projects" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-secondary)' }} className="hover-white">Projects</Link>
              <Link href="/events" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-secondary)' }} className="hover-white">Events</Link>
            </div>
          )}
        </div>

        {/* Right side controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }} className="hide-on-mobile">
              <Link
                href="/notifications"
                className="btn-icon btn-ghost"
                style={{ position: 'relative', color: pathname.startsWith('/notifications') ? 'var(--color-volt-yellow)' : 'var(--color-text-muted)' }}
              >
                <Bell size={18} />
              </Link>
              
              {/* Profile Dropdown */}
              <div style={{ position: 'relative' }} ref={profileRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    background: 'none',
                    border: 'none',
                    padding: '4px',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: 'var(--gradient-volt)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: '#0A0A0F',
                    }}
                  >
                    {user.avatar_url ? (
                       <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      user.full_name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <ChevronDown size={14} color="var(--color-text-muted)" />
                </button>

                {profileDropdownOpen && (
                  <div
                    className="fade-in"
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: 12,
                      width: 220,
                      background: 'var(--color-surface-1)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                      boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                    }}
                  >
                    <div style={{ padding: '8px 12px 12px', borderBottom: '1px solid var(--color-border)', marginBottom: 8 }}>
                      <p style={{ fontSize: '0.9rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.full_name}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{user.role}</p>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="btn-ghost hover-white"
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', color: 'var(--color-text-secondary)', textAlign: 'left' }}
                    >
                      <UserIcon size={16} /> Profile
                    </Link>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="btn-ghost hover-white"
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', color: 'var(--color-text-secondary)', textAlign: 'left' }}
                      >
                        <ShieldCheck size={16} /> Admin Panel
                      </Link>
                    )}

                    <div style={{ height: 1, background: 'var(--color-border)', margin: '4px 0' }} />

                    <button
                      onClick={handleSignOut}
                      className="btn-ghost hover-white"
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', color: 'var(--color-text-secondary)', textAlign: 'left', width: '100%' }}
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Link href="/login" className="btn btn-primary btn-sm hide-on-mobile">
              Sign In
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-only btn-icon btn-ghost"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ display: 'none' }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div
          className="mobile-only fade-in"
          style={{
            position: 'fixed',
            top: 73, // height of navbar
            left: 0,
            right: 0,
            bottom: 0,
            background: 'var(--color-surface-base)',
            zIndex: 49,
            padding: '24px',
            overflowY: 'auto',
          }}
        >
          {user ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 24, borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--gradient-volt)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700, color: '#0A0A0F' }}>
                  {user.avatar_url ? <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : user.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{user.full_name}</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{user.role}</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[...MAIN_NAV_ITEMS, ...MORE_NAV_ITEMS, { href: '/profile', label: 'Profile', icon: UserIcon }, { href: '/notifications', label: 'Notifications', icon: Bell }].map(({ href, label, icon: Icon }) => (
                  <Link key={href} href={href} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', fontSize: '1.1rem', borderRadius: 'var(--radius-md)', color: pathname.startsWith(href) && href !== '/dashboard' ? 'var(--color-volt-yellow)' : 'var(--color-text-secondary)' }}>
                    <Icon size={20} /> {label}
                  </Link>
                ))}
                
                {isAdmin && (
                  <Link href="/admin" className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', fontSize: '1.1rem', borderRadius: 'var(--radius-md)', color: 'var(--color-text-secondary)' }}>
                    <ShieldCheck size={20} /> Admin Panel
                  </Link>
                )}
                
                <button onClick={handleSignOut} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', fontSize: '1.1rem', borderRadius: 'var(--radius-md)', color: 'var(--color-text-secondary)', textAlign: 'left', width: '100%' }}>
                  <LogOut size={20} /> Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Link href="/leaderboard" className="btn-ghost" style={{ padding: '16px', fontSize: '1.1rem', textAlign: 'center', borderRadius: 'var(--radius-md)' }}>Leaderboard</Link>
              <Link href="/projects" className="btn-ghost" style={{ padding: '16px', fontSize: '1.1rem', textAlign: 'center', borderRadius: 'var(--radius-md)' }}>Projects</Link>
              <Link href="/events" className="btn-ghost" style={{ padding: '16px', fontSize: '1.1rem', textAlign: 'center', borderRadius: 'var(--radius-md)' }}>Events</Link>
              <Link href="/login" className="btn btn-primary btn-lg" style={{ marginTop: 24 }}>Sign In</Link>
            </div>
          )}
        </div>
      )}

      <style>{`
        .hover-white { transition: color 0.15s; }
        .hover-white:hover { color: white !important; }
        @media (max-width: 900px) {
          .hide-on-mobile { display: none !important; }
          .mobile-only { display: flex !important; }
        }
      `}</style>
    </>
  )
}
