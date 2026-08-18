import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { logAdminAction } from '@/lib/points'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: adminProfile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!adminProfile || !['president', 'super_admin'].includes(adminProfile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let userId: string | null = null
  const contentType = request.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    const body = await request.json()
    userId = body.userId
  } else {
    const form = await request.formData()
    userId = form.get('userId') as string
  }

  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  const adminClient = await createAdminClient()
  const { error } = await adminClient.from('users').update({ is_verified: true }).eq('id', userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAdminAction({
    adminId: user.id,
    action: 'verify_student',
    targetType: 'user',
    targetId: userId,
  })

  // Redirect back for form submissions
  if (!contentType.includes('application/json')) {
    return NextResponse.redirect(new URL('/admin/students', request.url))
  }

  return NextResponse.json({ success: true })
}
