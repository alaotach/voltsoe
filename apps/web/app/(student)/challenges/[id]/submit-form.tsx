'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Send } from 'lucide-react'

export default function SubmitChallengeForm({ challengeId, userId }: { challengeId: string; userId: string }) {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) { setError('Please write your solution.'); return }
    setLoading(true)
    setError('')

    const res = await fetch(`/api/challenges/${challengeId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })

    if (res.ok) {
      setSuccess(true)
      router.refresh()
    } else {
      const body = await res.json()
      setError(body.error ?? 'Submission failed.')
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
        <p style={{ fontSize: '2rem', marginBottom: 8 }}>✅</p>
        <p style={{ fontWeight: 700 }}>Submission received!</p>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: 6 }}>The team will review it soon.</p>
      </div>
    )
  }

  return (
    <div className="card" style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>Submit Your Solution</h2>
      {error && (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: 14, fontSize: '0.875rem', color: '#EF4444' }}>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="input-group">
          <label htmlFor="solution">Your Solution / Explanation</label>
          <textarea
            id="solution"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            placeholder="Explain your approach, paste code, or describe your circuit design..."
            style={{ resize: 'vertical', fontFamily: 'inherit' }}
          />
        </div>
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <><Send size={14} /> Submit</>}
        </button>
      </form>
    </div>
  )
}
