import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import RolesClient from './roles-client'

export const metadata: Metadata = { title: 'Role Management' }
export const dynamic = 'force-dynamic'

export default async function AdminRolesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: users } = await supabase
    .from('users')
    .select('id, full_name, email, enrollment_number, role, batch, department, custom_permissions')
    .order('full_name', { ascending: true })

  return <RolesClient users={users ?? []} currentUserId={user?.id ?? ''} />
}
