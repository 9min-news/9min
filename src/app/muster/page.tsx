import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllMuster } from '@/lib/muster'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Muster — 9min',
  description: 'Wiederkehrende Muster im Schweizer Journalismus.',
}

function SchwereDots({ value }: { value: number }) {
  return (
    <span aria-label={`Schwere ${value} von 3`} style={{ letterSpacing: '3px', fontSize: '10px' }}>
      {[1, 2, 3].map(i => (
        <span
          key={i}
          style={{ color: i <= value ? 'var(--color-gold)' : 'var(--color-border)' }}
        >
          ●
        </span>
      ))}
    </span>
  )
}

export default function MusterPage() {
  const muster = getAllMuster()

  return (
    <>
      <Header />
      <main style={{ maxWidth: '680px', margin: '0 auto', padding: '60px 20px 100px' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 500,
          fontSize: 'clamp(28px, 5vw, 38px)',
          color: 'var(--color-tannengruen)',
          margin: '0 0 12px',
          letterSpacing: '-0.01em',
        }}>
          Muster
        </h1>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontStyle: 'italic',
          fontSize: '17px',
          color: 'var(--color-textgrau)',
          margin: '0 0 56px',
          lineHeight: 1.6,
        }}>
          Wiederkehrende Formen von Fehlern und Verzerrungen im Schweizer Journalismus.
        </p>

        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {muster.map((m, i) => (
            <li key={m.id} style={{
              borderTop: i === 0 ? '1px solid var(--color-border)' : undefined,
              borderBottom: '1px solid var(--color-border)',
            }}>
              <Link href={`/muster/${m.slug}`} style={{
                display: 'block',
                padding: '24px 0',
                textDecoration: 'none',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '12px',
                  marginBottom: '8px',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '10px',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'var(--color-gold)',
                    flexShrink: 0,
                  }}>
                    {m.id}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '10px',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'var(--color-textgrau-hell)',
                  }}>
                    {m.kategorie}
                  </span>
                  <span style={{ marginLeft: 'auto' }}>
                    <SchwereDots value={m.schwere_tendenz} />
                  </span>
                </div>
                <span style={{
                  display: 'block',
                  fontFamily: 'var(--font-display)',
                  fontSize: '20px',
                  lineHeight: 1.25,
                  color: 'var(--color-tannengruen)',
                  marginBottom: '6px',
                }}>
                  {m.title}
                </span>
                <span style={{
                  display: 'block',
                  fontFamily: 'var(--font-body)',
                  fontStyle: 'italic',
                  fontSize: '14px',
                  color: 'var(--color-textgrau)',
                  lineHeight: 1.5,
                  marginBottom: m.beispielCount > 0 ? '10px' : 0,
                }}>
                  {m.subtitle}
                </span>
                {m.beispielCount > 0 && (
                  <span style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '11px',
                    color: 'var(--color-textgrau-hell)',
                  }}>
                    {m.beispielCount} {m.beispielCount === 1 ? 'Beispiel' : 'Beispiele'}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </>
  )
}
