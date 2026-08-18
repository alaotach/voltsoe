import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminNav from '@/components/admin-nav'
import { getViewingSeason, PREVIEW_COOKIE } from '@/lib/season'
import { cookies } from 'next/headers'

const ADMIN_ROLES = ['core', 'vp', 'president', 'super_admin']

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || !ADMIN_ROLES.includes(profile.role)) {
    redirect('/dashboard')
  }

  const cookieStore = await cookies()
  const previewSeasonId = cookieStore.get(PREVIEW_COOKIE)?.value ?? null
  const season = await getViewingSeason(true)

  return (
    <div style={{ display: 'flex', minHeight: '100dvh', background: 'var(--color-surface-base)' }}>
      <AdminNav
        user={profile}
        seasonName={season?.name}
        isPreviewing={!!previewSeasonId && previewSeasonId !== process.env.NEXT_PUBLIC_SEASON_ID}
      />
      <main
        style={{
          flex: 1,
          marginLeft: 220,
          minHeight: '100dvh',
          padding: '32px 28px',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {children}
        </div>
      </main>
    </div>
  )
}

