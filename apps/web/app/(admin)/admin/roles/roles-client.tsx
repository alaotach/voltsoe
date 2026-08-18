'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UserCog, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react'
import { PERMISSIONS, type Permission } from '@/lib/permissions'

const ROLES = ['student', 'core', 'vp', 'president', 'super_admin']

const ROLE_COLORS: Record<string, string> = {
  student: 'badge-gray',
  core: 'badge-blue',
  vp: 'badge-purple',
  president: 'badge-red',
  super_admin: 'badge-red',
}

export default function RolesClient({ users, currentUserId }: { users: any[], currentUserId: string }) {
  const [search, setSearch] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)
  const [localUsers, setLocalUsers] = useState(users)
  const [expanded, setExpanded] = useState<string | null>(null)

  const filtered = localUsers.filter(
    (u) =>
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.enrollment_number?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  )

  async function updateRole(userId: string, newRole: string) {
    setUpdating(userId)
    const supabase = createClient()
    await supabase.from('users').update({ role: newRole }).eq('id', userId)
    setLocalUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u))
    setUpdating(null)
  }

  async function togglePermission(userId: string, perm: Permission, currentPerms: string[]) {
    setUpdating(userId + perm)
    const supabase = createClient()
    const newPerms = currentPerms.includes(perm)
      ? currentPerms.filter((p) => p !== perm)
      : [...currentPerms, perm]
    await supabase.from('users').update({ custom_permissions: newPerms }).eq('id', userId)
    setLocalUsers((prev) => prev.map((u) => u.id === userId ? { ...u, custom_permissions: newPerms } : u))
    setUpdating(null)
  }

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.03em' }}>Role & Permission Management</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
          Assign roles or grant specific permissions to individual members.
        </p>
      </div>

      {/* Permission legend */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: 20 }}>
        <p style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Available Permissions</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 8 }}>
          {PERMISSIONS.map((p) => (
            <div key={p.key} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>{p.label}</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{p.description}</span>
              <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>
                Default: {p.defaultRoles.join(', ')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="input-group" style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Search by name, enrollment, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 400 }}
        />
      </div>

      {/* User list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.length === 0 && (
          <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <UserCog size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
            <p>No users found.</p>
          </div>
        )}

        {filtered.map((u) => {
          const isSelf = u.id === currentUserId
          const isExpanded = expanded === u.id
          const customPerms: string[] = u.custom_permissions ?? []
          const isSuperAdmin = u.role === 'super_admin' || u.role === 'president'

          return (
            <div key={u.id} className="card" style={{ overflow: 'hidden' }}>
              {/* User row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px' }}>
                {/* Name */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{u.full_name}</p>
                    {isSelf && <span className="badge badge-blue" style={{ fontSize: '0.62rem' }}>You</span>}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{u.enrollment_number} · {u.email}</p>
                </div>

                {/* Role selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className={`badge ${ROLE_COLORS[u.role] ?? 'badge-gray'}`}>{u.role}</span>
                  {isSelf ? (
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>🔒 own role</span>
                  ) : (
                    <select
                      value={u.role}
                      disabled={updating === u.id}
                      onChange={(e) => updateRole(u.id, e.target.value)}
                      style={{ fontSize: '0.8rem', padding: '4px 8px', cursor: 'pointer', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text-primary)' }}
                    >
                      {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  )}
                </div>

                {/* Expand permissions */}
                <button
                  onClick={() => setExpanded(isExpanded ? null : u.id)}
                  className="btn btn-ghost btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem' }}
                >
                  <ShieldCheck size={13} />
                  Permissions
                  {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>
              </div>

              {/* Permission matrix */}
              {isExpanded && (
                <div style={{ borderTop: '1px solid var(--color-border)', padding: '16px 20px', background: 'rgba(0,0,0,0.15)' }}>
                  {isSuperAdmin ? (
                    <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                      ✅ <strong>{u.role}</strong> has all permissions by default. No custom overrides needed.
                    </p>
                  ) : (
                    <>
                      <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 12 }}>
                        Toggle individual permissions for this member. Green = has access (via role or custom grant). Checkboxes only show custom grants on top of their role.
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 8 }}>
                        {PERMISSIONS.map((perm) => {
                          const hasViaRole = (perm.defaultRoles as readonly string[]).includes(u.role)
                          const hasViaCustom = customPerms.includes(perm.key)
                          const hasAccess = hasViaRole || hasViaCustom
                          const isUpdating = updating === u.id + perm.key

                          return (
                            <label
                              key={perm.key}
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 10,
                                padding: '10px 12px',
                                borderRadius: 'var(--radius-sm)',
                                background: hasAccess ? 'rgba(124,58,237,0.07)' : 'rgba(255,255,255,0.02)',
                                border: `1px solid ${hasAccess ? 'rgba(124,58,237,0.25)' : 'var(--color-border)'}`,
                                cursor: hasViaRole ? 'default' : 'pointer',
                                opacity: isUpdating ? 0.5 : 1,
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={hasViaCustom}
                                disabled={hasViaRole || isUpdating}
                                onChange={() => togglePermission(u.id, perm.key as Permission, customPerms)}
                                style={{ marginTop: 2, accentColor: 'var(--color-volt-purple)', cursor: hasViaRole ? 'default' : 'pointer' }}
                              />
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>{perm.label}</span>
                                  {hasViaRole && <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>(via role)</span>}
                                  {hasViaCustom && !hasViaRole && <span className="badge badge-purple" style={{ fontSize: '0.6rem', padding: '1px 5px' }}>custom</span>}
                                </div>
                                <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: 2 }}>{perm.description}</p>
                              </div>
                            </label>
                          )
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
