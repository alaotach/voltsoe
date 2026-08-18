import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import NewChallengeForm from './new-challenge-form'
import { getViewingSeason } from '@/lib/season'

export const metadata: Metadata = { title: 'New Challenge' }

export default async function NewChallengePage() {
  const supabase = await createClient()
  const season = await getViewingSeason(true)

  if (!season) {
    return (
      <div className="fade-in card" style={{ padding: 40, textAlign: 'center' }}>
        <h2>No Active Season</h2>
        <p style={{ color: 'var(--color-text-muted)', marginTop: 8 }}>Please set an active season or enter preview mode before creating challenges.</p>
      </div>
    )
  }

  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="fade-in">
      <a href="/admin/challenges" style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 20 }}>← Back to Challenges</a>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 28 }}>Create New Challenge</h1>
      <NewChallengeForm
        seasonId={season.id}
        createdBy={user?.id ?? ''}
      />
    </div>
  )
}
