import type { NotificationType } from '@/types/database'

interface NotificationPayload {
  userId: string
  type: NotificationType
  title: string
  body: string
  metadata?: Record<string, unknown>
}

/**
 * Create an in-app notification for a user.
 * Uses service role client to bypass RLS.
 */
export async function createNotification(
  payload: NotificationPayload
): Promise<void> {
  const { createAdminClient } = await import('@/lib/supabase/server')
  const supabase = await createAdminClient()

  await supabase.from('notifications').insert({
    user_id: payload.userId,
    type: payload.type,
    title: payload.title,
    body: payload.body,
    metadata: payload.metadata ?? null,
  })
}

/**
 * Mark a notification as read
 */
export async function markNotificationRead(
  notificationId: string,
  userId: string
): Promise<void> {
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()

  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .eq('user_id', userId)
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllRead(userId: string): Promise<void> {
  const { createAdminClient } = await import('@/lib/supabase/server')
  const supabase = await createAdminClient()

  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false)
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadCount(userId: string): Promise<number> {
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()

  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false)

  return count ?? 0
}

/**
 * Create a feed activity entry
 */
export async function createFeedActivity(payload: {
  seasonId: string
  userId?: string
  teamId?: string
  type: string
  content: Record<string, unknown>
}): Promise<void> {
  const { createAdminClient } = await import('@/lib/supabase/server')
  const supabase = await createAdminClient()

  await supabase.from('activity_feed').insert({
    season_id: payload.seasonId,
    user_id: payload.userId ?? null,
    team_id: payload.teamId ?? null,
    type: payload.type,
    content: payload.content,
  })
}

/**
 * Notification message templates
 */
export const notificationTemplates = {
  registration_open: (eventTitle: string) => ({
    title: 'Registration Open',
    body: `Registration is now open for ${eventTitle}. Reserve your spot!`,
  }),
  event_tomorrow: (eventTitle: string) => ({
    title: 'Event Tomorrow',
    body: `Don't forget! ${eventTitle} is tomorrow. Check the details.`,
  }),
  attendance_confirmed: (eventTitle: string) => ({
    title: 'Attendance Confirmed',
    body: `Your attendance at ${eventTitle} has been confirmed.`,
  }),
  points_awarded: (points: number, reason: string) => ({
    title: 'Points Awarded',
    body: `You earned +${points} points: ${reason}`,
  }),
  rank_improved: (newRank: number) => ({
    title: 'You moved up!',
    body: `You're now ranked #${newRank} on the leaderboard. Keep going!`,
  }),
  rank_dropped: (newRank: number, byUser: string, byPoints: number) => ({
    title: `You dropped to #${newRank}`,
    body: `${byUser} overtook you by ${byPoints} points.`,
  }),
  new_challenge: (title: string, points: number) => ({
    title: 'New Challenge',
    body: `New challenge: "${title}" — earn +${points} points!`,
  }),
  badge_unlocked: (badgeName: string, badgeIcon: string) => ({
    title: 'Badge Unlocked!',
    body: `You earned the "${badgeName}" badge ${badgeIcon}`,
  }),
  submission_reviewed: (status: 'approved' | 'rejected', challengeTitle: string) => ({
    title: status === 'approved' ? 'Submission Approved!' : 'Submission Rejected',
    body:
      status === 'approved'
        ? `Your submission for "${challengeTitle}" was approved. Points awarded!`
        : `Your submission for "${challengeTitle}" was rejected. Check feedback.`,
  }),
}
