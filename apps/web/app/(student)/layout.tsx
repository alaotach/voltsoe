import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import TopNav from '@/components/top-nav'

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = user
    ? await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
    : { data: null }

  if (user && !profile) redirect('/complete-profile')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', background: 'var(--color-surface-base)' }}>
      <TopNav user={profile} />
      <main
        style={{
          flex: 1,
          width: '100%',
          padding: '32px 24px',
        }}
        className="student-main"
      >
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {children}
        </div>
      </main>
      <style>{`
        @media (max-width: 768px) {
          .student-main { padding-top: 24px !important; }
        }
      `}</style>
    </div>
  )
}
