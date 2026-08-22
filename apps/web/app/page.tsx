import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
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
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--color-surface-base)', overflowX: 'hidden' }}>
      <TopNav user={profile} />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* ── HERO ── */}
        <section 
          className="grid grid-cols-1 md:grid-cols-2"
          style={{ minHeight: 'calc(100vh - 60px)', borderBottom: '1px solid var(--color-border)' }}
        >
          <div className="flex flex-col justify-center p-10 lg:p-14 border-b md:border-b-0 md:border-r" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center gap-3 mb-7 fade-in" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
              <div className="w-2 h-2 rounded-full" style={{ background: 'var(--color-volt-orange)', animation: 'blink 2.4s ease-in-out infinite' }}></div>
              <span className="font-mono text-xs uppercase tracking-widest text-muted">School of Engineering · JNU · New Delhi</span>
            </div>
            
            <h1 className="font-barlow font-black uppercase leading-[0.88] tracking-tight mb-8 fade-in" style={{ fontSize: 'clamp(4rem, 9vw, 8.5rem)', animationDelay: '0.2s', animationFillMode: 'both' }}>
              Build<br/>
              <span style={{ color: 'var(--color-volt-yellow)' }}>Real</span><br/>
              Things.
            </h1>
            
            <p className="font-sans font-light text-muted max-w-sm leading-relaxed mb-10 fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
              VOLT is JNU's electronics and maker community — we solder, code, compete, and ship. From autonomous vehicles to custom hardware, ideas here become real objects.
            </p>
            
            <div className="flex flex-wrap gap-4 fade-in" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
              <Link href={user ? "/dashboard" : "/projects"} className="font-barlow font-bold uppercase tracking-widest text-sm px-6 py-3 transition-colors" style={{ background: 'var(--gradient-volt)', color: '#0A0A0F' }}>
                Explore Projects →
              </Link>
              <Link href="/events" className="font-barlow font-bold uppercase tracking-widest text-sm px-6 py-3 transition-colors hover:text-white" style={{ background: 'transparent', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}>
                Upcoming Events
              </Link>
            </div>
          </div>

          <div className="grid grid-rows-[1fr_auto]">
            <div className="flex flex-col justify-end p-8 lg:p-12 border-b font-mono text-xs md:text-sm text-muted relative overflow-hidden" style={{ borderColor: 'var(--color-border)', minHeight: '300px' }}>
              <div className="absolute -top-10 -right-10 opacity-5 font-barlow font-black text-[12rem] select-none pointer-events-none leading-none">SYS</div>
              
              <div className="relative z-10 fade-in" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
                <div style={{ color: 'var(--color-volt-yellow)' }} className="mb-4">VOLT_OS // Boot Sequence</div>
                <div className="mb-1.5 flex justify-between max-w-sm"><span>&gt; Mount hardware</span> <span className="text-white">[OK]</span></div>
                <div className="mb-1.5 flex justify-between max-w-sm"><span>&gt; Load software modules</span> <span className="text-white">[OK]</span></div>
                <div className="mb-1.5 flex justify-between max-w-sm"><span>&gt; Establish network</span> <span className="text-white">[OK]</span></div>
                <div className="mb-1.5 flex justify-between max-w-sm"><span>&gt; Calibrate instruments</span> <span className="text-white">[OK]</span></div>
                <div className="mt-6 flex items-center text-white">&gt; System Ready <span className="w-2 h-4 ml-1.5 bg-white inline-block animate-pulse"></span></div>
              </div>
            </div>

            <div className="relative overflow-hidden p-8" style={{ background: 'var(--color-surface-1)' }}>
              <div className="flex justify-between items-center font-mono text-[0.6rem] uppercase tracking-widest mb-3 opacity-60">
                <span>Signal Output · CH1</span>
                <span className="flex items-center gap-1.5 text-volt-yellow" style={{ color: 'var(--color-volt-yellow)' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" style={{ animation: 'blink 1.6s ease-in-out infinite' }}></span>
                  Live
                </span>
              </div>
              
              <svg className="w-full h-[100px] block" viewBox="0 0 600 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="gridPattern" width="60" height="25" patternUnits="userSpaceOnUse">
                    <path d="M60 0L0 0 0 25" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="600" height="100" fill="url(#gridPattern)"/>
                <line x1="0" y1="50" x2="600" y2="50" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4 4"/>
                
                <polyline fill="none" stroke="var(--color-volt-yellow)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
                  points="0,50 15,50 15,15 60,15 60,85 105,85 105,15 150,15 150,50 170,50 200,30 240,30 240,70 280,70 280,30 320,30 320,50 340,50 380,20 430,20 430,80 480,80 480,20 530,20 530,50 600,50"/>
                
                <circle r="3.5" fill="var(--color-volt-yellow)" style={{ filter: 'drop-shadow(0 0 6px var(--color-volt-yellow))' }}>
                  <animateMotion dur="4s" repeatCount="indefinite"
                    path="M0,50 L15,50 L15,15 L60,15 L60,85 L105,85 L105,15 L150,15 L150,50 L170,50 L200,30 L240,30 L240,70 L280,70 L280,30 L320,30 L320,50 L340,50 L380,20 L430,20 L430,80 L480,80 L480,20 L530,20 L530,50 L600,50"/>
                </circle>
              </svg>
              
              <div className="flex justify-between mt-2 font-mono text-[0.58rem] uppercase tracking-widest opacity-40">
                <span>5V / div</span>
                <span>20ms / div</span>
                <span>Trig: Rising Edge</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── TICKER ── */}
        <div className="h-10 overflow-hidden flex items-center border-b border-black group" style={{ background: 'var(--color-surface-1)' }}>
          <div className="flex whitespace-nowrap group-hover:pause" style={{ animation: 'roll 22s linear infinite' }}>
            {[1, 2].map((i) => (
              <div key={i} className="flex">
                <span className="font-mono text-[0.65rem] uppercase tracking-widest px-8 opacity-50">NAGA-1 AUV deployed at Ganga <span className="text-volt-orange mx-2" style={{ color: 'var(--color-volt-orange)' }}>⚡</span></span>
                <span className="font-mono text-[0.65rem] uppercase tracking-widest px-8 opacity-50">Kiki MP3 Player — open source release <span className="text-volt-orange mx-2" style={{ color: 'var(--color-volt-yellow)' }}>⚡</span></span>
                <span className="font-mono text-[0.65rem] uppercase tracking-widest px-8 opacity-50">ESP32 Workshop — Registration Open <span className="text-volt-orange mx-2" style={{ color: 'var(--color-volt-purple)' }}>⚡</span></span>
                <span className="font-mono text-[0.65rem] uppercase tracking-widest px-8 opacity-50">IPL Auction — 21 Nov — JNU Campus <span className="text-volt-orange mx-2" style={{ color: 'var(--color-volt-blue)' }}>⚡</span></span>
                <span className="font-mono text-[0.65rem] uppercase tracking-widest px-8 opacity-50">IoT Home Automation kit v2 <span className="text-volt-orange mx-2" style={{ color: 'var(--color-volt-orange)' }}>⚡</span></span>
                <span className="font-mono text-[0.65rem] uppercase tracking-widest px-8 opacity-50">Signal Generator v2 shipped <span className="text-volt-orange mx-2" style={{ color: 'var(--color-volt-yellow)' }}>⚡</span></span>
              </div>
            ))}
          </div>
        </div>

        {/* ── ABOUT ── */}
        <section className="grid grid-cols-1 md:grid-cols-12 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div className="md:col-span-5 p-10 lg:p-16 border-b md:border-b-0 md:border-r" style={{ borderColor: 'var(--color-border)' }}>
            <span className="font-mono text-[0.62rem] uppercase tracking-[0.18em] block mb-5" style={{ color: 'var(--color-volt-yellow)' }}>About VOLT</span>
            <h2 className="font-barlow font-black text-4xl lg:text-[2.5rem] uppercase leading-[0.95] tracking-tight mb-5">
              Where<br/>curiosity<br/>meets<br/>circuits.
            </h2>
            <p className="font-sans text-[0.9375rem] leading-relaxed text-muted mb-7">
              We learn by building, collaborating, and pushing the limits of what's possible. From workshops to real hardware deployments, we turn ideas into working systems.
            </p>
            <Link href={user ? "/dashboard" : "/register"} className="font-barlow font-bold uppercase tracking-widest text-sm px-6 py-3 inline-block transition-colors hover:text-white" style={{ background: 'transparent', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}>
              {user ? "Go to Dashboard →" : "Join the League →"}
            </Link>
          </div>
          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-3">
            <div className="p-8 lg:p-10 border-b sm:border-b-0 sm:border-r transition-colors hover:bg-white/5" style={{ borderColor: 'var(--color-border)' }}>
              <span className="text-2xl block mb-4 opacity-50 grayscale">📡</span>
              <span className="font-mono text-[0.6rem] tracking-[0.14em] block mb-3 opacity-40">01 / Learn</span>
              <h3 className="font-barlow font-extrabold text-xl uppercase tracking-widest mb-2">Sharpen Skills</h3>
              <p className="font-sans text-sm leading-relaxed text-muted">Workshops, sessions and hands-on resources. From soldering basics to RF design — we build real competence.</p>
            </div>
            <div className="p-8 lg:p-10 border-b sm:border-b-0 sm:border-r transition-colors hover:bg-white/5" style={{ borderColor: 'var(--color-border)' }}>
              <span className="text-2xl block mb-4 opacity-50 grayscale">🔧</span>
              <span className="font-mono text-[0.6rem] tracking-[0.14em] block mb-3 opacity-40">02 / Build</span>
              <h3 className="font-barlow font-extrabold text-xl uppercase tracking-widest mb-2">Ship Hardware</h3>
              <p className="font-sans text-sm leading-relaxed text-muted">Projects go from breadboard to working prototype to deployment. We build things that actually do something.</p>
            </div>
            <div className="p-8 lg:p-10 transition-colors hover:bg-white/5">
              <span className="text-2xl block mb-4 opacity-50 grayscale">⚡</span>
              <span className="font-mono text-[0.6rem] tracking-[0.14em] block mb-3 opacity-40">03 / Innovate</span>
              <h3 className="font-barlow font-extrabold text-xl uppercase tracking-widest mb-2">Compete & Create</h3>
              <p className="font-sans text-sm leading-relaxed text-muted">Compete nationally, run experiments, and ship ideas with a community that takes making seriously.</p>
            </div>
          </div>
        </section>

        {/* ── EVENTS ── */}
        <section className="border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-baseline justify-between p-6 lg:px-10 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <span className="font-barlow font-extrabold text-xl uppercase tracking-widest">Upcoming Events</span>
            <Link href="/events" className="font-mono text-[0.62rem] uppercase tracking-widest text-muted transition-colors hover:text-white">View All →</Link>
          </div>

          <div className="grid grid-cols-[80px_1fr_auto_80px] lg:grid-cols-[90px_1fr_auto_110px] items-center gap-4 p-5 lg:px-10 border-b transition-colors hover:bg-white/5 cursor-pointer" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex flex-col">
              <span className="font-barlow font-extrabold text-3xl leading-none">21</span>
              <span className="font-mono text-[0.58rem] uppercase tracking-widest text-muted">Nov 2025</span>
            </div>
            <div>
              <div className="font-barlow font-bold text-lg uppercase tracking-wide mb-0.5">IPL Auction</div>
              <div className="font-sans text-[0.8125rem] text-muted hidden sm:block">Strategy, fun and competition. The most anticipated event of the season.</div>
            </div>
            <div className="font-mono text-[0.62rem] tracking-wider text-muted whitespace-nowrap hidden sm:block">JNU Campus</div>
            <span className="font-mono text-[0.58rem] uppercase tracking-widest px-2 py-1 justify-self-end whitespace-nowrap rounded" style={{ background: 'var(--color-surface-3)', color: 'var(--color-text-primary)' }}>Upcoming</span>
          </div>

          <div className="grid grid-cols-[80px_1fr_auto_80px] lg:grid-cols-[90px_1fr_auto_110px] items-center gap-4 p-5 lg:px-10 border-b transition-colors hover:bg-white/5 cursor-pointer" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex flex-col">
              <span className="font-barlow font-extrabold text-3xl leading-none">14–15</span>
              <span className="font-mono text-[0.58rem] uppercase tracking-widest text-muted">Nov 2025</span>
            </div>
            <div>
              <div className="font-barlow font-bold text-lg uppercase tracking-wide mb-0.5">Financial Literacy Workshop</div>
              <div className="font-sans text-[0.8125rem] text-muted hidden sm:block">Learn, manage and grow. Build your financial future with practical tools.</div>
            </div>
            <div className="font-mono text-[0.62rem] tracking-wider text-muted whitespace-nowrap hidden sm:block">JNU Campus</div>
            <span className="font-mono text-[0.58rem] uppercase tracking-widest px-2 py-1 justify-self-end whitespace-nowrap rounded" style={{ background: 'var(--color-volt-yellow)', color: '#0A0A0F' }}>Reg. Open</span>
          </div>

          <div className="grid grid-cols-[80px_1fr_auto_80px] lg:grid-cols-[90px_1fr_auto_110px] items-center gap-4 p-5 lg:px-10 transition-colors hover:bg-white/5 cursor-pointer">
            <div className="flex flex-col">
              <span className="font-barlow font-extrabold text-3xl leading-none">TBA</span>
              <span className="font-mono text-[0.58rem] uppercase tracking-widest text-muted">Coming Soon</span>
            </div>
            <div>
              <div className="font-barlow font-bold text-lg uppercase tracking-wide mb-0.5">Electronics Workshop</div>
              <div className="font-sans text-[0.8125rem] text-muted hidden sm:block">Hands-on session for beginners and enthusiasts. Dates dropping soon.</div>
            </div>
            <div className="font-mono text-[0.62rem] tracking-wider text-muted whitespace-nowrap hidden sm:block">JNU Campus</div>
            <span className="font-mono text-[0.58rem] uppercase tracking-widest px-2 py-1 justify-self-end whitespace-nowrap border rounded" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>Soon</span>
          </div>
        </section>

        {/* ── PROJECTS ── */}
        <section className="border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-baseline justify-between p-6 lg:px-10 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <span className="font-barlow font-extrabold text-xl uppercase tracking-widest">Featured Projects</span>
            <Link href="/projects" className="font-mono text-[0.62rem] uppercase tracking-widest text-muted transition-colors hover:text-white">View All Projects →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { id: 'PRJ-001', icon: '🚗', tag: 'Robotics · Autonomous', name: 'Autonomous RC Car', color: 'var(--color-volt-yellow)' },
              { id: 'PRJ-002', icon: '📻', tag: 'Instrumentation · RF', name: 'Signal Generator', color: 'var(--color-volt-orange)' },
              { id: 'PRJ-003', icon: '🏠', tag: 'IoT · Embedded Systems', name: 'IoT Home Automation', color: 'var(--color-volt-blue)' },
              { id: 'PRJ-004', icon: '🎵', tag: 'Hardware · Open Source', name: 'Kiki MP3 Player', color: 'var(--color-volt-purple)' }
            ].map((p, i) => (
              <div key={p.id} className="p-7 border-b lg:border-b-0 lg:border-r flex flex-col gap-3.5 cursor-pointer transition-colors hover:bg-white/5 group" style={{ borderColor: 'var(--color-border)' }}>
                <span className="font-mono text-[0.58rem] tracking-widest text-muted">{p.id}</span>
                <div className="w-full aspect-[4/3] flex items-center justify-center text-4xl opacity-40 transition-opacity group-hover:opacity-80" style={{ background: 'var(--color-surface-1)' }}>
                  {p.icon}
                </div>
                <span className="font-mono text-[0.6rem] uppercase tracking-widest" style={{ color: p.color }}>{p.tag}</span>
                <span className="font-barlow font-bold text-lg uppercase tracking-wide">{p.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA BAND ── */}
        <section className="grid grid-cols-1 md:grid-cols-2 p-10 lg:p-20 gap-10 items-center border-b border-black" style={{ background: 'var(--color-surface-1)' }}>
          <h2 className="font-barlow font-black uppercase leading-[0.9] tracking-tight" style={{ fontSize: 'clamp(2.75rem, 5.5vw, 5rem)', color: 'var(--color-text-primary)' }}>
            Let's<br/>build the<br/>
            <span style={{ color: 'var(--color-volt-yellow)' }}>future.</span>
          </h2>
          <div className="flex flex-col gap-5">
            <p className="font-sans text-[0.9375rem] leading-relaxed opacity-60">
              VOLT is open to every student at JNU. Whether you're just starting out or you've been building electronics for years — there's a project with your name on it.
            </p>
            <Link href={user ? "/dashboard" : "/register"} className="font-barlow font-bold uppercase tracking-widest text-sm px-6 py-3 self-start transition-colors" style={{ background: 'var(--color-text-primary)', color: '#0A0A0F' }}>
              {user ? "Go to Dashboard ↗" : "Join VOLT ↗"}
            </Link>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <div className="p-10 border-b sm:border-r lg:border-b-0" style={{ borderColor: 'var(--color-border)' }}>
            <div className="font-barlow font-black text-xl uppercase tracking-widest mb-3">
              <span style={{ color: 'var(--color-volt-yellow)' }}>⚡</span> VOLT
            </div>
            <p className="font-sans text-sm text-muted leading-relaxed mb-5">
              Empowering students to explore, innovate and excel in electronics and technology at JNU.
            </p>
            <div className="flex gap-3.5">
              {['IG', 'LI', 'GH', 'YT'].map(social => (
                <a key={social} href="#" className="font-mono text-[0.6rem] uppercase tracking-widest text-muted transition-colors hover:text-white">{social}</a>
              ))}
            </div>
          </div>

          <div className="p-10 border-b lg:border-b-0 lg:border-r" style={{ borderColor: 'var(--color-border)' }}>
            <div className="font-mono text-[0.6rem] uppercase tracking-[0.15em] text-muted mb-4">Quick Links</div>
            <ul className="flex flex-col gap-2">
              {['About', 'Team', 'Events', 'Projects', 'Gallery', 'Contact'].map(link => (
                <li key={link}><a href="#" className="font-barlow font-bold text-base uppercase tracking-wider transition-colors hover:text-volt-yellow" style={{ color: 'var(--color-text-primary)' }}>{link}</a></li>
              ))}
            </ul>
          </div>

          <div className="p-10 border-b sm:border-r lg:border-b-0" style={{ borderColor: 'var(--color-border)' }}>
            <div className="font-mono text-[0.6rem] uppercase tracking-[0.15em] text-muted mb-4">Contact</div>
            <div className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[0.58rem] uppercase tracking-widest opacity-40">Email</span>
                <span className="font-sans text-sm">volt.soe@jnu.ac.in</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[0.58rem] uppercase tracking-widest opacity-40">Location</span>
                <span className="font-sans text-sm">School of Engineering,<br/>JNU, New Delhi</span>
              </div>
            </div>
          </div>

          <div className="p-10">
            <div className="font-mono text-[0.6rem] uppercase tracking-[0.15em] text-muted mb-4">Stay Updated</div>
            <p className="font-sans text-[0.875rem] text-muted leading-relaxed mb-5">
              Get notified about workshops, events and new projects from VOLT.
            </p>
            <a href="#" className="font-barlow font-bold uppercase tracking-widest text-[0.8rem] px-4 py-2 inline-block border transition-colors hover:bg-white/5" style={{ borderColor: 'var(--color-border)' }}>
              Subscribe →
            </a>
          </div>

          <div className="col-span-1 sm:col-span-2 lg:col-span-4 flex flex-col sm:flex-row justify-between p-4 px-10 border-t items-center text-center sm:text-left gap-4" style={{ borderColor: 'var(--color-border)' }}>
            <span className="font-mono text-[0.6rem] tracking-wider text-muted">© 2026 VOLT — Electronics Club, JNU. All rights reserved.</span>
            <span className="font-mono text-[0.6rem] tracking-wider text-muted">
              Built with <span style={{ color: 'var(--color-volt-yellow)' }}>⚡</span> by Volt Team
            </span>
          </div>
        </footer>

      </main>

      <style>{`
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.25; } }
        @keyframes roll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .text-muted { color: var(--color-text-secondary); }
        .group:hover .group-hover\\:pause { animation-play-state: paused !important; }
      `}</style>
    </div>
  )
}
