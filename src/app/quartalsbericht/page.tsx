import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import rawMetadata from '@/data/metadata.json'

export const metadata: Metadata = {
  title: 'Quartalsbericht Q2 2026 — 9min',
  description: 'Systematische Auswertung der 9min-Medienkritik: Fehlertypen, Themen und Strukturmuster im zweiten Quartal 2026.',
}

type Article = {
  slug: string
  title: string
  date: string
  type: string
  tweetId: string
  readingTime: number
  categories: string[]
  themen: string[]
  tags: string[]
  kritisiertes_medium: string
  kritisierter_beitrag: string
  kritisierter_autor: string
  kritik_typ: string[]
  personen: string[]
  institutionen: string[]
  gesetze_vorlagen: string[]
  these: string
  zusammenfassung: string
  quelle_datum: string
  quelle_format: string
  quelle_sendung: string
  quelle_redaktion: string
  kritik_schwere: number
  muster_id: string
}

const KRITIK_TYP_DEFINITIONS: Record<string, string> = {
  'Framing': 'Wie ein Sachverhalt dargestellt wird, bestimmt die Wahrnehmung — unabhängig vom Faktum.',
  'Auslassung': 'Wesentliche Informationen fehlen, die das Urteil des Publikums verändern würden.',
  'Kontextmangel': 'Fakten werden ohne den notwendigen historischen oder sachlichen Hintergrund präsentiert.',
  'Selektion': 'Nur Quellen oder Stimmen, die eine bestimmte Sichtweise bestätigen, werden berücksichtigt.',
  'Fehlinformation': 'Sachlich falsche Aussagen werden veröffentlicht ohne Korrektur.',
  'Interessenkonflikt': 'Berichterstattung ist von institutionellen oder persönlichen Interessen beeinflusst.',
  'Asymmetrie': 'Vergleichbare Sachverhalte werden unterschiedlich stark oder anders bewertet.',
  'Einordnungsfehler': 'Ein Ereignis wird falsch kategorisiert oder in den falschen Bedeutungsrahmen gesetzt.',
  'Behördenpropaganda': 'Amtliche Kommunikation wird unkritisch übernommen und als journalistische Leistung präsentiert.',
  'Quotenfüllung': 'Schein-Ausgewogenheit durch bedeutungslose oder schwache Gegenstimmen.',
  'Autoritätsargument': 'Expertenmeinungen werden als Fakten präsentiert, ohne die Grundlage zu hinterfragen.',
  'False Equivalence': 'Ungleichwertige Positionen werden als gleichwertig behandelt.',
}

const MONTH_NAMES: Record<string, string> = {
  '2026-01': 'Januar', '2026-02': 'Februar', '2026-03': 'März',
  '2026-04': 'April', '2026-05': 'Mai', '2026-06': 'Juni',
  '2026-07': 'Juli', '2026-08': 'August', '2026-09': 'September',
  '2026-10': 'Oktober', '2026-11': 'November', '2026-12': 'Dezember',
}

function freq<T extends string>(items: T[][]): [T, number][] {
  const counts: Record<string, number> = {}
  for (const arr of items) {
    for (const item of arr) {
      if (item) counts[item] = (counts[item] ?? 0) + 1
    }
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1]) as [T, number][]
}

function PillarLabel({ n, label }: { n: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
      <span style={{
        fontFamily: 'var(--font-body)',
        fontSize: '10px',
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: 'var(--color-gold)',
      }}>
        {n}
      </span>
      <span style={{
        fontFamily: 'var(--font-body)',
        fontSize: '10px',
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: 'var(--color-textgrau-hell)',
      }}>
        {label}
      </span>
    </div>
  )
}

function SchwereDots({ schwere }: { schwere: number }) {
  return (
    <span aria-label={`Schwere ${schwere} von 3`} style={{ letterSpacing: '2px', fontSize: '9px' }}>
      {[1, 2, 3].map(i => (
        <span key={i} style={{ color: i <= schwere ? 'var(--color-gold)' : 'var(--color-border)' }}>●</span>
      ))}
    </span>
  )
}

function Bar({ value, max }: { value: number; max: number }) {
  const pct = Math.max(2, Math.round((value / max) * 100))
  return (
    <div style={{ height: '3px', background: 'var(--color-border)', margin: '8px 0 4px', borderRadius: '2px' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: 'var(--color-gold)', borderRadius: '2px', opacity: 0.85 }} />
    </div>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontFamily: 'var(--font-body)',
      fontWeight: 400,
      fontSize: '10px',
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      color: 'var(--color-textgrau-hell)',
      margin: '48px 0 24px',
    }}>
      {children}
    </h2>
  )
}

export default function QuartalPage() {
  const all = rawMetadata as Article[]
  const articles = all.filter(a => a.date >= '2026-04-01' && a.date <= '2026-06-30')

  // ── Normalize medium names for display ───────────────────────────────────
  function normalizeMedium(m: string): string {
    if (!m) return ''
    if (m.startsWith('SRF')) return 'SRF'
    if (m === 'Tagesanzeiger') return 'Tages-Anzeiger'
    if (m === 'NZZ am Sonntag') return 'NZZ am Sonntag'  // keep distinct from NZZ
    return m
  }

  // ── Core stats ────────────────────────────────────────────────────────────
  const totalCount = articles.length
  const distinctMedien = new Set(
    articles.map(a => normalizeMedium(a.kritisiertes_medium)).filter(m => m && m !== '9min.ch')
  ).size
  const avgSchwere = (articles.reduce((s, a) => s + (a.kritik_schwere ?? 2), 0) / totalCount).toFixed(1)
  const pctSchwere3 = Math.round(articles.filter(a => a.kritik_schwere === 3).length / totalCount * 100)

  // ── Kritik-Typ ranking ────────────────────────────────────────────────────
  const typMap: Record<string, Article[]> = {}
  for (const a of articles) {
    for (const t of a.kritik_typ ?? []) {
      typMap[t] = typMap[t] ?? []
      typMap[t].push(a)
    }
  }
  const typRanking = Object.entries(typMap)
    .map(([t, arts]) => ({ type: t, count: arts.length, articles: arts }))
    .sort((a, b) => b.count - a.count)
  const maxTypCount = typRanking[0]?.count ?? 1

  // ── Quellen ranking (normalized, exclude self-analyses) ──────────────────
  const medMap: Record<string, number> = {}
  for (const a of articles) {
    const m = normalizeMedium(a.kritisiertes_medium)
    if (m && m !== '9min.ch') medMap[m] = (medMap[m] ?? 0) + 1
  }
  const medRanking = Object.entries(medMap).sort((a, b) => b[1] - a[1])
  const maxMedCount = medRanking[0]?.[1] ?? 1

  // SRF breakdown by Sendung
  const srfSendungen: Record<string, number> = {}
  for (const a of articles) {
    if ((a.kritisiertes_medium ?? '').startsWith('SRF') && a.quelle_sendung) {
      srfSendungen[a.quelle_sendung] = (srfSendungen[a.quelle_sendung] ?? 0) + 1
    }
  }
  const srfSendungRanking = Object.entries(srfSendungen).sort((a, b) => b[1] - a[1])

  // ── Top severity 3 cases ──────────────────────────────────────────────────
  const topCases = articles
    .filter(a => a.kritik_schwere === 3 && a.these)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10)

  // ── Themen (filtered to non-meta topics) ─────────────────────────────────
  const META_THEMEN = new Set(['Medienkritik', 'Journalismus', 'SRF-Berichterstattung', 'Medienberichterstattung', 'SRF', 'Berichterstattung', 'Medien'])
  const topThemen = freq(articles.map(a => a.themen ?? []))
    .filter(([t]) => !META_THEMEN.has(t))
    .slice(0, 15)
  const maxThemaCount = topThemen[0]?.[1] ?? 1

  // ── Gesetze & Vorlagen ────────────────────────────────────────────────────
  const topGesetze = freq(articles.map(a => a.gesetze_vorlagen ?? [])).slice(0, 8)
  const maxGesCount = topGesetze[0]?.[1] ?? 1

  // ── Personen & Institutionen ──────────────────────────────────────────────
  const topPersonen = freq(articles.map(a => a.personen ?? [])).slice(0, 10)
  const topInstitutionen = freq(
    articles.map(a => (a.institutionen ?? []).filter(i => i !== 'SRF' && i !== 'SRG'))
  ).slice(0, 10)

  // ── Monthly timeline ──────────────────────────────────────────────────────
  const byMonth: Record<string, number> = {}
  for (const a of articles) {
    const m = a.date.slice(0, 7)
    byMonth[m] = (byMonth[m] ?? 0) + 1
  }
  const months = Object.entries(byMonth).sort((a, b) => a[0].localeCompare(b[0]))

  // ── Formatting helpers ────────────────────────────────────────────────────
  function formatDate(iso: string) {
    const [, m, d] = iso.split('-')
    return `${parseInt(d)}. ${['', 'Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'][parseInt(m)]} 2026`
  }

  const hr = (
    <hr style={{
      border: 'none',
      borderTop: '1px solid var(--color-border)',
      margin: '72px 0',
    }}
    />
  )

  const anchorLinkStyle = {
    fontFamily: 'var(--font-body)',
    fontSize: '13px',
    color: 'var(--color-textgrau)',
    textDecoration: 'none',
    letterSpacing: '0.02em',
  } as const

  return (
    <>
      <Header />
      <main style={{ maxWidth: '680px', margin: '0 auto', padding: '60px 20px 100px' }}>

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '11px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--color-gold)',
          margin: '0 0 16px',
        }}>
          Quartalsbericht
        </p>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 500,
          fontSize: 'clamp(30px, 5vw, 42px)',
          color: 'var(--color-tannengruen)',
          margin: '0 0 16px',
          letterSpacing: '-0.02em',
          lineHeight: 1.15,
        }}>
          Q2 2026
        </h1>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontStyle: 'italic',
          fontSize: '17px',
          color: 'var(--color-textgrau)',
          margin: '0 0 40px',
          lineHeight: 1.65,
        }}>
          April bis Juni 2026 — {totalCount} Analysen, {distinctMedien} Medien erfasst.{' '}
          Eine systematische Auswertung: welche Fehlertypen dominieren, welche Themen
          dahinter stehen, wie 9min arbeitet.
        </p>

        {/* Anchor nav */}
        <div style={{ display: 'flex', gap: '24px', borderTop: '1px solid var(--color-border)', paddingTop: '20px', marginBottom: '0' }}>
          {[
            { href: '#medienkritik', label: 'I. Medienkritik' },
            { href: '#kontext', label: 'II. Kontext' },
            { href: '#sachlichkeit', label: 'III. Sachlichkeit' },
          ].map(({ href, label }) => (
            <a key={href} href={href} style={anchorLinkStyle}>{label}</a>
          ))}
        </div>

        {hr}

        {/* ═══════════════════════════════════════════════════════════════════
            PILLAR I — MEDIENKRITIK
        ════════════════════════════════════════════════════════════════════ */}
        <div id="medienkritik">
          <PillarLabel n="I" label="Medienkritik" />
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 500,
            fontSize: 'clamp(22px, 4vw, 30px)',
            color: 'var(--color-tannengruen)',
            margin: '0 0 8px',
            letterSpacing: '-0.01em',
          }}>
            Was wurde verschwiegen, verzerrt, falsch eingeordnet?
          </h2>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontStyle: 'italic',
            fontSize: '15px',
            color: 'var(--color-textgrau)',
            margin: '0 0 48px',
            lineHeight: 1.6,
          }}>
            Systematische Dokumentation von Fehlern in der Schweizer Medienberichterstattung —
            nach Fehlertyp, Medium und Schwere.
          </p>

          {/* Scorecard */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1px',
            background: 'var(--color-border)',
            border: '1px solid var(--color-border)',
            marginBottom: '56px',
          }}>
            {[
              { value: totalCount.toString(), label: 'Analysen' },
              { value: distinctMedien.toString(), label: 'Medien erfasst' },
              { value: `Ø ${avgSchwere}`, label: 'Schwere (∅)' },
              { value: `${pctSchwere3}%`, label: 'kritische Fälle' },
            ].map(({ value, label }) => (
              <div key={label} style={{
                background: 'var(--color-bg-paper)',
                padding: '20px 16px',
                textAlign: 'center',
              }}>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '26px',
                  fontWeight: 500,
                  color: 'var(--color-tannengruen)',
                  lineHeight: 1,
                  marginBottom: '6px',
                }}>
                  {value}
                </div>
                <div style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '10px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--color-textgrau-hell)',
                }}>
                  {label}
                </div>
              </div>
            ))}
          </div>

          {/* Kritik-Typen Ranking */}
          <SectionHeading>Fehlertypen nach Häufigkeit</SectionHeading>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {typRanking.map(({ type, count, articles: typeArts }) => {
              const pct = Math.round(count / totalCount * 100)
              const s1 = typeArts.filter(a => a.kritik_schwere === 1).length
              const s2 = typeArts.filter(a => a.kritik_schwere === 2).length
              const s3 = typeArts.filter(a => a.kritik_schwere === 3).length
              const examples = typeArts
                .filter(a => a.these)
                .sort((a, b) => (b.kritik_schwere ?? 2) - (a.kritik_schwere ?? 2) || b.date.localeCompare(a.date))
                .slice(0, 3)

              return (
                <li key={type} style={{
                  borderBottom: '1px solid var(--color-border)',
                  padding: '28px 0',
                }}>
                  {/* Type header */}
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px' }}>
                    <span style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '18px',
                      color: 'var(--color-tannengruen)',
                      fontWeight: 500,
                    }}>
                      {type}
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '13px',
                      color: 'var(--color-textgrau)',
                      flexShrink: 0,
                    }}>
                      {count} Artikel · {pct}%
                    </span>
                  </div>

                  {/* Bar */}
                  <Bar value={count} max={maxTypCount} />

                  {/* Severity counts */}
                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    marginBottom: '10px',
                    fontFamily: 'var(--font-body)',
                    fontSize: '11px',
                    color: 'var(--color-textgrau-hell)',
                  }}>
                    {[['●', 1, s1], ['●●', 2, s2], ['●●●', 3, s3]].map(([dots, level, cnt]) => cnt as number > 0 && (
                      <span key={level as number}>
                        <span style={{ color: 'var(--color-gold)', letterSpacing: '1px', fontSize: '9px' }}>{dots}</span>
                        {' '}{cnt as number}×
                      </span>
                    ))}
                  </div>

                  {/* Definition */}
                  <p style={{
                    fontFamily: 'var(--font-body)',
                    fontStyle: 'italic',
                    fontSize: '13px',
                    color: 'var(--color-textgrau)',
                    margin: '0 0 20px',
                    lineHeight: 1.6,
                  }}>
                    {KRITIK_TYP_DEFINITIONS[type] ?? ''}
                  </p>

                  {/* Example articles */}
                  {examples.length > 0 && (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {examples.map(ex => (
                        <li key={ex.slug} style={{
                          borderLeft: '2px solid var(--color-gold)',
                          paddingLeft: '12px',
                        }}>
                          <Link
                            href={`/${ex.slug}`}
                            style={{
                              fontFamily: 'var(--font-body)',
                              fontSize: '14px',
                              color: 'var(--color-tannengruen)',
                              textDecoration: 'none',
                              display: 'block',
                              marginBottom: '3px',
                            }}
                          >
                            {ex.title}
                          </Link>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontFamily: 'var(--font-body)',
                            fontSize: '11px',
                            color: 'var(--color-textgrau-hell)',
                            marginBottom: '4px',
                          }}>
                            <span>{formatDate(ex.date)}</span>
                            {ex.kritisiertes_medium && <><span>·</span><span>{normalizeMedium(ex.kritisiertes_medium)}</span></>}
                            <span>·</span>
                            <SchwereDots schwere={ex.kritik_schwere} />
                          </div>
                          {ex.these && (
                            <p style={{
                              fontFamily: 'var(--font-body)',
                              fontStyle: 'italic',
                              fontSize: '12px',
                              color: 'var(--color-textgrau)',
                              margin: 0,
                              lineHeight: 1.5,
                            }}>
                              {ex.these}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              )
            })}
          </ul>

          {/* Quellen im Fokus */}
          <SectionHeading>Quellen im Fokus</SectionHeading>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px' }}>
            {medRanking.map(([med, count]) => (
              <li key={med} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '14px',
                    color: med === 'Unbekannt' ? 'var(--color-textgrau-hell)' : 'var(--color-tannengruen)',
                  }}>
                    {med}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    color: 'var(--color-textgrau-hell)',
                  }}>
                    {count}
                  </span>
                </div>
                <Bar value={count} max={maxMedCount} />
              </li>
            ))}
          </ul>

          {/* SRF Sendungen */}
          {srfSendungRanking.length > 0 && (
            <>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--color-textgrau-hell)',
                margin: '0 0 16px',
              }}>
                SRF — nach Sendung
              </p>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                marginBottom: '48px',
              }}>
                {srfSendungRanking.map(([sendung, count]) => (
                  <span key={sendung} style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    color: 'var(--color-textgrau)',
                    background: 'var(--color-bg-paper-warm)',
                    border: '1px solid var(--color-border)',
                    padding: '4px 10px',
                    borderRadius: '2px',
                  }}>
                    {sendung}
                    <span style={{ color: 'var(--color-gold)', marginLeft: '6px', fontSize: '11px' }}>
                      {count}×
                    </span>
                  </span>
                ))}
              </div>
            </>
          )}

          {/* Schwerwiegendste Fälle */}
          <SectionHeading>Schwerwiegendste Fälle</SectionHeading>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {topCases.map((a, i) => (
              <li key={a.slug} style={{
                borderBottom: '1px solid var(--color-border)',
                padding: '20px 0',
                display: 'grid',
                gridTemplateColumns: '24px 1fr',
                gap: '16px',
                alignItems: 'start',
              }}>
                <span style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  color: 'var(--color-textgrau-hell)',
                  paddingTop: '3px',
                  textAlign: 'right',
                }}>
                  {i + 1}
                </span>
                <div>
                  <Link
                    href={`/${a.slug}`}
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '15px',
                      color: 'var(--color-tannengruen)',
                      textDecoration: 'none',
                      display: 'block',
                      marginBottom: '5px',
                      lineHeight: 1.4,
                    }}
                  >
                    {a.title}
                  </Link>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '6px',
                    fontFamily: 'var(--font-body)',
                    fontSize: '11px',
                    color: 'var(--color-textgrau-hell)',
                  }}>
                    <span>{formatDate(a.date)}</span>
                    {a.kritisiertes_medium && <><span>·</span><span>{normalizeMedium(a.kritisiertes_medium)}</span></>}
                    {a.kritik_typ.map(t => (
                      <span key={t} style={{
                        background: 'var(--color-bg-paper-warm)',
                        border: '1px solid var(--color-border)',
                        padding: '1px 6px',
                        fontSize: '10px',
                        borderRadius: '2px',
                      }}>
                        {t}
                      </span>
                    ))}
                  </div>
                  {a.these && (
                    <p style={{
                      fontFamily: 'var(--font-body)',
                      fontStyle: 'italic',
                      fontSize: '13px',
                      color: 'var(--color-textgrau)',
                      margin: 0,
                      lineHeight: 1.55,
                    }}>
                      {a.these}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {hr}

        {/* ═══════════════════════════════════════════════════════════════════
            PILLAR II — KONTEXT
        ════════════════════════════════════════════════════════════════════ */}
        <div id="kontext">
          <PillarLabel n="II" label="Kontext" />
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 500,
            fontSize: 'clamp(22px, 4vw, 30px)',
            color: 'var(--color-tannengruen)',
            margin: '0 0 8px',
            letterSpacing: '-0.01em',
          }}>
            Welche Themen standen dahinter?
          </h2>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontStyle: 'italic',
            fontSize: '15px',
            color: 'var(--color-textgrau)',
            margin: '0 0 48px',
            lineHeight: 1.6,
          }}>
            Die Einzelfälle der Medienkritik sind selten isoliert. Sie verweisen auf
            wiederkehrende strukturelle Themen — Demokratiefragen, Migrationspolitik,
            institutionelle Interessenkonflikte. Diese Übersicht zeigt, was tatsächlich
            auf dem Spiel stand.
          </p>

          {/* Themenlandschaft */}
          <SectionHeading>Themenlandschaft</SectionHeading>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 48px' }}>
            {topThemen.map(([thema, count]) => (
              <li key={thema} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '14px',
                    color: 'var(--color-tannengruen)',
                  }}>
                    {thema}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    color: 'var(--color-textgrau-hell)',
                  }}>
                    {count}×
                  </span>
                </div>
                <Bar value={count} max={maxThemaCount} />
              </li>
            ))}
          </ul>

          {/* Gesetze & Vorlagen */}
          {topGesetze.length > 0 && (
            <>
              <SectionHeading>Gesetze & Vorlagen</SectionHeading>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                color: 'var(--color-textgrau)',
                margin: '0 0 20px',
                lineHeight: 1.6,
              }}>
                Diese demokratischen Prozesse und Rechtstexte wurden in den Analysen
                am häufigsten referenziert — als Massstab für das, was die Medien
                hätten erklären müssen.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '48px' }}>
                {topGesetze.map(([g, count]) => (
                  <span key={g} style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    color: 'var(--color-textgrau)',
                    background: 'var(--color-bg-paper-warm)',
                    border: '1px solid var(--color-border)',
                    padding: '6px 12px',
                    borderRadius: '2px',
                  }}>
                    {g}
                    <span style={{ color: 'var(--color-gold)', marginLeft: '8px', fontSize: '11px' }}>{count}×</span>
                  </span>
                ))}
              </div>
            </>
          )}

          {/* Personen & Institutionen */}
          <SectionHeading>Personen & Institutionen</SectionHeading>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '40px',
            marginBottom: '48px',
          }}>
            <div>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '10px',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--color-textgrau-hell)',
                margin: '0 0 14px',
              }}>
                Personen
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {topPersonen.map(([p, count]) => (
                  <li key={p} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '6px 0',
                    borderBottom: '1px solid var(--color-border)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                  }}>
                    <span style={{ color: 'var(--color-tannengruen)' }}>{p}</span>
                    <span style={{ color: 'var(--color-textgrau-hell)', fontSize: '11px' }}>{count}×</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '10px',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--color-textgrau-hell)',
                margin: '0 0 14px',
              }}>
                Institutionen
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {topInstitutionen.map(([inst, count]) => (
                  <li key={inst} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '6px 0',
                    borderBottom: '1px solid var(--color-border)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                  }}>
                    <span style={{ color: 'var(--color-tannengruen)' }}>{inst}</span>
                    <span style={{ color: 'var(--color-textgrau-hell)', fontSize: '11px' }}>{count}×</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Zeitverlauf */}
          <SectionHeading>Zeitverlauf</SectionHeading>
          <div style={{
            display: 'flex',
            gap: '1px',
            background: 'var(--color-border)',
            border: '1px solid var(--color-border)',
            marginBottom: '48px',
          }}>
            {months.map(([month, count]) => (
              <div key={month} style={{
                flex: 1,
                background: 'var(--color-bg-paper)',
                padding: '20px 16px',
                textAlign: 'center',
              }}>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '24px',
                  fontWeight: 500,
                  color: 'var(--color-tannengruen)',
                  lineHeight: 1,
                  marginBottom: '6px',
                }}>
                  {count}
                </div>
                <div style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '10px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--color-textgrau-hell)',
                }}>
                  {MONTH_NAMES[month] ?? month}
                </div>
              </div>
            ))}
          </div>
        </div>

        {hr}

        {/* ═══════════════════════════════════════════════════════════════════
            PILLAR III — SACHLICHKEIT
        ════════════════════════════════════════════════════════════════════ */}
        <div id="sachlichkeit">
          <PillarLabel n="III" label="Sachlichkeit" />
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 500,
            fontSize: 'clamp(22px, 4vw, 30px)',
            color: 'var(--color-tannengruen)',
            margin: '0 0 8px',
            letterSpacing: '-0.01em',
          }}>
            Wie arbeitet 9min?
          </h2>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontStyle: 'italic',
            fontSize: '15px',
            color: 'var(--color-textgrau)',
            margin: '0 0 32px',
            lineHeight: 1.6,
          }}>
            Transparenz über Methode und Massstäbe.
          </p>

          {[
            {
              title: 'Quellenangabe bei jeder Analyse',
              body: 'Jeder Artikel nennt das kritisierte Medium, den spezifischen Beitrag und — soweit bekannt — Erscheinungsdatum, Format und Redaktion. Kritik ohne Adresse ist keine Kritik.',
            },
            {
              title: 'Feste Fehlertaxonomie',
              body: `Die ${Object.keys(KRITIK_TYP_DEFINITIONS).length} Kritik-Typen sind nicht frei erfunden, sondern entstammen der Forschung zu journalistischen Verzerrungen. Sie werden im Quartal nicht verändert. Das erlaubt Vergleiche über Zeit.`,
            },
            {
              title: 'Schwerestufen nach Massstab',
              body: `Schwere 1 ist ein handwerklicher Fehler. Schwere 2 verzerrt das Bild. Schwere 3 schadet dem demokratischen Diskurs messbar. ${pctSchwere3}% der Analysen im Q2 erreichen Stufe 3 — nicht weil 9min dramatisiert, sondern weil die Fälle es sind.`,
            },
            {
              title: 'Keine Meinungsjournalismus-Falle',
              body: 'Jede Analyse hält Fakten und Bewertung getrennt. Die Zusammenfassung ist neutral formuliert. Die These ist falsifizierbar. 9min zielt darauf, Aussagen zu machen, die sich überprüfen lassen.',
            },
          ].map(({ title, body }) => (
            <div key={title} style={{
              borderLeft: '2px solid var(--color-border)',
              paddingLeft: '20px',
              marginBottom: '28px',
            }}>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontWeight: 400,
                fontSize: '15px',
                color: 'var(--color-tannengruen)',
                margin: '0 0 6px',
                letterSpacing: '-0.005em',
              }}>
                {title}
              </p>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                color: 'var(--color-textgrau)',
                margin: 0,
                lineHeight: 1.65,
              }}>
                {body}
              </p>
            </div>
          ))}

          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            color: 'var(--color-textgrau)',
            margin: '32px 0 0',
            lineHeight: 1.65,
          }}>
            Die methodischen Grundlagen von 9min sind ausführlicher beschrieben in den{' '}
            <Link href="/essays" style={{ color: 'var(--color-tannengruen)', textDecoration: 'underline', textDecorationColor: 'var(--color-border)' }}>
              Essays
            </Link>
            . Die vollständige Medienkritik-Dokumentation findet sich unter{' '}
            <Link href="/medienkritik" style={{ color: 'var(--color-tannengruen)', textDecoration: 'underline', textDecorationColor: 'var(--color-border)' }}>
              Medienkritik
            </Link>.
          </p>
        </div>

      </main>
      <Footer />
    </>
  )
}
