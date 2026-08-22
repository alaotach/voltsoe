'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function RegisterButton({
  eventId,
  eventSlug,
  canRegister,
  isRegistered,
  isFull,
  registrationOpen,
  status,
  isAuthenticated,
}: {
  eventId: string
  eventSlug: string
  canRegister: boolean
  isRegistered: boolean
  isFull: boolean
  registrationOpen: boolean
  status: string | null
  isAuthenticated: boolean
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isAuthenticated) {
    return (
      <Link href="/login" className="btn btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        Sign in to Register
      </Link>
    )
  }

  async function handleRegister() {
    setLoading(true)
    setError('')
    const res = await fetch(`/api/events/${eventId}/register`, { method: 'POST' })
    if (res.ok) {
      router.refresh()
    } else {
      const body = await res.json()
      setError(body.error ?? 'Registration failed.')
    }
    setLoading(false)
  }

  async function handleUnregister() {
    if (!confirm('Are you sure you want to unregister from this event?')) return
    setLoading(true)
    setError('')
    const res = await fetch(`/api/events/${eventId}/register`, { method: 'DELETE' })
    if (res.ok) {
      router.refresh()
    } else {
      const body = await res.json()
      setError(body.error ?? 'Unregister failed.')
    }
    setLoading(false)
  }

  if (isRegistered && status === 'registered') {
    return (
      <div style={{ marginTop: 12 }}>
        <button
          onClick={handleUnregister}
          disabled={loading}
          className="btn btn-ghost"
          style={{ width: '100%', color: 'var(--color-text-muted)' }}
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : 'Cancel Registration'}
        </button>
        {error && <p style={{ color: '#EF4444', fontSize: '0.8rem', marginTop: 8, textAlign: 'center' }}>{error}</p>}
      </div>
    )
  }

  if (isRegistered) {
    return null // Status is handled in page.tsx (e.g. Checked In)
  }

  if (!registrationOpen) {
    return (
      <button disabled className="btn btn-secondary" style={{ width: '100%' }}>
        Registration Closed
      </button>
    )
  }

  if (isFull && !isRegistered) {
    return (
      <button disabled className="btn btn-secondary" style={{ width: '100%' }}>
        Event Full
      </button>
    )
  }

  if (canRegister) {
    return (
      <div>
        <button
          onClick={handleRegister}
          disabled={loading}
          className="btn btn-primary"
          style={{ width: '100%' }}
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : 'Register Now'}
        </button>
        {error && <p style={{ color: '#EF4444', fontSize: '0.8rem', marginTop: 8 }}>{error}</p>}
      </div>
    )
  }

  return null
}
