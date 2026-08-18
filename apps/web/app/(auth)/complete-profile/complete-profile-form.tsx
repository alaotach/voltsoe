'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { normalizeEnrollment } from '@/lib/utils'
import { User, ArrowRight, Loader2 } from 'lucide-react'

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Electronics & Communication Engineering',
]

export default function CompleteProfileForm({
  userId,
  email,
  fullName: initialFullName,
}: {
  userId: string
  email: string
  fullName: string
}) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: initialFullName,
    enrollmentNumber: '',
    batch: '',
    department: '',
    phone: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function update(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const normalized = normalizeEnrollment(formData.enrollmentNumber)
    if (!normalized) {
      setError('Invalid enrollment number format. Must be YY/11/EE/NNN or YY/11/EC/NNN')
      setLoading(false)
      return
    }

    const batchYear = formData.batch.trim()
    if (!/^\d{4}$/.test(batchYear)) {
      setError('Batch must be a 4-digit joining year (e.g. 2024).')
      setLoading(false)
      return
    }

    const supabase = createClient()

    // Use upsert so that if the profile already exists (e.g. page was refreshed
    // after a successful save), we just update it and move on instead of erroring.
    const { error: upsertError } = await supabase.from('users').upsert(
      {
        id: userId,
        full_name: formData.fullName.trim(),
        email,
        enrollment_number: normalized,
        batch: formData.batch.trim(),
        department: formData.department,
        phone: formData.phone.trim() || null,
        role: 'student',
        is_verified: false,
        email_verified: true,
      },
      { onConflict: 'id' }
    )

    if (upsertError) {
      // If enrollment number belongs to a *different* user
      if (upsertError.code === '23505') {
        setError('That enrollment number is already linked to another account. Contact admin if this is an error.')
      } else {
        setError(upsertError.message)
      }
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div
      className="card w-full fade-in"
      style={{ maxWidth: 500, padding: '40px 36px' }}
    >
      <div className="mb-8">
        <div
          className="flex items-center justify-center w-12 h-12 rounded-xl mb-6"
          style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}
        >
          <User size={22} color="#A78BFA" />
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
          Complete your profile
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: 6, fontSize: '0.9rem' }}>
          One last step — tell us about your enrollment
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

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="input-group">
          <label htmlFor="cp-fullname">Full Name</label>
          <input
            id="cp-fullname"
            type="text"
            value={formData.fullName}
            onChange={(e) => update('fullName', e.target.value)}
            placeholder="Rahul Sharma"
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="cp-enrollment">Enrollment Number</label>
          <input
            id="cp-enrollment"
            type="text"
            value={formData.enrollmentNumber}
            onChange={(e) => update('enrollmentNumber', e.target.value)}
            placeholder="e.g. 24/11/EC/010"
            required
          />
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
            Format: YY/11/EE/NNN or YY/11/EC/NNN (e.g. 24/11/EE/010)
          </p>
        </div>

        <div className="input-group">
          <label htmlFor="cp-batch">Batch (Joining Year)</label>
          <input
            id="cp-batch"
            type="text"
            value={formData.batch}
            onChange={(e) => update('batch', e.target.value)}
            placeholder="e.g. 2024"
            maxLength={4}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="cp-dept">Department</label>
          <select
            id="cp-dept"
            value={formData.department}
            onChange={(e) => update('department', e.target.value)}
            required
            style={{ cursor: 'pointer' }}
          >
            <option value="" disabled>Select your department</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label htmlFor="cp-phone">Phone Number</label>
          <input
            id="cp-phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => update('phone', e.target.value)}
            placeholder="+91 98765 43210"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary btn-lg"
          style={{ marginTop: 8 }}
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <>
              Go to Dashboard <ArrowRight size={16} />
            </>
          )}
        </button>
        
        <button
          type="button"
          disabled={loading}
          onClick={async () => {
            const supabase = createClient()
            await supabase.auth.signOut()
            router.push('/login')
            router.refresh()
          }}
          className="btn btn-secondary btn-lg"
          style={{ marginTop: 8 }}
        >
          Cancel & Sign out
        </button>
      </form>
    </div>
  )
}
