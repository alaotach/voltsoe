import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { cookies } from 'next/headers'
import { PREVIEW_COOKIE } from '@/lib/season'
import SeasonCard from './season-card'

export const metadata: Metadata = { title: 'Season Management' }
export const dynamic = 'force-dynamic'

export default async function AdminSeasonPage() {
  const supabase = await createClient()
  const cookieStore = await cookies()
  const previewSeasonId = cookieStore.get(PREVIEW_COOKIE)?.value ?? null

  const { data: seasons } = await supabase
    .from('seasons')
    .select('*')
    .order('start_date', { ascending: false })

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.03em' }}>Seasons</h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
            Manage leagues, switch active season, and preview past data.
          </p>
        </div>
        <Link href="/admin/season/new" className="btn btn-primary btn-sm"><Plus size={14} /> New Season</Link>
      </div>

      {(seasons ?? []).length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <p>No seasons yet. <Link href="/admin/season/new" style={{ color: 'var(--color-volt-yellow)' }}>Create one.</Link></p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {(seasons ?? []).map((season) => (
            <SeasonCard
              key={season.id}
              season={season}
              isPreviewing={previewSeasonId === season.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}
