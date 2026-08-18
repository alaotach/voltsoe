'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export default function NewChallengeForm({
  seasonId, createdBy
}: {
  seasonId: string
  createdBy: string
}) {
  const router = useRouter()
  const [form, setForm] = useState({
    title: '',
    description: '',
    reward_points: '',
    deadline: '',
    is_active: true,
    is_boss: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function update(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const supabase = createClient()
    
    // Ensure deadline is stored as a proper timestamp (add time if only date is provided, though we use datetime-local)
    const deadlineDate = new Date(form.deadline)
    
    const { error: insertError } = await supabase.from('challenges').insert({
      season_id: seasonId,
      title: form.title,
      description: form.description,
      reward_points: parseInt(form.reward_points),
      deadline: deadlineDate.toISOString(),
      is_active: form.is_active,
      is_boss: form.is_boss,
      created_by: createdBy,
    })
    
    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }
    
    router.push('/admin/challenges')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 900 }}>
      {error && (
        <div style={{ gridColumn: '1/-1', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-md)', padding: '10px 14px', color: '#EF4444', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      <div style={{ gridColumn: '1/-1' }} className="input-group">
        <label htmlFor="ch-title">Challenge Title *</label>
        <input id="ch-title" type="text" value={form.title} onChange={(e) => update('title', e.target.value)} required placeholder="e.g. Build a Portfolio Website" />
      </div>

      <div style={{ gridColumn: '1/-1' }} className="input-group">
        <label htmlFor="ch-desc">Description *</label>
        <textarea 
          id="ch-desc" 
          value={form.description} 
          onChange={(e) => update('description', e.target.value)} 
          required 
          rows={4}
          placeholder="Provide instructions and requirements for the challenge..." 
        />
      </div>

      <div className="input-group">
        <label htmlFor="ch-points">Reward Points *</label>
        <input id="ch-points" type="number" min="1" value={form.reward_points} onChange={(e) => update('reward_points', e.target.value)} required placeholder="e.g. 100" />
      </div>

      <div className="input-group">
        <label htmlFor="ch-deadline">Deadline *</label>
        <input id="ch-deadline" type="datetime-local" value={form.deadline} onChange={(e) => update('deadline', e.target.value)} required />
      </div>

      <div className="input-group" style={{ display: 'flex', flexDirection: 'row', gap: 12, alignItems: 'center', marginTop: 8 }}>
        <input id="ch-boss" type="checkbox" checked={form.is_boss} onChange={(e) => update('is_boss', e.target.checked)} style={{ width: 'auto' }} />
        <div>
          <label htmlFor="ch-boss" style={{ margin: 0, display: 'inline' }}>Boss Challenge</label>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>Highlights the challenge as a major milestone</p>
        </div>
      </div>
      
      <div className="input-group" style={{ display: 'flex', flexDirection: 'row', gap: 12, alignItems: 'center', marginTop: 8 }}>
        <input id="ch-active" type="checkbox" checked={form.is_active} onChange={(e) => update('is_active', e.target.checked)} style={{ width: 'auto' }} />
        <div>
          <label htmlFor="ch-active" style={{ margin: 0, display: 'inline' }}>Active</label>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>Visible to students immediately</p>
        </div>
      </div>

      <div style={{ gridColumn: '1/-1', marginTop: 12, display: 'flex', gap: 12 }}>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : null}
          Create Challenge
        </button>
        <button type="button" onClick={() => router.push('/admin/challenges')} className="btn btn-ghost" disabled={loading}>
          Cancel
        </button>
      </div>
    </form>
  )
}
