import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { formatDate } from '@/lib/utils'
import { getEssayGroups, readingMinutes, essayLead } from '@/lib/essays'
import type { Article } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Essays',
  description: 'Grundlegende Texte zu Medien, Wirtschaft und Gesellschaft: die Serien «9min zu 9min», «Die Toblerone-Serie» und Einzelstücke.',
}

const label: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '11px',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
}

function Meta({ essay, part }: { essay: Article; part?: string }) {
  return (
    <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--color-textgrau-hell)' }}>
      {part && <>{part} · </>}
      {formatDate(essay.frontmatter.date)} · {readingMinutes(essay)} Min.
    </span>
  )
}

function Cover({ src, ratio }: { src?: string; ratio: string }) {
  if (!src) return <div aria-hidden="true" style={{ aspectRatio: ratio, background: 'var(--color-border)' }} />
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" loading="lazy" style={{
      display: 'block', width: '100%', aspectRatio: ratio, objectFit: 'cover', borderRadius: '2px',
    }} />
  )
}

export default function EssaysPage() {
  const groups = getEssayGroups()

  return (
    <>
      <Header />
      <main style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 20px 100px' }}>
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
          Längere Texte zu Methode, Medien und Ordnung, in Serien und als Einzelstücke.
        </p>

        {/* Series index */}
        {groups.length > 1 && (
          <nav aria-label="Serien" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', margin: '0 0 48px' }}>
            {groups.map(g => (
              <a key={g.name} href={`#${encodeURIComponent(g.name)}`} style={{ ...label, fontSize: '10px', color: 'var(--color-gold)', textDecoration: 'none' }}>
                {g.name} ({g.essays.length})
              </a>
            ))}
          </nav>
        )}

        {groups.length === 0 && (
          <p style={{ fontFamily: 'var(--font-body)', fontStyle: 'italic', color: 'var(--color-textgrau-hell)' }}>
            Die erste Folge erscheint bald.
          </p>
        )}

        {groups.map(group => {
          const [first, ...rest] = group.essays
          const part = (i: number) => (group.numbered ? `Teil ${i}` : undefined)
          return (
            <section key={group.name} id={encodeURIComponent(group.name)} style={{
              borderTop: '2px solid var(--color-tannengruen)',
              padding: '24px 0 40px',
              scrollMarginTop: '80px',
            }}>
              <h2 style={{ ...label, color: 'var(--color-gold)', fontWeight: 400, margin: '0 0 6px' }}>
                {group.name}
              </h2>
              <p style={{ fontFamily: 'var(--font-body)', fontStyle: 'italic', fontSize: '15px', color: 'var(--color-textgrau)', margin: '0 0 24px', lineHeight: 1.5 }}>
                {group.intro}
              </p>

              {/* First essay of the series: large card */}
              <Link href={`/${first.slug}`} style={{ display: 'block', textDecoration: 'none' }}>
                <Cover src={first.frontmatter.coverImage} ratio="16 / 9" />
                <span style={{
                  display: 'block',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 500,
                  fontSize: 'clamp(20px, 3.4vw, 26px)',
                  color: 'var(--color-tannengruen)',
                  lineHeight: 1.25,
                  margin: '14px 0 8px',
                }}>
                  {first.frontmatter.title}
                </span>
                {essayLead(first) && (
                  <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--color-textgrau)', margin: '0 0 8px', lineHeight: 1.55 }}>
                    {essayLead(first)}
                  </span>
                )}
                <Meta essay={first} part={part(1)} />
              </Link>

              {/* Further parts: compact rows with thumbnail */}
              {rest.length > 0 && (
                <ul style={{ listStyle: 'none', padding: 0, margin: '28px 0 0' }}>
                  {rest.map((essay, i) => (
                    <li key={essay.slug} style={{ borderTop: '1px solid var(--color-border)' }}>
                      <Link href={`/${essay.slug}`} className="essay-row" style={{ textDecoration: 'none' }}>
                        <Cover src={essay.frontmatter.coverImage} ratio="4 / 3" />
                        <span style={{ display: 'block' }}>
                          <span style={{
                            display: 'block',
                            fontFamily: 'var(--font-display)',
                            fontWeight: 500,
                            fontSize: '18px',
                            color: 'var(--color-tannengruen)',
                            lineHeight: 1.3,
                            marginBottom: '6px',
                          }}>
                            {essay.frontmatter.title}
                          </span>
                          <Meta essay={essay} part={part(i + 2)} />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )
        })}
      </main>
      <Footer />
    </>
  )
}
