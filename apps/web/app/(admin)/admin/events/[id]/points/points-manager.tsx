'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2, Plus, Users, Award } from 'lucide-react'

interface Attendee {
  userId: string
  fullName: string
  enrollment: string
}

interface Transaction {
  id: string
  userId: string
  userName: string
  points: number
  reason: string
  date: string
}

export default function PointsManager({
  eventId,
  seasonId,
  awardedBy,
  attendees,
  transactions,
}: {
  eventId: string
  seasonId: string
  awardedBy: string
  attendees: Attendee[]
  transactions: Transaction[]
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'individual' | 'bulk'>('bulk')
  
  const [points, setPoints] = useState('50')
  const [reason, setReason] = useState('Event Attendance')
  const [selectedUser, setSelectedUser] = useState(attendees[0]?.userId ?? '')

  async function handleAward(e: React.FormEvent) {
    e.preventDefault()
    if (!points || isNaN(parseInt(points))) return
    
    setLoading(true)
    setError('')
    const supabase = createClient()
    
    const amount = parseInt(points)
    
    try {
      if (mode === 'bulk') {
        const inserts = attendees.map(a => ({
          user_id: a.userId,
          season_id: seasonId,
          event_id: eventId,
          points: amount,
          reason,
          awarded_by: awardedBy
        }))
        
        if (inserts.length > 0) {
          const { error: err } = await supabase.from('point_transactions').insert(inserts)
          if (err) throw err
        }
      } else {
        const { error: err } = await supabase.from('point_transactions').insert({
          user_id: selectedUser,
          season_id: seasonId,
          event_id: eventId,
          points: amount,
          reason,
          awarded_by: awardedBy
        })
        if (err) throw err
      }
      
      // Trigger leaderboard refresh
      await supabase.rpc('refresh_leaderboard')
      
      setReason('')
      setPoints('50')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24, alignItems: 'start' }}>
      
      {/* Award Form */}
      <div className="card" style={{ padding: 24 }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Award size={18} color="var(--color-volt-yellow)" /> Award Points
        </h2>
        
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <button 
            type="button" 
            onClick={() => setMode('bulk')}
            className={`btn btn-sm ${mode === 'bulk' ? 'btn-primary' : 'btn-ghost'}`} 
            style={{ flex: 1 }}
          >
            All Attendees
          </button>
          <button 
            type="button" 
            onClick={() => setMode('individual')}
            className={`btn btn-sm ${mode === 'individual' ? 'btn-primary' : 'btn-ghost'}`} 
            style={{ flex: 1 }}
          >
            Individual
          </button>
        </div>

        <form onSubmit={handleAward} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && <p style={{ fontSize: '0.8rem', color: '#EF4444' }}>{error}</p>}
          
          {mode === 'individual' && (
            <div className="input-group">
              <label>Select Attendee</label>
              <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} required>
                {attendees.map(a => (
                  <option key={a.userId} value={a.userId}>{a.fullName} ({a.enrollment})</option>
                ))}
              </select>
            </div>
          )}
          
          <div className="input-group">
            <label>Points to Award</label>
            <input type="number" value={points} onChange={(e) => setPoints(e.target.value)} required placeholder="50" />
          </div>
          
          <div className="input-group">
            <label>Reason</label>
            <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} required placeholder="e.g. Won the mini-challenge" />
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={loading || attendees.length === 0}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            {mode === 'bulk' ? `Award to ${attendees.length} users` : 'Award Points'}
          </button>
        </form>
      </div>

      {/* Transaction History */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Event Point History</h2>
        </div>
        
        {transactions.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>
            No points have been awarded for this event yet.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Points</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t.userName}</td>
                  <td style={{ color: 'var(--color-volt-yellow)', fontWeight: 800 }}>+{t.points}</td>
                  <td style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{t.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  )
}
