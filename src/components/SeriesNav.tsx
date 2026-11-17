import Link from 'next/link'
import { getSeriesNeighbours } from '@/lib/essays'

/** «Weiter in dieser Serie»: previous/next part of an essay series. Renders nothing for single essays. */
export function SeriesNav({ slug }: { slug: string }) {
  const s = getSeriesNeighbours(slug)
  if (!s || (!s.prev && !s.next)) return null

  const cell = (dir: 'prev' | 'next') => {
    const a = s[dir]
    if (!a) return <span />
    return (
      <Link href={`/${a.slug}`} style={{ textDecoration: 'none', textAlign: dir === 'next' ? 'right' : 'left' }}>
        <span style={{
          display: 'block',
          fontFamily: 'var(--font-body)',
          fontSize: '11px',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'var(--color-textgrau-hell)',
          marginBottom: '6px',
        }}>
          {dir === 'prev' ? `← Teil ${s.index - 1}` : `Teil ${s.index + 1} →`}
        </span>
        <span style={{
          display: 'block',
          fontFamily: 'var(--font-display)',
          fontSize: '17px',
          lineHeight: 1.3,
          color: 'var(--color-tannengruen)',
        }}>
          {a.frontmatter.title}
        </span>
      </Link>
    )
  }

  return (
    <nav aria-label={`Serie ${s.series}`} style={{ marginBottom: '48px' }}>
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: '12px',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: 'var(--color-gold)',
        margin: '0 0 16px',
      }}>
        <Link href={`/essays#${encodeURIComponent(s.series)}`} style={{ color: 'inherit', textDecoration: 'none' }}>
          {s.series}
        </Link>
        {' · '}Teil {s.index} von {s.total}
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
        padding: '20px 0',
      }}>
        {cell('prev')}
        {cell('next')}
      </div>
    </nav>
  )
}
