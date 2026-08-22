import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import StudentNav from '@/components/student-nav'

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
    <div style={{ display: 'flex', minHeight: '100dvh', background: 'var(--color-surface-base)' }}>
      <StudentNav user={profile} />
      <main
        style={{
          flex: 1,
          marginLeft: 240,
          minHeight: '100dvh',
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
          .student-main { margin-left: 0 !important; padding-top: 70px !important; }
        }
      `}</style>
    </div>
  )
}
