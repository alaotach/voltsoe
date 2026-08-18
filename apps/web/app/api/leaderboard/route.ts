import { getViewingSeason } from '@/lib/season'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const url = new URL(request.url)
  const seasonId = url.searchParams.get('seasonId')
  const season = seasonId 
    ? (await supabase.from('seasons').select('id').eq('id', seasonId).single()).data
    : await getViewingSeason(false)
  const limit = parseInt(url.searchParams.get('limit') ?? '100')
  const offset = parseInt(url.searchParams.get('offset') ?? '0')

  if (!seasonId) {
    return NextResponse.json({ error: 'seasonId required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('leaderboard_view')
    .select('*')
    .eq('season_id', season?.id ?? '')
    .order('rank', { ascending: true })
    .range(offset, offset + limit - 1)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data })
}
