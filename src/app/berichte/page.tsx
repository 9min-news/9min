import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllArticles } from '@/lib/content'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Berichte',
  description: 'Quartalsberichte und analytische Tiefenberichte — dokumentierte Entwicklungen im Schweizer Mediensystem.',
}

export default function BerichtePage() {
  const berichte = getAllArticles()
    .filter(a => a.type === 'bericht')
    .sort((a, b) => new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime())

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
          Berichte
        </h1>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontStyle: 'italic',
          fontSize: '17px',
          color: 'var(--color-textgrau)',
          margin: '0 0 16px',
          lineHeight: 1.6,
        }}>
          Quartalsberichte und analytische Tiefenberichte zum Schweizer Mediensystem.
        </p>

        <div style={{ width: '40px', height: '2px', background: 'var(--color-gold)', margin: '0 0 32px' }} />

        {/* Quartalsbericht dashboard link */}
        <div style={{
          background: 'var(--color-hintergrund, #F5F4EF)',
          border: '1px solid var(--color-border)',
          borderRadius: '2px',
          padding: '24px 28px',
          marginBottom: '48px',
        }}>
          <div style={{
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--color-gold)',
            marginBottom: '10px',
          }}>
            Interaktives Dashboard
          </div>
          <Link href="/quartalsbericht" style={{ textDecoration: 'none' }}>
            <span style={{
              display: 'block',
              fontFamily: 'var(--font-display)',
              fontWeight: 500,
              fontSize: '22px',
              color: 'var(--color-tannengruen)',
              lineHeight: 1.3,
              marginBottom: '8px',
            }}>
              Quartalsbericht — Daten &amp; Statistiken →
            </span>
          </Link>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            color: 'var(--color-textgrau)',
            margin: '0',
            lineHeight: 1.5,
          }}>
            Vollständige Kennzahlen nach Quartal: Fehlertypen, Schweregrade, Medien, Themen.
          </p>
        </div>

        {/* Written reports */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {berichte.map((bericht, i) => (
            <div
              key={bericht.slug}
              style={{
                display: 'grid',
                gridTemplateColumns: '36px 1fr',
                gap: '20px',
                paddingBottom: '36px',
                marginBottom: '0',
                borderBottom: i < berichte.length - 1 ? '1px solid var(--color-border)' : undefined,
                alignItems: 'start',
              }}
            >
              <span style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                color: 'var(--color-gold)',
                letterSpacing: '0.05em',
                paddingTop: '4px',
              }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <span style={{
                  display: 'block',
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'var(--color-textgrau-hell)',
                  marginBottom: '8px',
                }}>
                  Bericht
                </span>
                <Link href={`/${bericht.slug}`} style={{ textDecoration: 'none' }}>
                  <span style={{
                    display: 'block',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 500,
                    fontSize: 'clamp(18px, 3vw, 22px)',
                    color: 'var(--color-tannengruen)',
                    lineHeight: 1.3,
                    marginBottom: '8px',
                  }}>
                    {bericht.frontmatter.title}
                  </span>
                </Link>
                {bericht.frontmatter.lead && (
                  <p style={{
                    fontFamily: 'var(--font-body)',
                    fontStyle: 'italic',
                    fontSize: '15px',
                    color: 'var(--color-textgrau)',
                    margin: '0 0 8px',
                    lineHeight: 1.5,
                  }}>
                    {bericht.frontmatter.lead}
                  </p>
                )}
                <time style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  color: 'var(--color-textgrau-hell)',
                }}>
                  {formatDate(bericht.frontmatter.date)}
                </time>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  )
}
