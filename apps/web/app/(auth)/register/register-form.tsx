'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Zap, ArrowRight, Loader2, Check } from 'lucide-react'

export default function RegisterForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailSent, setEmailSent] = useState(false)

  function update(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  function validateEmail(email: string): boolean {
    const domain = process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN
    if (!domain) return true
    return email.toLowerCase().endsWith(`@${domain}`)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (!validateEmail(formData.email)) {
      const domain = process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN
      setError(`Only @${domain} email addresses are allowed.`)
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { error: signUpError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: { full_name: formData.fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    setEmailSent(true)
  }

  if (emailSent) {
    return (
      <div
        className="card text-center fade-in"
        style={{ maxWidth: 440, padding: '48px 36px', width: '100%' }}
      >
        <div
          className="flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-6"
          style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}
        >
          <Check size={28} color="var(--color-success)" />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 10 }}>Check your email</h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>
          We sent a verification link to{' '}
          <strong style={{ color: 'var(--color-text-primary)' }}>{formData.email}</strong>.
          Click the link to verify your account.
        </p>
        <div
          style={{
            marginTop: 24,
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-surface-2)',
            fontSize: '0.8rem',
            color: 'var(--color-text-muted)',
          }}
        >
          After verifying, you&apos;ll complete your profile with your enrollment number.
        </div>
      </div>
    )
  }

  const passwordStrength =
    formData.password.length === 0
      ? 0
      : formData.password.length < 8
      ? 1
      : /[A-Z]/.test(formData.password) && /[0-9]/.test(formData.password)
      ? 3
      : 2

  const strengthLabels = ['', 'Weak', 'Fair', 'Strong']
  const strengthColors = ['', '#EF4444', '#F59E0B', '#10B981']

  return (
    <div
      className="card w-full fade-in"
      style={{ maxWidth: 460, padding: '40px 36px' }}
    >
      {/* Header */}
      <div className="mb-8">
        <div
          className="flex items-center justify-center w-12 h-12 rounded-xl mb-6"
          style={{ background: 'rgba(245,197,24,0.1)', border: '1px solid rgba(245,197,24,0.2)' }}
        >
          <Zap size={22} color="var(--color-volt-yellow)" />
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
          Join VOLT League
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: 6, fontSize: '0.9rem' }}>
          Create your account to start earning points
        </p>
      </div>

      {error && (
        <div
          className="fade-in"
          style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            marginBottom: 20,
            fontSize: '0.875rem',
            color: '#EF4444',
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div className="input-group">
          <label htmlFor="reg-fullname">Full Name</label>
          <input
            id="reg-fullname"
            type="text"
            value={formData.fullName}
            onChange={(e) => update('fullName', e.target.value)}
            placeholder="Rahul Sharma"
            required
            autoComplete="name"
          />
        </div>

        <div className="input-group">
          <label htmlFor="reg-email">College Email</label>
          <input
            id="reg-email"
            type="email"
            value={formData.email}
            onChange={(e) => update('email', e.target.value)}
            placeholder="you@jnu.ac.in"
            required
            autoComplete="email"
          />
          {process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN && (
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
              Only @{process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN} emails allowed
            </p>
          )}
        </div>

        <div className="input-group">
          <label htmlFor="reg-password">Password</label>
          <div style={{ position: 'relative' }}>
            <input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => update('password', e.target.value)}
              placeholder="Min. 8 characters"
              required
              style={{ paddingRight: 44 }}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="btn-icon btn-ghost"
              style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {formData.password.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
              <div style={{ flex: 1, display: 'flex', gap: 3 }}>
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: 3,
                      borderRadius: 9999,
                      background:
                        i <= passwordStrength
                          ? strengthColors[passwordStrength]
                          : 'var(--color-surface-4)',
                      transition: 'background 0.3s',
                    }}
                  />
                ))}
              </div>
              <span
                style={{
                  fontSize: '0.75rem',
                  color: strengthColors[passwordStrength],
                  fontWeight: 600,
                }}
              >
                {strengthLabels[passwordStrength]}
              </span>
            </div>
          )}
        </div>

        <div className="input-group">
          <label htmlFor="reg-confirm">Confirm Password</label>
          <input
            id="reg-confirm"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => update('confirmPassword', e.target.value)}
            placeholder="Repeat your password"
            required
            autoComplete="new-password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary btn-lg"
          style={{ marginTop: 4 }}
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <>
              Create Account <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      <div className="divider" />

      <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
        Already have an account?{' '}
        <Link href="/login" style={{ color: 'var(--color-volt-yellow)', fontWeight: 600 }}>
          Sign in
        </Link>
      </p>
    </div>
  )
}
