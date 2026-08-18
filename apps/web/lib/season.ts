import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

const PREVIEW_COOKIE = 'admin_preview_season'

/**
 * Returns the season ID to use for data queries.
 *
 * Admin pages: checks the admin_preview_season cookie first (set via the
 *   admin season switcher), then falls back to NEXT_PUBLIC_SEASON_ID, then
 *   the DB row where is_active = true.
 *
 * Student pages (pass isAdmin=false): always uses NEXT_PUBLIC_SEASON_ID or
 *   the active season — never the preview cookie.
 */
export async function getViewingSeason(isAdmin = false) {
  const supabase = await createClient()

  let seasonId: string | null = null

  if (isAdmin) {
    const cookieStore = await cookies()
    const preview = cookieStore.get(PREVIEW_COOKIE)?.value
    if (preview) seasonId = preview
  }

  if (!seasonId) {
    seasonId = process.env.NEXT_PUBLIC_SEASON_ID ?? null
  }

  if (seasonId) {
    const { data } = await supabase.from('seasons').select('*').eq('id', seasonId).single()
    if (data) return data
  }

  // Fall back to the currently active season
  const { data } = await supabase.from('seasons').select('*').eq('is_active', true).single()
  return data ?? null
}

export { PREVIEW_COOKIE }
