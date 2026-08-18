'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import ImageUpload from '@/components/image-upload'

export default function NewEventForm({
  seasonId, createdBy, pastEvents, organizers
}: {
  seasonId: string
  createdBy: string
  pastEvents: { id: string; title: string; slug: string }[]
  organizers: { id: string; full_name: string; role: string }[]
}) {
  const router = useRouter()
  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    what_youll_build: '',
    date: '',
    start_time: '',
    end_time: '',
    venue: '',
    capacity: '',
    difficulty: '',
    components_provided: '',
    what_to_bring: '',
    registration_deadline: '',
    is_team_event: false,
    status: 'draft',
    registration_open: false,
  })
  const [selectedOrganizers, setSelectedOrganizers] = useState<string[]>([])
  const [selectedPrereqs, setSelectedPrereqs] = useState<string[]>([])
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function update(field: string, value: string | boolean) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'title' ? { slug: slugify(value as string) } : {}),
    }))
  }

  function toggleOrganizer(id: string) {
    setSelectedOrganizers((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }

  function togglePrereq(slug: string) {
    setSelectedPrereqs((prev) => prev.includes(slug) ? prev.filter((x) => x !== slug) : [...prev, slug])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: insertError } = await supabase.from('events').insert({
      season_id: seasonId,
      title: form.title,
      slug: form.slug,
      description: form.description || null,
      what_youll_build: form.what_youll_build || null,
      date: form.date,
      start_time: form.start_time,
      end_time: form.end_time || null,
      venue: form.venue || null,
      capacity: form.capacity ? parseInt(form.capacity) : null,
      difficulty: form.difficulty || null,
      prerequisites: selectedPrereqs.length > 0 ? selectedPrereqs : null,
      components_provided: form.components_provided || null,
      what_to_bring: form.what_to_bring || null,
      organizer_ids: selectedOrganizers.length > 0 ? selectedOrganizers : null,
      registration_open: form.registration_open,
      registration_deadline: form.registration_deadline || null,
      is_team_event: form.is_team_event,
      cover_image_url: coverImageUrl || null,
      status: form.status,
      created_by: createdBy,
    })
    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }
    router.push('/admin/events')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 900 }}>
      {error && (
        <div style={{ gridColumn: '1/-1', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-md)', padding: '10px 14px', color: '#EF4444', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      {/* Cover Image */}
      <div style={{ gridColumn: '1/-1' }} className="input-group">
        <label>Event Poster <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(optional)</span></label>
        <div style={{ maxWidth: 240 }}>
          <ImageUpload
            bucket="event-covers"
            currentUrl={coverImageUrl || null}
            onUpload={setCoverImageUrl}
            shape="rect"
            aspectRatio="9/16"
            label="Upload poster"
          />
        </div>
      </div>

      <div className="input-group">
        <label htmlFor="ev-title">Event Name *</label>
        <input id="ev-title" type="text" value={form.title} onChange={(e) => update('title', e.target.value)} required />
      </div>
      <div className="input-group">
        <label htmlFor="ev-slug">Slug *</label>
        <input id="ev-slug" type="text" value={form.slug} onChange={(e) => update('slug', e.target.value)} required />
      </div>

      <div className="input-group" style={{ gridColumn: '1/-1' }}>
        <label htmlFor="ev-desc">Description</label>
        <textarea id="ev-desc" value={form.description} onChange={(e) => update('description', e.target.value)} rows={4} style={{ resize: 'vertical' }} />
      </div>

      <div className="input-group" style={{ gridColumn: '1/-1' }}>
        <label htmlFor="ev-build">What You&apos;ll Build</label>
        <textarea id="ev-build" value={form.what_youll_build} onChange={(e) => update('what_youll_build', e.target.value)} rows={3} style={{ resize: 'vertical' }} />
      </div>

      <div className="input-group">
        <label htmlFor="ev-date">Date *</label>
        <input id="ev-date" type="date" value={form.date} onChange={(e) => update('date', e.target.value)} required />
      </div>
      <div className="input-group">
        <label htmlFor="ev-venue">Venue</label>
        <input id="ev-venue" type="text" value={form.venue} onChange={(e) => update('venue', e.target.value)} />
      </div>

      <div className="input-group">
        <label htmlFor="ev-start">Start Time *</label>
        <input id="ev-start" type="time" value={form.start_time} onChange={(e) => update('start_time', e.target.value)} required />
      </div>
      <div className="input-group">
        <label htmlFor="ev-end">End Time</label>
        <input id="ev-end" type="time" value={form.end_time} onChange={(e) => update('end_time', e.target.value)} />
      </div>

      <div className="input-group">
        <label htmlFor="ev-cap">Capacity</label>
        <input id="ev-cap" type="number" value={form.capacity} onChange={(e) => update('capacity', e.target.value)} placeholder="Leave blank for unlimited" />
      </div>
      <div className="input-group">
        <label htmlFor="ev-diff">Difficulty</label>
        <select id="ev-diff" value={form.difficulty} onChange={(e) => update('difficulty', e.target.value)}>
          <option value="">Not specified</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      <div className="input-group">
        <label htmlFor="ev-deadline">Registration Deadline</label>
        <input id="ev-deadline" type="datetime-local" value={form.registration_deadline} onChange={(e) => update('registration_deadline', e.target.value)} />
      </div>
      <div className="input-group">
        <label htmlFor="ev-status">Status</label>
        <select id="ev-status" value={form.status} onChange={(e) => update('status', e.target.value)}>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      <div className="input-group" style={{ gridColumn: '1/-1' }}>
        <label htmlFor="ev-components">Components Provided</label>
        <input id="ev-components" type="text" value={form.components_provided} onChange={(e) => update('components_provided', e.target.value)} />
      </div>
      <div className="input-group" style={{ gridColumn: '1/-1' }}>
        <label htmlFor="ev-bring">What to Bring</label>
        <input id="ev-bring" type="text" value={form.what_to_bring} onChange={(e) => update('what_to_bring', e.target.value)} />
      </div>

      {/* Toggles */}
      <div style={{ gridColumn: '1/-1', display: 'flex', gap: 20 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.875rem' }}>
          <input type="checkbox" checked={form.registration_open} onChange={(e) => update('registration_open', e.target.checked)} style={{ width: 16, height: 16 }} />
          Registration Open
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.875rem' }}>
          <input type="checkbox" checked={form.is_team_event} onChange={(e) => update('is_team_event', e.target.checked)} style={{ width: 16, height: 16 }} />
          Team Event
        </label>
      </div>

      {/* Organizers */}
      {organizers.length > 0 && (
        <div className="input-group" style={{ gridColumn: '1/-1' }}>
          <label>Organizers</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {organizers.map((org) => (
              <label key={org.id} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.8rem', padding: '6px 10px', borderRadius: 'var(--radius-md)', background: selectedOrganizers.includes(org.id) ? 'rgba(245,197,24,0.1)' : 'var(--color-surface-2)', border: `1px solid ${selectedOrganizers.includes(org.id) ? 'rgba(245,197,24,0.3)' : 'var(--color-border)'}` }}>
                <input type="checkbox" checked={selectedOrganizers.includes(org.id)} onChange={() => toggleOrganizer(org.id)} style={{ display: 'none' }} />
                {org.full_name}
              </label>
            ))}
          </div>
        </div>
      )}

      <div style={{ gridColumn: '1/-1' }}>
        <button type="submit" disabled={loading} className="btn btn-primary btn-lg">
          {loading ? <Loader2 size={18} className="animate-spin" /> : 'Create Event'}
        </button>
      </div>
    </form>
  )
}
