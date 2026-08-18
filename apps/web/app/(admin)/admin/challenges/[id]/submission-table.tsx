'use client'

import { useState } from 'react'
import { reviewSubmission } from '../actions'
import { Loader2, Check, X } from 'lucide-react'

export default function SubmissionTable({
  challenge,
  submissions
}: {
  challenge: any
  submissions: any[]
}) {
  const [processing, setProcessing] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function handleReview(submissionId: string, userId: string, status: 'approved' | 'rejected') {
    setProcessing(submissionId)
    setError('')
    
    const result = await reviewSubmission(
      submissionId,
      challenge.id,
      userId,
      challenge.season_id,
      challenge.reward_points,
      status,
      challenge.title
    )
    
    if (result.error) {
      setError(result.error)
    }
    
    setProcessing(null)
  }

  if (submissions.length === 0) {
    return (
      <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>
        No submissions yet for this challenge.
      </div>
    )
  }

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      {error && (
        <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', color: '#EF4444', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}
      <table className="data-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Content / Link</th>
            <th>Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((sub) => (
            <tr key={sub.id}>
              <td>
                <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{sub.users?.full_name}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{sub.users?.enrollment_number}</p>
              </td>
              <td style={{ maxWidth: 300 }}>
                {sub.content && (
                  <p style={{ fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {sub.content.startsWith('http') ? (
                      <a href={sub.content} target="_blank" rel="noreferrer" style={{ color: 'var(--color-volt-blue)', textDecoration: 'underline' }}>{sub.content}</a>
                    ) : sub.content}
                  </p>
                )}
                {sub.file_url && (
                  <a href={sub.file_url} target="_blank" rel="noreferrer" style={{ color: 'var(--color-volt-blue)', fontSize: '0.8rem', textDecoration: 'underline' }}>
                    View File
                  </a>
                )}
              </td>
              <td style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                {new Date(sub.submitted_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </td>
              <td>
                <span className={`badge ${sub.status === 'approved' ? 'badge-green' : sub.status === 'rejected' ? 'badge-red' : 'badge-yellow'}`}>
                  {sub.status}
                </span>
              </td>
              <td>
                {sub.status === 'pending' ? (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button 
                      onClick={() => handleReview(sub.id, sub.user_id, 'approved')}
                      disabled={processing === sub.id}
                      className="btn btn-sm btn-ghost"
                      style={{ color: 'var(--color-success)', padding: '4px 8px' }}
                      title="Approve & Award Points"
                    >
                      {processing === sub.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    </button>
                    <button 
                      onClick={() => handleReview(sub.id, sub.user_id, 'rejected')}
                      disabled={processing === sub.id}
                      className="btn btn-sm btn-ghost"
                      style={{ color: '#EF4444', padding: '4px 8px' }}
                      title="Reject"
                    >
                      {processing === sub.id ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                    </button>
                  </div>
                ) : (
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Reviewed</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
