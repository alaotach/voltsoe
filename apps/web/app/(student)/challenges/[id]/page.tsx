import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { Clock, Zap } from 'lucide-react'
import { timeRemaining, formatDate } from '@/lib/utils'
import SubmitChallengeForm from './submit-form'

export const metadata: Metadata = { title: 'Challenge' }

export default async function ChallengeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: challenge } = await supabase
    .from('challenges')
    .select('*')
    .eq('id', id)
    .single()

  if (!challenge) notFound()

  const { data: submission } = await supabase
    .from('submissions')
    .select('*')
    .eq('challenge_id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  const rem = timeRemaining(challenge.deadline)
  const isExpired = rem.expired || !challenge.is_active

  return (
    <div className="fade-in">
      <a href="/challenges" style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 20 }}>
        ← Back to Challenges
      </a>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
        {/* Main */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              {challenge.is_boss && <span className="badge badge-purple">BOSS CHALLENGE</span>}
              {isExpired && <span className="badge badge-gray">Expired</span>}
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: 16 }}>{challenge.title}</h1>

            <div className="card" style={{ padding: '24px' }}>
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8, fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
                {challenge.description}
              </p>
            </div>
          </div>

          {/* Submission form or status */}
          {submission ? (
            <div className="card" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>Your Submission</h2>
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: submission.status === 'approved' ? 'rgba(16,185,129,0.08)' : submission.status === 'rejected' ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${submission.status === 'approved' ? 'rgba(16,185,129,0.2)' : submission.status === 'rejected' ? 'rgba(239,68,68,0.2)' : 'var(--color-border)'}`,
                  marginBottom: 12,
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: submission.status === 'approved' ? 'var(--color-success)' : submission.status === 'rejected' ? 'var(--color-danger)' : 'var(--color-text-secondary)',
                }}
              >
                Status: {submission.status}
              </div>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', lineHeight: 1.7 }}>{submission.content}</p>
            </div>
          ) : !isExpired ? (
            <SubmitChallengeForm challengeId={id} userId={user.id} />
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
              <p>This challenge has expired.</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 24 }}>
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: '3rem', fontWeight: 900, color: '#A78BFA', letterSpacing: '-0.04em' }}>+{challenge.reward_points}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Points</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: rem.hours < 24 ? 'var(--color-danger)' : 'var(--color-text-muted)', justifyContent: 'center' }}>
              <Clock size={13} />
              {isExpired ? 'Expired' : rem.label}
            </div>
          </div>

          <div className="card" style={{ padding: '18px' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Deadline</p>
            <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>
              {formatDate(challenge.deadline, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
