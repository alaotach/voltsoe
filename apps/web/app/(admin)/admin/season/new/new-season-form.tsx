'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Layers, Loader2, ArrowRight } from 'lucide-react'

export default function NewSeasonForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    start_date: '',
    end_date: '',
  })

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (new Date(form.end_date) <= new Date(form.start_date)) {
      setError('End date must be after start date.')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const slug = form.name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const { error: insertError } = await supabase.from('seasons').insert({
      name: form.name.trim(),
      slug,
      start_date: form.start_date,
      end_date: form.end_date,
      is_active: true,
      recap_published: false,
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push('/admin/season')
    router.refresh()
  }

  return (
    <div className="fade-in" style={{ maxWidth: 560 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.03em' }}>Create Season</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
          A season groups all events, points, and challenges together.
        </p>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: 20, fontSize: '0.875rem', color: '#EF4444' }}>
          {error}
        </div>
      )}

      <div className="card" style={{ padding: '28px 32px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="input-group">
            <label>Season Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="e.g. Spring 2025"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="input-group">
              <label>Start Date</label>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => update('start_date', e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label>End Date</label>
              <input
                type="date"
                value={form.end_date}
                onChange={(e) => update('end_date', e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
            💡 The new season will be set as <strong>active</strong>. Remember to set <code>NEXT_PUBLIC_SEASON_ID</code> in your .env.local after creating it.
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary btn-lg" style={{ marginTop: 4 }}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : <><Layers size={16} /> Create Season <ArrowRight size={15} /></>}
          </button>
        </form>
      </div>
    </div>
  )
}
