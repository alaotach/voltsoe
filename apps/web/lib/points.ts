import type { PointTransaction, LeaderboardEntry } from '@/types/database'

/**
 * Award points to a user. Always goes through point_transactions ledger.
 * Never modifies a user's total directly.
 */
export async function awardPoints(payload: {
  userId: string
  seasonId: string
  eventId?: string
  ruleId?: string
  points: number
  reason: string
  awardedBy: string
}): Promise<PointTransaction> {
  const { createAdminClient } = await import('@/lib/supabase/server')
  const supabase = await createAdminClient()

  const { data, error } = await supabase
    .from('point_transactions')
    .insert({
      user_id: payload.userId,
      season_id: payload.seasonId,
      event_id: payload.eventId ?? null,
      rule_id: payload.ruleId ?? null,
      points: payload.points,
      reason: payload.reason,
      awarded_by: payload.awardedBy,
    })
    .select()
    .single()

  if (error) throw new Error(`Failed to award points: ${error.message}`)

  // Refresh leaderboard materialized view
  await supabase.rpc('refresh_leaderboard')

  return data as PointTransaction
}

/**
 * Get total points for a user in a season
 */
export async function getUserPoints(
  userId: string,
  seasonId: string
): Promise<number> {
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()

  const { data } = await supabase
    .from('point_transactions')
    .select('points')
    .eq('user_id', userId)
    .eq('season_id', seasonId)

  if (!data) return 0
  return data.reduce((sum, tx) => sum + tx.points, 0)
}

/**
 * Get the leaderboard for a season (from materialized view)
 */
export async function getLeaderboard(
  seasonId: string,
  limit = 100,
  offset = 0
): Promise<LeaderboardEntry[]> {
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()

  const { data } = await supabase
    .from('leaderboard_view')
    .select('*')
    .eq('season_id', seasonId)
    .order('rank', { ascending: true })
    .range(offset, offset + limit - 1)

  return (data as LeaderboardEntry[]) ?? []
}

/**
 * Get a user's rank in a season
 */
export async function getUserRank(
  userId: string,
  seasonId: string
): Promise<{ rank: number; total_points: number; total_participants: number } | null> {
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()

  const { data } = await supabase
    .from('leaderboard_view')
    .select('rank, total_points')
    .eq('id', userId)
    .eq('season_id', seasonId)
    .single()

  if (!data) return null

  const { count } = await supabase
    .from('leaderboard_view')
    .select('*', { count: 'exact', head: true })
    .eq('season_id', seasonId)

  return {
    rank: data.rank,
    total_points: data.total_points,
    total_participants: count ?? 0,
  }
}

/**
 * Log an admin action
 */
export async function logAdminAction(payload: {
  adminId: string
  action: string
  targetType?: string
  targetId?: string
  metadata?: Record<string, unknown>
}): Promise<void> {
  const { createAdminClient } = await import('@/lib/supabase/server')
  const supabase = await createAdminClient()

  await supabase.from('admin_actions').insert({
    admin_id: payload.adminId,
    action: payload.action,
    target_type: payload.targetType ?? null,
    target_id: payload.targetId ?? null,
    metadata: payload.metadata ?? null,
  })
}
