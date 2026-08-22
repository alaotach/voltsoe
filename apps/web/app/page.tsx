import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Trophy, Zap, FolderOpen, Calendar, ArrowRight } from 'lucide-react'

import TopNav from '@/components/top-nav'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = user
    ? await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
    : { data: null }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--color-surface-base)' }}>
      <TopNav user={profile} />

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Hero Section */}
        <section
          style={{
            padding: '120px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background Glow */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '80vw',
              height: '80vw',
              maxWidth: 800,
              maxHeight: 800,
              background: 'radial-gradient(circle, rgba(245, 197, 24, 0.15) 0%, rgba(124, 58, 237, 0.05) 50%, transparent 70%)',
              filter: 'blur(60px)',
              zIndex: 0,
              pointerEvents: 'none',
            }}
          />
          
          <div style={{ position: 'relative', zIndex: 1, maxWidth: 800 }} className="fade-in">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-border)', marginBottom: 24 }}>
              <span className="live-dot" />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', color: 'var(--color-text-secondary)' }}>SEASON IS LIVE</span>
            </div>
            
            <h1 style={{ fontSize: 'clamp(3rem, 8vw, 5rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 24 }}>
              The Ultimate <br />
              <span className="text-volt">Engineering League</span>
            </h1>
            
            <p style={{ fontSize: 'clamp(1.1rem, 3vw, 1.25rem)', color: 'var(--color-text-secondary)', marginBottom: 40, maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.6 }}>
              Join the most competitive technical club. Build real projects, conquer challenges, and climb the leaderboard to prove your skills.
            </p>
            
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href={user ? "/dashboard" : "/register"} className="btn btn-primary btn-lg" style={{ fontSize: '1.1rem' }}>
                Join the League <ArrowRight size={18} />
              </Link>
              <Link href="/leaderboard" className="btn btn-secondary btn-lg" style={{ fontSize: '1.1rem' }}>
                View Leaderboard
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section style={{ padding: '80px 24px', background: 'var(--color-surface-1)', borderTop: '1px solid var(--color-border)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 60 }}>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 16 }}>How It Works</h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem', maxWidth: 600, margin: '0 auto' }}>
                Everything you do earns you VOLT points. The more you participate, the higher you rank.
              </p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
              {/* Feature 1 */}
              <div className="card card-hover" style={{ padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(245, 197, 24, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, color: 'var(--color-volt-yellow)' }}>
                  <Zap size={32} />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 12 }}>Conquer Challenges</h3>
                <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                  Solve technical puzzles, find bugs, and complete mini-bounties to earn quick points. Watch out for Boss Challenges!
                </p>
              </div>

              {/* Feature 2 */}
              <div className="card card-hover" style={{ padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(124, 58, 237, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, color: 'var(--color-volt-purple)' }}>
                  <FolderOpen size={32} />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 12 }}>Build Projects</h3>
                <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                  Showcase what you're building. Good projects get upvoted by peers and earn massive points from the judges.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="card card-hover" style={{ padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, color: '#60A5FA' }}>
                  <Calendar size={32} />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 12 }}>Attend Events</h3>
                <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                  Join workshops, hackathons, and guest lectures. Checking in gets you guaranteed points every time.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action bottom */}
        <section style={{ padding: '100px 24px', textAlign: 'center', borderTop: '1px solid var(--color-border)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'relative', zIndex: 1, maxWidth: 600, margin: '0 auto' }}>
            <Trophy size={48} style={{ color: 'var(--color-volt-yellow)', margin: '0 auto 24px' }} />
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 24 }}>Ready to claim your rank?</h2>
            <Link href={user ? "/dashboard" : "/register"} className="btn btn-primary btn-lg">
              Get Started Now
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ padding: '40px 32px', borderTop: '1px solid var(--color-border)', background: 'var(--color-surface-base)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '1.2rem', fontWeight: 900, background: 'var(--gradient-volt)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            VOLT
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>© {new Date().getFullYear()}</span>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          <a href="#" style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }} className="hover-white">GitHub</a>
          <a href="#" style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }} className="hover-white">Discord</a>
        </div>
      </footer>

      <style>{`
        .hover-white { transition: color 0.15s; }
        .hover-white:hover { color: white !important; }
        @media (max-width: 768px) {
          .hide-on-mobile { display: none !important; }
        }
      `}</style>
    </div>
  )
}
