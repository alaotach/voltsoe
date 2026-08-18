import { createClient } from '@/lib/supabase/server'
import { awardPoints, logAdminAction } from '@/lib/points'
import { checkAndAwardBadges } from '@/lib/badges'
import { createNotification, createFeedActivity, notificationTemplates } from '@/lib/notifications'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: adminProfile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!adminProfile || !['vp', 'president', 'super_admin'].includes(adminProfile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { userIds, points, reason, eventId, ruleId, seasonId } = body

  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return NextResponse.json({ error: 'userIds array required' }, { status: 400 })
  }
  if (!points || typeof points !== 'number') {
    return NextResponse.json({ error: 'points (number) required' }, { status: 400 })
  }
  if (!reason) return NextResponse.json({ error: 'reason required' }, { status: 400 })
  if (!seasonId) return NextResponse.json({ error: 'seasonId required' }, { status: 400 })

  const results = await Promise.allSettled(
    userIds.map(async (userId: string) => {
      await awardPoints({ userId, seasonId, eventId, ruleId, points, reason, awardedBy: user.id })

      const tmpl = notificationTemplates.points_awarded(points, reason)
      await createNotification({ userId, type: 'points_awarded', title: tmpl.title, body: tmpl.body, metadata: { points, reason, eventId } })

      await createFeedActivity({
        seasonId,
        userId,
        type: 'points_awarded',
        content: { points, reason, eventId },
      })

      await logAdminAction({ adminId: user.id, action: 'award_points', targetType: 'user', targetId: userId, metadata: { points, reason, eventId } })

      await checkAndAwardBadges(userId, seasonId)
    })
  )

  const failures = results.filter((r) => r.status === 'rejected')
  if (failures.length > 0) {
    return NextResponse.json({ partial: true, failures: failures.length }, { status: 207 })
  }

  return NextResponse.json({ success: true, awarded: userIds.length })
}
