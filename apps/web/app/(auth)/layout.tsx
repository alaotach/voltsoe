export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col" style={{ background: 'var(--color-surface-base)' }}>
      {/* Decorative background */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          background:
            'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(245,197,24,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div style={{ position: 'relative', zIndex: 1 }} className="flex flex-col min-h-dvh">
        {/* Logo */}
        <div className="page-container pt-8">
          <a href="/" className="inline-flex items-center gap-2">
            <span
              style={{
                fontSize: '1.5rem',
                fontWeight: 900,
                letterSpacing: '-0.04em',
                background: 'var(--gradient-volt)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              VOLT
            </span>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--color-text-muted)',
                marginTop: '2px',
              }}
            >
              LEAGUE
            </span>
          </a>
        </div>
        {/* Auth card centered */}
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          {children}
        </div>
      </div>
    </div>
  )
}
