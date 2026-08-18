'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Upload } from 'lucide-react'

export default function NewProjectForm({
  userId,
  seasonId,
  events,
}: {
  userId: string
  seasonId: string
  events: { id: string; title: string }[]
}) {
  const router = useRouter()
  const [form, setForm] = useState({
    title: '',
    description: '',
    event_id: '',
    demo_video_url: '',
    tags: '',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.description.trim()) {
      setError('Title and description are required.')
      return
    }
    setLoading(true)
    setError('')

    const supabase = createClient()
    let imageUrl: string | null = null

    // Upload image if provided
    if (imageFile) {
      const ext = imageFile.name.split('.').pop()
      const path = `projects/${userId}-${Date.now()}.${ext}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('project-images')
        .upload(path, imageFile, { upsert: true })
      if (uploadError) {
        setError(`Image upload failed: ${uploadError.message}`)
        setLoading(false)
        return
      }
      const { data: { publicUrl } } = supabase.storage.from('project-images').getPublicUrl(uploadData.path)
      imageUrl = publicUrl
    }

    const tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean)

    const { error: insertError } = await supabase.from('projects').insert({
      user_id: userId,
      season_id: seasonId,
      event_id: form.event_id || null,
      title: form.title.trim(),
      description: form.description.trim(),
      image_url: imageUrl,
      demo_video_url: form.demo_video_url.trim() || null,
      tags: tags.length > 0 ? tags : null,
      is_published: true,
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push('/projects')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 18 }}>
      {error && (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: '0.875rem', color: '#EF4444' }}>
          {error}
        </div>
      )}

      <div className="input-group">
        <label htmlFor="proj-title">Project Title</label>
        <input id="proj-title" type="text" value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="Mini Audio Amplifier" required />
      </div>

      <div className="input-group">
        <label htmlFor="proj-desc">Description</label>
        <textarea
          id="proj-desc"
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          rows={6}
          placeholder="Describe what you built, how it works, and what you learned..."
          style={{ resize: 'vertical' }}
          required
        />
      </div>

      <div className="input-group">
        <label htmlFor="proj-event">Related Event <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(optional)</span></label>
        <select id="proj-event" value={form.event_id} onChange={(e) => update('event_id', e.target.value)}>
          <option value="">No specific event</option>
          {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
        </select>
      </div>

      <div className="input-group">
        <label htmlFor="proj-image">Project Image <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(optional)</span></label>
        <div
          style={{
            border: '2px dashed var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '24px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'border-color 0.2s',
          }}
          onClick={() => document.getElementById('proj-image-input')?.click()}
        >
          <Upload size={20} style={{ margin: '0 auto 8px', color: 'var(--color-text-muted)' }} />
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            {imageFile ? imageFile.name : 'Click to upload image'}
          </p>
          <input
            id="proj-image-input"
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
          />
        </div>
      </div>

      <div className="input-group">
        <label htmlFor="proj-video">Demo Video URL <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(optional)</span></label>
        <input id="proj-video" type="url" value={form.demo_video_url} onChange={(e) => update('demo_video_url', e.target.value)} placeholder="https://youtu.be/..." />
      </div>

      <div className="input-group">
        <label htmlFor="proj-tags">Tags <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(comma separated, optional)</span></label>
        <input id="proj-tags" type="text" value={form.tags} onChange={(e) => update('tags', e.target.value)} placeholder="analog, pcb, embedded" />
      </div>

      <button type="submit" disabled={loading} className="btn btn-primary btn-lg">
        {loading ? <Loader2 size={18} className="animate-spin" /> : 'Publish Project'}
      </button>
    </form>
  )
}
