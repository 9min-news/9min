import type { Metadata } from 'next'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Stimmen',
  description: 'Zeitzeugen-Gespräche — erscheint 2026.',
}

export default function StimmenPage() {
  return (
    <>
      <Header />
      <main style={{ maxWidth: '680px', margin: '0 auto', padding: '80px 20px 120px', textAlign: 'center' }}>
        <span style={{
          display: 'block',
          fontFamily: 'var(--font-body)',
          fontSize: '11px',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'var(--color-gold)',
          marginBottom: '24px',
        }}>
          In Vorbereitung
        </span>

        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 500,
          fontSize: 'clamp(26px, 5vw, 36px)',
          color: 'var(--color-tannengruen)',
          margin: '0 0 24px',
          letterSpacing: '-0.01em',
          lineHeight: 1.2,
        }}>
          9min Stimmen
        </h1>

        <div style={{ width: '40px', height: '2px', background: 'var(--color-gold)', margin: '0 auto 32px' }} />

        <p style={{
          fontFamily: 'var(--font-body)',
          fontStyle: 'italic',
          fontSize: '18px',
          lineHeight: 1.65,
          color: 'var(--color-textgrau)',
          margin: '0 0 32px',
          maxWidth: '480px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          Lange Gespräche mit Menschen, die die Schweiz der Nachkriegszeit erlebt haben.
          Bauern, Lehrerinnen, Banker, Saisonniers, Aktivistinnen. Keine Experten — Zeitzeugen.
        </p>

        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '15px',
          color: 'var(--color-textgrau-hell)',
          margin: 0,
        }}>
          Erscheint 2026.
        </p>
      </main>
      <Footer />
    </>
  )
}
