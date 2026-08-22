import type { Metadata } from 'next'
import { Inter, Barlow_Condensed, JetBrains_Mono, DM_Sans } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const barlow = Barlow_Condensed({
  weight: ['400', '600', '700', '800', '900'],
  subsets: ['latin'],
  variable: '--font-barlow',
  display: 'swap',
})

const jetbrains = JetBrains_Mono({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'VOLT League',
    template: '%s | VOLT League',
  },
  description:
    'The open-source competition and engagement platform for technical clubs. Earn points, climb the leaderboard, and build real projects.',
  keywords: ['electronics club', 'technical club', 'leaderboard', 'competitions', 'workshops'],
  authors: [{ name: 'VOLT League' }],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'VOLT League',
    title: 'VOLT League',
    description: 'Earn points, climb the leaderboard, and build real projects.',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${barlow.variable} ${jetbrains.variable} ${dmSans.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className={dmSans.className}>{children}</body>
    </html>
  )
}
