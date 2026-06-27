import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getAllMuster, getMusterBySlug } from '@/lib/muster'
import { loadMetadata } from '@/lib/metadata'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { mdxComponents } from '@/components/mdx'
import { formatDate } from '@/lib/utils'

export async function generateStaticParams() {
  return getAllMuster().map(m => ({ id: m.slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params
  const muster = getMusterBySlug(id)
  if (!muster) return {}
  const url = `https://9min.ch/muster/${muster.slug}`
  return {
    title: `${muster.title} — Muster — 9min`,
    description: muster.subtitle,
    alternates: { canonical: url },
    openGraph: {
      title: `${muster.id} — ${muster.title}`,
      description: muster.subtitle,
      url,
      siteName: '9min',
      locale: 'de_CH',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${muster.id} — ${muster.title}`,
      description: muster.subtitle,
    },
  }
}

function SchwereDots({ value }: { value: number }) {
  return (
    <span aria-label={`Schwere ${value} von 3`} style={{ letterSpacing: '3px', fontSize: '11px' }}>
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

const TYPE_LABELS: Record<string, string> = {
  medienkritik: 'Medienkritik',
  analyse: 'Analyse',
  grundlage: 'Grundlage',
  chronik: 'Chronik',
}

export default async function MusterDetailPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const muster = getMusterBySlug(id)
  if (!muster) notFound()

  const linked = loadMetadata().filter(e => e.muster_id === muster.id)

  return (
    <>
      <Header />
      <main style={{ maxWidth: '680px', margin: '0 auto', padding: '40px 20px 100px' }}>

        {/* Breadcrumb */}
        <p style={{ marginBottom: '40px' }}>
          <Link href="/muster" style={{
            fontFamily: 'var(--font-body)',
            fontSize: '12px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--color-textgrau-hell)',
            textDecoration: 'none',
          }}>
            ← Muster
          </Link>
        </p>

        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--color-gold)',
            }}>
              {muster.id}
            </span>
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: '10px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--color-textgrau-hell)',
            }}>
              {muster.kategorie}
            </span>
            <SchwereDots value={muster.schwere_tendenz} />
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 500,
            fontSize: 'clamp(26px, 5vw, 36px)',
            color: 'var(--color-tannengruen)',
            margin: '0 0 10px',
            lineHeight: 1.2,
          }}>
            {muster.title}
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontStyle: 'italic',
            fontSize: '17px',
            color: 'var(--color-textgrau)',
            margin: 0,
            lineHeight: 1.6,
          }}>
            {muster.subtitle}
          </p>
        </div>

        {/* Divider */}
        <div aria-hidden="true" style={{ width: '40%', height: '1px', background: 'var(--color-gold)', margin: '0 auto 40px' }} />

        {/* Body */}
        <div className="prose-9min">
          <MDXRemote source={muster.content} components={mdxComponents} />
        </div>

        {/* Linked examples */}
        {linked.length > 0 && (
          <section style={{ marginTop: '56px' }}>
            <div aria-hidden="true" style={{ width: '40%', height: '1px', background: 'var(--color-border)', margin: '0 auto 40px' }} />
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--color-textgrau-hell)',
              margin: '0 0 24px',
            }}>
              Beispiele · {linked.length} {linked.length === 1 ? 'Beitrag' : 'Beiträge'}
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {linked.map((entry, i) => (
                <li key={entry.slug} style={{
                  borderTop: i === 0 ? '1px solid var(--color-border)' : undefined,
                  borderBottom: '1px solid var(--color-border)',
                }}>
                  <Link href={`/${entry.slug}`} style={{
                    display: 'block',
                    padding: '16px 0',
                    textDecoration: 'none',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '4px' }}>
                      <span style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '10px',
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        color: entry.type === 'medienkritik' ? 'var(--color-textgrau-hell)' : 'var(--color-gold)',
                        flexShrink: 0,
                      }}>
                        {TYPE_LABELS[entry.type] ?? entry.type}
                      </span>
                      <time style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--color-textgrau-hell)' }}>
                        {formatDate(entry.date)}
                      </time>
                      {entry.kritisiertes_medium && (
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--color-textgrau-hell)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                          {entry.kritisiertes_medium}
                        </span>
                      )}
                    </div>
                    <span style={{
                      display: 'block',
                      fontFamily: 'var(--font-display)',
                      fontSize: '16px',
                      lineHeight: 1.3,
                      color: 'var(--color-tannengruen)',
                      marginBottom: entry.these ? '5px' : 0,
                    }}>
                      {entry.title}
                    </span>
                    {entry.these && (
                      <span style={{
                        display: 'block',
                        fontFamily: 'var(--font-body)',
                        fontSize: '13px',
                        lineHeight: 1.5,
                        color: 'var(--color-textgrau)',
                      }}>
                        {entry.these.length > 120 ? entry.these.slice(0, 120) + '…' : entry.these}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

      </main>
      <Footer />
    </>
  )
}
