'use client'

import { useTransition, useState } from 'react'
import { CheckCircle, XCircle, Eye, EyeOff, Zap, BookOpen, Pencil, Trash2, Save, X } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import {
  activateSeason,
  deactivateSeason,
  toggleRecap,
  setPreviewSeason,
  clearPreviewSeason,
  updateSeason,
  deleteSeason,
} from './actions'
import { useRouter } from 'next/navigation'

export default function SeasonCard({
  season,
  isPreviewing,
}: {
  season: any
  isPreviewing: boolean
}) {
  const [pending, startTransition] = useTransition()
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: season.name,
    start_date: season.start_date,
    end_date: season.end_date,
  })
  const router = useRouter()

  function action(fn: () => Promise<void>) {
    setError('')
    startTransition(async () => {
      try {
        await fn()
        router.refresh()
      } catch (e: any) {
        setError(e.message ?? 'Something went wrong')
      }
    })
  }

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function saveEdit() {
    if (new Date(form.end_date) <= new Date(form.start_date)) {
      setError('End date must be after start date.')
      return
    }
    const slug = form.name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    action(async () => {
      await updateSeason(season.id, { ...form, slug })
      setEditing(false)
    })
  }

  return (
    <div
      className="card"
      style={{
        overflow: 'hidden',
        borderColor: isPreviewing
          ? 'rgba(124,58,237,0.5)'
          : season.is_active
          ? 'rgba(34,197,94,0.3)'
          : 'var(--color-border)',
        opacity: pending ? 0.7 : 1,
        transition: 'opacity 0.2s',
      }}
    >
      {/* Preview banner */}
      {isPreviewing && (
        <div style={{
          background: 'var(--color-volt-purple)', color: '#fff',
          fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em',
          padding: '4px 14px', textAlign: 'center', textTransform: 'uppercase',
        }}>
          Currently Previewing This Season
        </div>
      )}

      <div style={{ padding: '20px 24px' }}>
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', marginBottom: 14, fontSize: '0.82rem', color: '#EF4444' }}>
            {error}
          </div>
        )}

        {editing ? (
          /* ── Edit form ── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="input-group" style={{ marginBottom: 0, gridColumn: '1/-1' }}>
                <label style={{ fontSize: '0.75rem' }}>Season Name</label>
                <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)} />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '0.75rem' }}>Start Date</label>
                <input type="date" value={form.start_date} onChange={(e) => update('start_date', e.target.value)} />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '0.75rem' }}>End Date</label>
                <input type="date" value={form.end_date} onChange={(e) => update('end_date', e.target.value)} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary btn-sm" disabled={pending} onClick={saveEdit}>
                <Save size={13} /> Save Changes
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(false); setError('') }}>
                <X size={13} /> Cancel
              </button>
            </div>
          </div>
        ) : (
          /* ── View mode ── */
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
            {/* Info */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <h2 style={{ fontWeight: 800, fontSize: '1.05rem' }}>{season.name}</h2>
                {season.is_active && <span className="badge badge-green">ACTIVE</span>}
                {season.recap_published && <span className="badge badge-blue">RECAP LIVE</span>}
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontFamily: 'monospace', marginBottom: 6 }}>{season.slug}</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                {formatDate(season.start_date, { day: 'numeric', month: 'short', year: 'numeric' })}
                {' → '}
                {formatDate(season.end_date, { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
              <p style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', marginTop: 6, fontFamily: 'monospace' }}>ID: {season.id}</p>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end', flexShrink: 0 }}>

              {season.is_active ? (
                /* ── Active season: can only deactivate or edit ── */
                <>
                  <button className="btn btn-secondary btn-sm" disabled={pending} onClick={() => action(() => deactivateSeason(season.id))} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <XCircle size={13} /> Deactivate
                  </button>
                  <button className="btn btn-ghost btn-sm" disabled={pending} onClick={() => setEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Pencil size={13} /> Edit Details
                  </button>
                </>
              ) : (
                /* ── Inactive / past season ── */
                <>
                  <button className="btn btn-primary btn-sm" disabled={pending} onClick={() => action(() => activateSeason(season.id))} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Zap size={13} /> Set Active
                  </button>

                  {/* Preview */}
                  {isPreviewing ? (
                    <button className="btn btn-ghost btn-sm" disabled={pending} onClick={() => action(() => clearPreviewSeason())} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <EyeOff size={13} /> Stop Preview
                    </button>
                  ) : (
                    <button className="btn btn-ghost btn-sm" disabled={pending} onClick={() => action(() => setPreviewSeason(season.id))} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Eye size={13} /> Preview Admin
                    </button>
                  )}

                  {/* Recap — only for ended seasons */}
                  <button className="btn btn-ghost btn-sm" disabled={pending} onClick={() => action(() => toggleRecap(season.id, season.recap_published))} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <BookOpen size={13} /> {season.recap_published ? 'Unpublish Recap' : 'Publish Recap'}
                  </button>

                  {/* Edit */}
                  <button className="btn btn-ghost btn-sm" disabled={pending} onClick={() => setEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Pencil size={13} /> Edit Details
                  </button>

                  {/* Delete with confirm */}
                  {confirmDelete ? (
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: '#EF4444' }}>Sure?</span>
                      <button className="btn btn-sm" disabled={pending} onClick={() => action(() => deleteSeason(season.id))} style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Trash2 size={12} /> Delete
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setConfirmDelete(false)}><X size={12} /></button>
                    </div>
                  ) : (
                    <button className="btn btn-ghost btn-sm" disabled={pending} onClick={() => setConfirmDelete(true)} style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#EF4444' }}>
                      <Trash2 size={13} /> Delete
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

