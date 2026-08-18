'use client'

import { useState } from 'react'
import { awardManualPoints } from './actions'
import { Loader2, Plus, AlertCircle, Check } from 'lucide-react'

import { useRouter } from 'next/navigation'

export default function AwardPointsForm({
  seasonId,
  users,
}: {
  seasonId: string
  users: { id: string; full_name: string; enrollment_number: string }[]
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const formData = new FormData(e.currentTarget)
    formData.append('seasonId', seasonId)

    const res = await awardManualPoints(formData)

    if (res.error) {
      setError(res.error)
    } else {
      setSuccess('Points awarded successfully!')
      e.currentTarget.reset()
      router.refresh()
      setTimeout(() => setSuccess(''), 3000)
    }

    setLoading(false)
  }

  return (
    <div className="card" style={{ padding: '24px', marginBottom: 24 }}>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 16 }}>Manual Point Award</h2>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: 20 }}>
        Directly award or deduct points for a student outside of normal events and challenges.
      </p>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', padding: '12px 16px', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {success && (
        <div style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', padding: '12px 16px', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Check size={16} /> {success}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
        <div className="input-group">
          <label>Select Student</label>
          <select name="studentId" required style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', color: 'var(--color-text-base)' }}>
            <option value="">-- Choose a student --</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>
                {u.full_name} ({u.enrollment_number})
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 16 }}>
          <div className="input-group">
            <label>Points</label>
            <input
              type="number"
              name="points"
              placeholder="e.g. 50"
              required
            />
          </div>
          <div className="input-group">
            <label>Reason / Remark</label>
            <input
              type="text"
              name="reason"
              placeholder="e.g. Outstanding assistance during workshop"
              required
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary" style={{ marginTop: 8, alignSelf: 'flex-start' }}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          Award Points
        </button>
      </form>
    </div>
  )
}
