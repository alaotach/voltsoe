import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import SubmissionTable from './submission-table'
import { Clock, Star, Trophy } from 'lucide-react'

export const metadata: Metadata = { title: 'Review Challenge' }

export default async function ChallengeReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: challengeId } = await params
  const supabase = await createClient()

  const { data: challenge } = await supabase
    .from('challenges')
    .select('*')
    .eq('id', challengeId)
    .single()
    
  if (!challenge) notFound()

  const { data: submissions } = await supabase
    .from('submissions')
    .select('*, users(full_name, enrollment_number)')
    .eq('challenge_id', challengeId)
    .order('submitted_at', { ascending: true })

  const isExpired = new Date(challenge.deadline) < new Date()

  return (
    <div className="fade-in">
      <a href="/admin/challenges" style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 20 }}>← Back to Challenges</a>
      
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.03em' }}>{challenge.title}</h1>
              {challenge.is_boss && <span className="badge badge-red">BOSS</span>}
              <span className={`badge ${challenge.is_active ? 'badge-green' : 'badge-gray'}`}>
                {challenge.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: 16, maxWidth: 600 }}>
              {challenge.description}
            </p>
            <div style={{ display: 'flex', gap: 16, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={14} /> {isExpired ? 'Expired' : 'Closes'} {new Date(challenge.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Trophy size={14} /> {challenge.reward_points} pts reward
              </span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-volt-yellow)', lineHeight: 1 }}>{challenge.reward_points}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>points per approval</p>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Submissions</h2>
        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
          {(submissions ?? []).length} total
        </span>
      </div>
      
      <SubmissionTable challenge={challenge} submissions={submissions ?? []} />
    </div>
  )
}
