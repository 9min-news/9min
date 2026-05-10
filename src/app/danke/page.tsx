import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Danke',
  description: 'Abonnement bestätigt.',
  robots: { index: false },
}

export default function DankePage() {
  return (
    <>
      <Header />

      <main
        style={{
          maxWidth: '680px',
          margin: '0 auto',
          padding: '80px 20px 120px',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontFamily: "'GT Sectra Display', Georgia, serif",
            fontWeight: 500,
            fontSize: 'clamp(28px, 5vw, 36px)',
            color: '#1A2E1A',
            margin: '0 0 24px',
          }}
        >
          Danke — du bist dabei.
        </p>

        <p
          style={{
            fontFamily: "'GT Sectra', Georgia, serif",
            fontSize: '17px',
            lineHeight: 1.7,
            color: '#4A5C4A',
            margin: '0 0 40px',
          }}
        >
          Du erhältst neue Beiträge direkt in dein Postfach.
        </p>

        <Link
          href="/"
          style={{
            fontFamily: "'GT Sectra', Georgia, serif",
            fontSize: '15px',
            color: '#1A2E1A',
            textDecoration: 'underline',
            textUnderlineOffset: '3px',
          }}
        >
          Zurück zur Startseite
        </Link>
      </main>

      <Footer />
    </>
  )
}
