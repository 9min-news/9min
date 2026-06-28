import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllArticles } from '@/lib/content'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Essays',
  description: 'Grundlegende Texte zu Medien, Wirtschaft und Gesellschaft — die Serie «9min zu 9min».',
}

export default function EssaysPage() {
  const essays = getAllArticles()
    .filter(a => a.type === 'analyse' || a.type === 'grundlage')
    .sort((a, b) => (a.frontmatter.seriesIndex ?? 999) - (b.frontmatter.seriesIndex ?? 999))

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
          Essays
        </h1>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontStyle: 'italic',
          fontSize: '17px',
          color: 'var(--color-textgrau)',
          margin: '0 0 16px',
          lineHeight: 1.6,
        }}>
          Die Serie «9min zu 9min» — grundlegende Texte zu Methode, Medien und Ordnung.
        </p>

        <div style={{ width: '40px', height: '2px', background: 'var(--color-gold)', margin: '0 0 48px' }} />

        {essays.length === 0 && (
          <p style={{ fontFamily: 'var(--font-body)', fontStyle: 'italic', color: 'var(--color-textgrau-hell)' }}>
            Die erste Folge erscheint bald.
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {essays.map((essay, i) => {
            const prevSeries = essays[i - 1]?.frontmatter.series
            const thisSeries = essay.frontmatter.series
            const showSeriesHeader = thisSeries && thisSeries !== prevSeries
            const isLastInGroup = thisSeries !== essays[i + 1]?.frontmatter.series

            return (
              <div key={essay.slug}>
                {showSeriesHeader && (
                  <div style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '11px',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: 'var(--color-gold)',
                    paddingTop: i > 0 ? '48px' : '0',
                    paddingBottom: '20px',
                    borderTop: i > 0 ? '2px solid var(--color-tannengruen)' : undefined,
                  }}>
                    {thisSeries}
                  </div>
                )}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '36px 1fr',
                  gap: '20px',
                  paddingBottom: '36px',
                  marginBottom: '0',
                  borderBottom: !isLastInGroup ? '1px solid var(--color-border)' : undefined,
                  alignItems: 'start',
                }}>
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
                      {essay.type === 'analyse' ? 'Analyse' : 'Grundlage'}
                    </span>
                    <Link
                      href={`/${essay.slug}`}
                      style={{ textDecoration: 'none' }}
                    >
                      <span style={{
                        display: 'block',
                        fontFamily: 'var(--font-display)',
                        fontWeight: 500,
                        fontSize: 'clamp(18px, 3vw, 22px)',
                        color: 'var(--color-tannengruen)',
                        lineHeight: 1.3,
                        marginBottom: '8px',
                      }}>
                        {essay.frontmatter.title}
                      </span>
                    </Link>
                    {essay.frontmatter.lead && (
                      <p style={{
                        fontFamily: 'var(--font-body)',
                        fontStyle: 'italic',
                        fontSize: '15px',
                        color: 'var(--color-textgrau)',
                        margin: '0 0 8px',
                        lineHeight: 1.5,
                      }}>
                        {essay.frontmatter.lead}
                      </p>
                    )}
                    <time style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '13px',
                      color: 'var(--color-textgrau-hell)',
                    }}>
                      {formatDate(essay.frontmatter.date)}
                    </time>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </main>
      <Footer />
    </>
  )
}
