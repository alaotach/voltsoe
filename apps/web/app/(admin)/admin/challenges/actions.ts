'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function reviewSubmission(
  submissionId: string,
  challengeId: string,
  userId: string,
  seasonId: string,
  rewardPoints: number,
  status: 'approved' | 'rejected',
  challengeTitle: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authorized' }

  // 1. Update the submission status
  const { error: updateError } = await supabase
    .from('submissions')
    .update({ 
      status, 
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString()
    })
    .eq('id', submissionId)
    
  if (updateError) return { error: updateError.message }

  // 2. If approved, award points
  if (status === 'approved') {
    const { error: pointsError } = await supabase
      .from('point_transactions')
      .insert({
        user_id: userId,
        season_id: seasonId,
        points: rewardPoints,
        reason: `Completed Challenge: ${challengeTitle}`,
        awarded_by: user.id
      })
      
    if (pointsError) return { error: pointsError.message }
    
    // 3. Refresh leaderboard
    await supabase.rpc('refresh_leaderboard')
  }

  revalidatePath(`/admin/challenges/${challengeId}`)
  return { success: true }
}
