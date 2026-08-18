'use server'

import { createClient } from '@/lib/supabase/server'
import { awardPoints, logAdminAction } from '@/lib/points'
import { revalidatePath } from 'next/cache'

export async function awardManualPoints(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const { data: adminProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!adminProfile || !['core', 'vp', 'president', 'super_admin'].includes(adminProfile.role)) {
    return { error: 'Forbidden' }
  }

  const studentId = formData.get('studentId') as string
  const seasonId = formData.get('seasonId') as string
  const points = parseInt(formData.get('points') as string, 10)
  const reason = formData.get('reason') as string

  if (!studentId || !seasonId || isNaN(points) || !reason) {
    return { error: 'Missing required fields' }
  }

  try {
    await awardPoints({
      userId: studentId,
      seasonId: seasonId,
      points: points,
      reason: reason,
      awardedBy: user.id,
    })

    await logAdminAction({
      adminId: user.id,
      action: 'award_manual_points',
      targetType: 'user',
      targetId: studentId,
      metadata: { points, reason },
    })
    
    revalidatePath('/admin/points')
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}
