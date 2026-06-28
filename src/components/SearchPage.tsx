'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Fuse from 'fuse.js'
import type { MetadataEntry } from '@/lib/metadata'
import { formatDate } from '@/lib/utils'

interface Props {
  entries: MetadataEntry[]
}

const TYPE_LABELS: Record<string, string> = {
  medienkritik: 'Medienkritik',
  analyse: 'Analyse',
  grundlage: 'Grundlage',
  chronik: 'Chronik',
}

export function SearchPage({ entries }: Props) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const initialQ = searchParams.get('q') ?? ''
  const [query, setQuery] = useState(initialQ)
  const [results, setResults] = useState<MetadataEntry[]>([])
  const [searched, setSearched] = useState(false)

  const fuse = useRef(new Fuse(entries, {
    keys: [
      { name: 'title', weight: 2 },
      { name: 'these', weight: 1.5 },
      { name: 'zusammenfassung', weight: 1 },
      { name: 'tags', weight: 0.8 },
      { name: 'themen', weight: 0.8 },
      { name: 'kritisiertes_medium', weight: 0.7 },
      { name: 'kritisierter_beitrag', weight: 0.7 },
      { name: 'personen', weight: 0.6 },
      { name: 'institutionen', weight: 0.5 },
      { name: 'kritisierter_autor', weight: 0.5 },
    ],
    threshold: 0.35,
    minMatchCharLength: 2,
    includeScore: true,
  }))

  const runSearch = useCallback((q: string) => {
    const trimmed = q.trim()
    if (!trimmed) {
      setResults([])
      setSearched(false)
      return
    }
    const hits = fuse.current.search(trimmed).map(r => r.item)
    setResults(hits)
    setSearched(true)
  }, [])

  useEffect(() => {
    if (initialQ) runSearch(initialQ)
    inputRef.current?.focus()
  }, [initialQ, runSearch])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setQuery(val)
    runSearch(val)
    const params = new URLSearchParams()
    if (val.trim()) params.set('q', val.trim())
    router.replace(val.trim() ? `?${params.toString()}` : '?', { scroll: false })
  }

  const showRecent = !searched && query.length === 0

  return (
    <div>
      {/* Search input */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderBottom: '2px solid var(--color-tannengruen)',
        paddingBottom: '12px',
        marginBottom: '40px',
      }}>
        <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ flexShrink: 0, color: 'var(--color-textgrau-hell)' }}>
          <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={handleChange}
          placeholder="Suchen…"
          autoComplete="off"
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(20px, 4vw, 28px)',
            color: 'var(--color-tannengruen)',
            background: 'transparent',
            caretColor: 'var(--color-gold)',
          }}
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setResults([]); setSearched(false); router.replace('?', { scroll: false }); inputRef.current?.focus() }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-textgrau-hell)', fontSize: '18px', padding: '0 4px', lineHeight: 1 }}
            aria-label="Suche löschen"
          >
            ✕
          </button>
        )}
      </div>

      {/* Results */}
      {searched && (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-textgrau-hell)', margin: '0 0 28px' }}>
          {results.length === 0
            ? `Keine Ergebnisse für «${query}»`
            : `${results.length} ${results.length === 1 ? 'Ergebnis' : 'Ergebnisse'} für «${query.trim()}»`}
        </p>
      )}

      {/* Recent fallback */}
      {showRecent && (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-textgrau-hell)', margin: '0 0 28px' }}>
          {entries.length} Beiträge durchsuchbar
        </p>
      )}

      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {(searched ? results : entries.slice(0, 8)).map((entry, i) => (
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
    </div>
  )
}
