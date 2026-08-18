/**
 * Calculate the current attendance streak for a user in a season.
 * Streak = consecutive events attended (no skipped events between them).
 */

import { createClient } from '@/lib/supabase/server'

export async function calculateStreak(
  userId: string,
  seasonId: string
): Promise<number> {
  const supabase = await createClient()

  // Get all events in this season, ordered by date
  const { data: events } = await supabase
    .from('events')
    .select('id, date')
    .eq('season_id', seasonId)
    .in('status', ['completed'])
    .order('date', { ascending: true })

  if (!events || events.length === 0) return 0

  // Get all attended events for this user in this season
  const { data: attended } = await supabase
    .from('attendance')
    .select('event_id')
    .eq('user_id', userId)
    .in('event_id', events.map((e) => e.id))

  if (!attended || attended.length === 0) return 0

  const attendedSet = new Set(attended.map((a) => a.event_id))

  // Walk backwards from the most recent event, count consecutive attended events
  let streak = 0
  for (let i = events.length - 1; i >= 0; i--) {
    if (attendedSet.has(events[i].id)) {
      streak++
    } else {
      break
    }
  }

  return streak
}
