import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check if already liked
  const { data: existing } = await supabase
    .from('project_likes')
    .select('id')
    .eq('project_id', projectId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    // Unlike
    await supabase.from('project_likes').delete().eq('id', existing.id)
    return NextResponse.json({ liked: false })
  } else {
    // Like
    await supabase.from('project_likes').insert({ project_id: projectId, user_id: user.id })
    return NextResponse.json({ liked: true })
  }
}
