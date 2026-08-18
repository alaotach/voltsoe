import { createAdminClient } from '@/lib/supabase/server'
import { createNotification, createFeedActivity, notificationTemplates } from '@/lib/notifications'

const BADGE_SLUGS = [
  'first-build',
  'regular',
  'perfect-season',
  'builder',
  'speedrunner',
  'top-10',
  'champion',
  'streak-3',
  'streak-5',
  'volunteer',
] as const

type BadgeSlug = typeof BADGE_SLUGS[number]

/**
 * Check if a user already has a badge
 */
async function hasBadge(
  userId: string,
  badgeSlug: string,
  seasonId: string | null,
  supabase: Awaited<ReturnType<typeof createAdminClient>>
): Promise<boolean> {
  const { data: badges } = await supabase.from('badges').select('id').eq('slug', badgeSlug)
  const badgeIds = (badges ?? []).map(b => b.id)

  if (badgeIds.length === 0) return false

  const query = supabase
    .from('user_badges')
    .select('id')
    .eq('user_id', userId)
    .in('badge_id', badgeIds)

  if (seasonId) {
    query.eq('season_id', seasonId)
  }

  const { data } = await query.maybeSingle()
  return !!data
}

/**
 * Award a badge to a user
 */
async function awardBadge(
  userId: string,
  badgeSlug: BadgeSlug,
  seasonId: string | null,
  supabase: Awaited<ReturnType<typeof createAdminClient>>
): Promise<void> {
  // Get badge id
  const { data: badge } = await supabase
    .from('badges')
    .select('id, name, icon')
    .eq('slug', badgeSlug)
    .single()

  if (!badge) return

  // Insert user_badge (upsert to handle race conditions)
  const { error } = await supabase.from('user_badges').upsert(
    {
      user_id: userId,
      badge_id: badge.id,
      season_id: seasonId,
    },
    { onConflict: 'user_id,badge_id,season_id' }
  )

  if (error) return // Already has badge

  // Create notification
  const tmpl = notificationTemplates.badge_unlocked(badge.name, badge.icon)
  await createNotification({
    userId,
    type: 'badge_unlocked',
    title: tmpl.title,
    body: tmpl.body,
    metadata: { badgeSlug, badgeName: badge.name, badgeIcon: badge.icon },
  })

  // Create feed activity
  if (seasonId) {
    await createFeedActivity({
      seasonId,
      userId,
      type: 'badge_earned',
      content: { badgeSlug, badgeName: badge.name, badgeIcon: badge.icon },
    })
  }
}

/**
 * Main badge check function — run after every point transaction or attendance mark.
 * Checks all auto-award conditions and awards badges if criteria met.
 */
export async function checkAndAwardBadges(
  userId: string,
  seasonId: string
): Promise<void> {
  const supabase = await createAdminClient()

  const { data: seasonEvents } = await supabase.from('events').select('id').eq('season_id', seasonId)
  const eventIds = (seasonEvents ?? []).map(e => e.id)

  // Gather counts in parallel
  const [attendanceResult, projectResult, submissionsResult, leaderboardResult] =
    await Promise.all([
      // Attendance count for this season
      supabase
        .from('attendance')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .in(
          'event_id',
          eventIds.length > 0 ? eventIds : ['00000000-0000-0000-0000-000000000000']
        ),

      // Published project count for this season
      supabase
        .from('projects')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('season_id', seasonId)
        .eq('is_published', true),

      // Approved submissions count
      supabase
        .from('submissions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'approved'),

      // Leaderboard rank
      supabase
        .from('leaderboard_view')
        .select('rank')
        .eq('id', userId)
        .eq('season_id', seasonId)
        .maybeSingle(),
    ])

  const attendanceCount = attendanceResult.count ?? 0
  const projectCount = projectResult.count ?? 0
  const rank = leaderboardResult.data?.rank ?? null

  // Get total events in season for perfect-season check
  const { count: totalEvents } = await supabase
    .from('events')
    .select('id', { count: 'exact', head: true })
    .eq('season_id', seasonId)
    .eq('status', 'completed')

  // Check streak for streak badges
  const { calculateStreak } = await import('@/lib/streak')
  const streak = await calculateStreak(userId, seasonId)

  // --- Award badges ---

  // first-build: first project submitted
  if (projectCount >= 1 && !(await hasBadge(userId, 'first-build', seasonId, supabase))) {
    await awardBadge(userId, 'first-build', seasonId, supabase)
  }

  // regular: attend 5 events
  if (attendanceCount >= 5 && !(await hasBadge(userId, 'regular', seasonId, supabase))) {
    await awardBadge(userId, 'regular', seasonId, supabase)
  }

  // perfect-season: attended all events
  if (
    totalEvents &&
    totalEvents > 0 &&
    attendanceCount >= totalEvents &&
    !(await hasBadge(userId, 'perfect-season', seasonId, supabase))
  ) {
    await awardBadge(userId, 'perfect-season', seasonId, supabase)
  }

  // builder: 5 projects
  if (projectCount >= 5 && !(await hasBadge(userId, 'builder', seasonId, supabase))) {
    await awardBadge(userId, 'builder', seasonId, supabase)
  }

  // top-10: rank <= 10
  if (rank !== null && rank <= 10 && !(await hasBadge(userId, 'top-10', seasonId, supabase))) {
    await awardBadge(userId, 'top-10', seasonId, supabase)
  }

  // streak-3: 3 consecutive events
  if (streak >= 3 && !(await hasBadge(userId, 'streak-3', seasonId, supabase))) {
    await awardBadge(userId, 'streak-3', seasonId, supabase)
  }

  // streak-5: 5 consecutive events
  if (streak >= 5 && !(await hasBadge(userId, 'streak-5', seasonId, supabase))) {
    await awardBadge(userId, 'streak-5', seasonId, supabase)
  }
}
