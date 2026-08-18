import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return NextResponse.json({ error: 'Not logged in' })
  
  const { error } = await supabase.from('users').update({
    role: 'super_admin',
    is_verified: true,
    email_verified: true
  }).eq('id', user.id)

  if (error) return NextResponse.json({ error: error.message })
  
  return NextResponse.redirect(new URL('/admin', request.url))
}
