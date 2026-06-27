'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Article } from '@/lib/content'
import { formatDate } from '@/lib/utils'

const SCHWERE_LABELS: Record<string, string> = {
  '1': 'leicht',
  '2': 'mittel',
  '3': 'schwerwiegend',
}

interface Props {
  articles: Article[]
  categories: string[]
  kritikTypen?: string[]
  medien?: string[]
}

export function CategoryFilter({ articles, categories, kritikTypen = [], medien = [] }: Props) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const activeKat = searchParams.get('kategorie') ?? null
  const activeTyp = searchParams.get('typ') ?? null
  const activeMedium = searchParams.get('medium') ?? null
  const activeSchwere = searchParams.get('schwere') ?? null
  const anyActive = !!(activeKat || activeTyp || activeMedium || activeSchwere)
  const activeCount = [activeKat, activeTyp, activeMedium, activeSchwere].filter(Boolean).length

  // Only show medien that appear more than once (filter out noise)
  const usefulMedien = medien.filter(m => m === 'SRF' || ['NZZ', 'Tages-Anzeiger', 'Swissinfo', 'SRF 4 News', 'NZZ am Sonntag', 'Blick', 'TeleZüri'].includes(m))

  function toggle(key: string, current: string | null, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (current === value) params.delete(key)
    else params.set(key, value)
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  function clearAll() {
    router.replace('?', { scroll: false })
    setOpen(false)
  }

  const filtered = articles.filter(a => {
    if (activeKat && !a.frontmatter.categories?.includes(activeKat)) return false
    if (activeTyp && !a.frontmatter.kritik_typ?.includes(activeTyp)) return false
    if (activeMedium && a.frontmatter.kritisiertes_medium !== activeMedium) return false
    if (activeSchwere && String(a.frontmatter.kritik_schwere ?? '') !== activeSchwere) return false
    return true
  })

  return (
    <div>
      {/* Filter bar */}
      <div style={{
        borderTop: '1px solid var(--color-border)',
        borderBottom: open ? 'none' : '1px solid var(--color-border)',
        marginBottom: open ? 0 : '32px',
      }}>
        <button
          onClick={() => setOpen(v => !v)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            width: '100%',
            padding: '12px 0',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--color-textgrau-hell)',
          }}>
            Filter
          </span>
          {anyActive && (
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: '10px',
              letterSpacing: '0.08em',
              background: 'var(--color-tannengruen)',
              color: 'var(--color-bg-paper)',
              borderRadius: '10px',
              padding: '1px 7px',
            }}>
              {activeCount}
            </span>
          )}
          {/* Active filter labels when collapsed */}
          {!open && anyActive && (
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              color: 'var(--color-tannengruen)',
              marginLeft: '4px',
            }}>
              {[activeKat, activeTyp, activeMedium, activeSchwere ? SCHWERE_LABELS[activeSchwere] : null].filter(Boolean).join(' · ')}
            </span>
          )}
          <span style={{
            marginLeft: 'auto',
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            color: 'var(--color-textgrau-hell)',
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 150ms ease',
            display: 'inline-block',
          }}>
            ▾
          </span>
        </button>

        {/* Expanded panel */}
        {open && (
          <div style={{
            paddingBottom: '20px',
            borderBottom: '1px solid var(--color-border)',
            marginBottom: '32px',
          }}>
            {/* Thema */}
            {categories.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-textgrau-hell)', margin: '0 0 8px' }}>Thema</p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {categories.map(cat => (
                    <button key={cat} onClick={() => toggle('kategorie', activeKat, cat)} style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '11px',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: activeKat === cat ? 'var(--color-bg-paper)' : 'var(--color-tannengruen)',
                      background: activeKat === cat ? 'var(--color-tannengruen)' : 'transparent',
                      border: '1px solid var(--color-tannengruen)',
                      borderRadius: '2px',
                      padding: '3px 10px',
                      cursor: 'pointer',
                      transition: 'all 120ms ease',
                    }}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Kritik-Typ */}
            {kritikTypen.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-textgrau-hell)', margin: '0 0 8px' }}>Kritik-Typ</p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {kritikTypen.map(typ => (
                    <button key={typ} onClick={() => toggle('typ', activeTyp, typ)} style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '11px',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: activeTyp === typ ? 'var(--color-bg-paper)' : 'var(--color-tannengruen)',
                      background: activeTyp === typ ? 'var(--color-tannengruen)' : 'transparent',
                      border: '1px solid var(--color-tannengruen)',
                      borderRadius: '2px',
                      padding: '3px 10px',
                      cursor: 'pointer',
                      transition: 'all 120ms ease',
                    }}>
                      {typ}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Medium */}
            {usefulMedien.length > 0 && (
              <div style={{ marginBottom: '4px' }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-textgrau-hell)', margin: '0 0 8px' }}>Medium</p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {usefulMedien.map(m => (
                    <button key={m} onClick={() => toggle('medium', activeMedium, m)} style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '11px',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: activeMedium === m ? 'var(--color-bg-paper)' : 'var(--color-tannengruen)',
                      background: activeMedium === m ? 'var(--color-tannengruen)' : 'transparent',
                      border: '1px solid var(--color-tannengruen)',
                      borderRadius: '2px',
                      padding: '3px 10px',
                      cursor: 'pointer',
                      transition: 'all 120ms ease',
                    }}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Schwere */}
            <div style={{ marginBottom: '4px' }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-textgrau-hell)', margin: '0 0 8px' }}>Schwere</p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {(['1', '2', '3'] as const).map(s => (
                  <button key={s} onClick={() => toggle('schwere', activeSchwere, s)} style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '11px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: activeSchwere === s ? 'var(--color-bg-paper)' : 'var(--color-tannengruen)',
                    background: activeSchwere === s ? 'var(--color-tannengruen)' : 'transparent',
                    border: '1px solid var(--color-tannengruen)',
                    borderRadius: '2px',
                    padding: '3px 10px',
                    cursor: 'pointer',
                    transition: 'all 120ms ease',
                  }}>
                    {SCHWERE_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>

            {anyActive && (
              <button onClick={clearAll} style={{
                marginTop: '16px',
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                letterSpacing: '0.1em',
                color: 'var(--color-textgrau-hell)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                textDecoration: 'underline',
                textUnderlineOffset: '3px',
              }}>
                Filter löschen
              </button>
            )}
          </div>
        )}
      </div>

      {/* Count */}
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: '13px',
        color: 'var(--color-textgrau-hell)',
        margin: '0 0 24px',
      }}>
        {filtered.length} {filtered.length === 1 ? 'Beitrag' : 'Beiträge'}
        {anyActive && (
          <> · <span style={{ color: 'var(--color-tannengruen)' }}>{[activeKat, activeTyp, activeMedium, activeSchwere ? SCHWERE_LABELS[activeSchwere] : null].filter(Boolean).join(' · ')}</span></>
        )}
      </p>

      {/* Article list */}
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {filtered.map((article, i) => (
          <li
            key={article.slug}
            style={{
              borderTop: i === 0 ? '1px solid var(--color-border)' : undefined,
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            <Link
              href={`/${article.slug}`}
              style={{
                display: 'grid',
                gridTemplateColumns: article.frontmatter.coverImage ? '72px 1fr' : '1fr',
                gap: '14px',
                padding: '16px 0',
                textDecoration: 'none',
                alignItems: 'center',
              }}
            >
              {article.frontmatter.coverImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={article.frontmatter.coverImage}
                  alt=""
                  style={{ width: '72px', height: '54px', objectFit: 'cover', borderRadius: '2px', flexShrink: 0 }}
                />
              )}
              <div>
                <span style={{
                  display: 'block',
                  fontFamily: 'var(--font-display)',
                  fontSize: '16px',
                  lineHeight: 1.3,
                  color: 'var(--color-tannengruen)',
                  marginBottom: '5px',
                }}>
                  {article.frontmatter.title}
                </span>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <time style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--color-textgrau-hell)' }}>
                    {formatDate(article.frontmatter.date)}
                  </time>
                  {article.frontmatter.kritisiertes_medium && (
                    <span style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '10px',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: 'var(--color-textgrau-hell)',
                    }}>
                      {article.frontmatter.kritisiertes_medium}
                    </span>
                  )}
                  {article.frontmatter.kritik_typ?.slice(0, 1).map(typ => (
                    <span key={typ} style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '10px',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: 'var(--color-gold)',
                    }}>
                      {typ}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {filtered.length === 0 && (
        <p style={{ fontFamily: 'var(--font-body)', fontStyle: 'italic', color: 'var(--color-textgrau-hell)', textAlign: 'center', padding: '60px 0' }}>
          Keine Beiträge für diese Filter.
        </p>
      )}
    </div>
  )
}
