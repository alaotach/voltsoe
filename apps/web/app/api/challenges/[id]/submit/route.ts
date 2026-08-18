import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: challengeId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('users')
    .select('is_verified, email_verified')
    .eq('id', user.id)
    .single()

  if (!profile?.email_verified || !profile?.is_verified) {
    return NextResponse.json({ error: 'Account not verified.' }, { status: 403 })
  }

  const body = await request.json()
  const { content } = body

  if (!content?.trim()) {
    return NextResponse.json({ error: 'Content is required.' }, { status: 400 })
  }

  // Check challenge exists and is active
  const { data: challenge } = await supabase
    .from('challenges')
    .select('id, is_active, deadline')
    .eq('id', challengeId)
    .single()

  if (!challenge) return NextResponse.json({ error: 'Challenge not found.' }, { status: 404 })
  if (!challenge.is_active || new Date(challenge.deadline) < new Date()) {
    return NextResponse.json({ error: 'Challenge is closed.' }, { status: 400 })
  }

  const { error } = await supabase.from('submissions').insert({
    challenge_id: challengeId,
    user_id: user.id,
    content: content.trim(),
    status: 'pending',
  })

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Already submitted.' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
