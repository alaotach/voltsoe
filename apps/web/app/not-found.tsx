import Link from 'next/link'

export default function NotFoundPage() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-surface-base)',
        textAlign: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          fontSize: '6rem',
          fontWeight: 900,
          letterSpacing: '-0.06em',
          lineHeight: 1,
          background: 'var(--gradient-volt)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: 16,
        }}
      >
        404
      </div>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 8 }}>Page not found</h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: 28 }}>
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link href="/dashboard" className="btn btn-primary">
        Go to Dashboard
      </Link>
    </div>
  )
}
