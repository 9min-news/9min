'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { Draft } from '@/lib/mediawatch/draft'
import { buildXText } from '@/lib/mediawatch/utils'

const C = {
  green: '#1A2E1A',
  greenLight: '#4A5C4A',
  gold: '#D4A847',
  paper: '#FAFAF7',
  border: '#D4D0C8',
  bg: '#F4F1EB',
  white: '#fff',
  red: '#dc2626',
  yellow50: '#fefce8',
  yellow300: '#fde047',
  yellow800: '#854d0e',
  yellow700: '#a16207',
  gray50: '#f9fafb',
}

const S = {
  input: {
    border: `1px solid ${C.border}`,
    borderRadius: '6px',
    padding: '8px 12px',
    fontSize: '14px',
    color: C.green,
    background: C.white,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box' as const,
    fontFamily: 'system-ui, sans-serif',
  },
  textarea: {
    border: `1px solid ${C.border}`,
    borderRadius: '6px',
    padding: '8px 12px',
    fontSize: '13px',
    color: C.green,
    background: C.white,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box' as const,
    resize: 'vertical' as const,
    fontFamily: 'ui-monospace, "Cascadia Code", monospace',
  },
  btn: (color = C.green, disabled = false) => ({
    background: disabled ? C.greenLight : color,
    color: C.white,
    border: 'none',
    borderRadius: '6px',
    padding: '9px 18px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    fontFamily: 'system-ui, sans-serif',
  } as React.CSSProperties),
  btnOutline: (active = false) => ({
    background: active ? C.bg : 'transparent',
    color: C.greenLight,
    border: `1px solid ${C.border}`,
    borderRadius: '6px',
    padding: '7px 14px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'system-ui, sans-serif',
  } as React.CSSProperties),
  label: { display: 'block', fontSize: '11px', color: C.greenLight, marginBottom: '4px' } as React.CSSProperties,
}

const PROSE_STYLES = `
  .mw-prose { font-family: Georgia, 'Times New Roman', serif; color: #1A2E1A; line-height: 1.8; font-size: 17px; }
  .mw-prose .mw-h1 { font-family: system-ui, -apple-system, sans-serif; font-size: 26px; font-weight: 700; line-height: 1.2; margin: 0 0 24px; letter-spacing: -0.3px; color: #1A2E1A; }
  .mw-prose .mw-h2 { font-family: system-ui, -apple-system, sans-serif; font-size: 17px; font-weight: 600; margin: 36px 0 10px; border-top: 2px solid #D4A847; padding-top: 10px; color: #1A2E1A; letter-spacing: -0.1px; }
  .mw-prose .mw-h3 { font-family: system-ui, -apple-system, sans-serif; font-size: 12px; font-weight: 600; margin: 28px 0 6px; text-transform: uppercase; letter-spacing: 0.8px; color: #4A5C4A; }
  .mw-prose .mw-p { margin: 0 0 18px; }
  .mw-prose .mw-p:last-child { margin-bottom: 0; }
  .mw-prose .mw-hr { border: none; border-top: 1px solid #D4D0C8; margin: 32px 0; }
  .mw-prose a { color: #1A2E1A; text-decoration: underline; text-decoration-color: #D4A847; text-underline-offset: 3px; }
  .mw-prose strong { font-weight: 700; }
  .mw-prose em { font-style: italic; }
  .mw-prose .mw-verify { background: #fde047; color: #854d0e; padding: 1px 6px; border-radius: 3px; font-size: 0.82em; font-family: system-ui, sans-serif; font-weight: 700; letter-spacing: 0.2px; }
  @keyframes mw-pulse { 0%,100%{opacity:1} 50%{opacity:0.2} }
  .mw-dot { animation: mw-pulse 1.4s ease-in-out infinite; }
`

type Stage = 'input' | 'meta' | 'review'
type InputTab = 'url' | 'manual'
type ViewMode = 'read' | 'edit'

interface ExtractionResult {
  title: string
  markdown: string
  captions: string[]
  related: Array<{ text: string; url?: string }>
  siteName: string
  publishedTime: string
}

function StatusBadge({ status }: { status: Draft['status'] }) {
  const map: Record<Draft['status'], { label: string; bg: string; color: string }> = {
    extracted: { label: 'Extrahiert', bg: '#dbeafe', color: '#1d4ed8' },
    draft: { label: 'Entwurf', bg: '#fef9c3', color: '#a16207' },
    review: { label: 'Review', bg: '#ffedd5', color: '#c2410c' },
    published: { label: 'Publiziert', bg: '#dcfce7', color: '#166534' },
    discarded: { label: 'Verworfen', bg: '#f3f4f6', color: '#6b7280' },
  }
  const { label, bg, color } = map[status] ?? map.draft
  return (
    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '999px', fontWeight: 500, background: bg, color, whiteSpace: 'nowrap' }}>
      {label}
    </span>
  )
}

function VerifyMarkers({ markdown }: { markdown: string }) {
  const count = (markdown.match(/\[VERIFIZIEREN\]/g) ?? []).length
  if (count === 0) return null
  return (
    <div style={{ background: C.yellow50, border: `1px solid ${C.yellow300}`, borderRadius: '6px', padding: '10px 14px' }}>
      <p style={{ color: C.yellow800, fontWeight: 600, fontSize: '13px', margin: '0 0 4px' }}>
        {count} offene Prüfstelle{count > 1 ? 'n' : ''} [VERIFIZIEREN]
      </p>
      <p style={{ color: C.yellow700, fontSize: '12px', margin: 0 }}>
        Alle markierten Stellen vor der Publikation prüfen und ersetzen.
      </p>
    </div>
  )
}

export default function MediaWatchPage() {
  const [stage, setStage] = useState<Stage>('input')
  const [tab, setTab] = useState<InputTab>('url')
  const [viewMode, setViewMode] = useState<ViewMode>('read')
  const [copied, setCopied] = useState(false)

  const [url, setUrl] = useState('')
  const [manualText, setManualText] = useState('')
  const [manualQuelle, setManualQuelle] = useState('')
  const [manualTitel, setManualTitel] = useState('')
  const [manualDatum, setManualDatum] = useState('')

  const [extraction, setExtraction] = useState<ExtractionResult | null>(null)
  const [extractError, setExtractError] = useState('')
  const [extracting, setExtracting] = useState(false)

  const [metaQuelle, setMetaQuelle] = useState('')
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDatum, setMetaDatum] = useState('')
  const [kontext, setKontext] = useState('')
  const [schwerpunkt, setSchwerpunkt] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState('')
  const [currentDraft, setCurrentDraft] = useState<Draft | null>(null)

  const [editTitle, setEditTitle] = useState('')
  const [editMarkdown, setEditMarkdown] = useState('')
  const [saving, setSaving] = useState(false)
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [pubWeb, setPubWeb] = useState(true)
  const [pubX, setPubX] = useState(false)
  const [xText, setXText] = useState('')
  const [publishing, setPublishing] = useState(false)
  const [publishError, setPublishError] = useState('')

  const [drafts, setDrafts] = useState<Draft[]>([])
  const [loadingDrafts, setLoadingDrafts] = useState(false)

  const loadDrafts = useCallback(async () => {
    setLoadingDrafts(true)
    try {
      const res = await fetch('/api/mediawatch/drafts')
      if (res.ok) setDrafts(await res.json())
    } finally {
      setLoadingDrafts(false)
    }
  }, [])

  useEffect(() => { loadDrafts() }, [loadDrafts])

  useEffect(() => {
    if (!currentDraft || stage !== 'review') return
    if (saveTimeout.current) clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(async () => {
      setSaving(true)
      try {
        await fetch(`/api/mediawatch/drafts/${currentDraft.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: editTitle, markdown: editMarkdown, status: 'review' }),
        })
        setCurrentDraft(d => d ? { ...d, title: editTitle, markdown: editMarkdown, status: 'review' } : d)
      } finally {
        setSaving(false)
      }
    }, 1500)
  }, [editTitle, editMarkdown, currentDraft, stage])

  useEffect(() => {
    if (!editTitle || !editMarkdown) return
    const u = currentDraft?.publishedUrl ?? 'https://9min.ch/...'
    setXText(buildXText(editTitle, editMarkdown, u))
  }, [editTitle, editMarkdown, currentDraft?.publishedUrl])

  async function handleExtract() {
    setExtracting(true)
    setExtractError('')
    try {
      const res = await fetch('/api/mediawatch/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      if (!res.ok) { setExtractError(data.error ?? 'Fehler'); return }
      setExtraction(data)
      setMetaTitle(data.title)
      setMetaQuelle(data.siteName)
      setMetaDatum(data.publishedTime ? new Date(data.publishedTime).toISOString().slice(0, 10) : '')
      setStage('meta')
    } catch (e) {
      setExtractError(e instanceof Error ? e.message : 'Netzwerkfehler')
    } finally {
      setExtracting(false)
    }
  }

  function handleManualContinue() {
    setExtraction({ title: manualTitel, markdown: manualText, captions: [], related: [], siteName: manualQuelle, publishedTime: manualDatum })
    setMetaTitle(manualTitel)
    setMetaQuelle(manualQuelle)
    setMetaDatum(manualDatum)
    setStage('meta')
  }

  async function handleGenerateCritique() {
    if (!extraction) return
    setGenerating(true)
    setGenerateError('')
    setViewMode('read')
    setCopied(false)
    setEditMarkdown('')
    setEditTitle(metaTitle)
    setStage('review')

    try {
      const res = await fetch('/api/mediawatch/critique', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draftId: currentDraft?.id,
          sourceUrl: url,
          markdown: extraction.markdown,
          quelle: metaQuelle,
          originalTitle: metaTitle,
          publishedTime: extraction.publishedTime,
          captions: extraction.captions,
          related: extraction.related,
          kontext: kontext || undefined,
          schwerpunkt: schwerpunkt || undefined,
        }),
      })

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({ error: 'Fehler' }))
        setGenerateError(data.error ?? 'Fehler')
        return
      }

      const reader = res.body.getReader()
      const dec = new TextDecoder()
      let buf = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += dec.decode(value, { stream: true })
        const lines = buf.split('\n')
        buf = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const event = JSON.parse(line.slice(6))
            if (event.error) { setGenerateError(event.error); return }
            if (event.chunk) setEditMarkdown(prev => prev + event.chunk)
            if (event.done && event.draft) {
              setCurrentDraft(event.draft)
              setEditTitle(event.draft.title)
              loadDrafts()
            }
          } catch { /* ignore malformed SSE lines */ }
        }
      }
    } catch (e) {
      setGenerateError(e instanceof Error ? e.message : 'Netzwerkfehler')
    } finally {
      setGenerating(false)
    }
  }

  async function handleDeleteDraft(id: string) {
    if (!window.confirm('Entwurf löschen?')) return
    await fetch(`/api/mediawatch/drafts/${id}`, { method: 'DELETE' })
    setDrafts(prev => prev.filter(d => d.id !== id))
    if (currentDraft?.id === id) {
      setCurrentDraft(null)
      setStage('input')
      setExtraction(null)
    }
  }

  function openDraft(draft: Draft) {
    setCurrentDraft(draft)
    setEditTitle(draft.title)
    setEditMarkdown(draft.markdown)
    setViewMode('read')
    setCopied(false)
    setStage('review')
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(editMarkdown)
    } catch {
      const el = document.createElement('textarea')
      el.value = editMarkdown
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handlePublish() {
    if (!currentDraft) return
    if (!pubWeb && !pubX) { setPublishError('Mindestens ein Publikationsziel wählen.'); return }
    if (!window.confirm(`Wirklich veröffentlichen?\nWebsite: ${pubWeb ? 'Ja' : 'Nein'}\nX: ${pubX ? 'Ja' : 'Nein'}`)) return
    setPublishing(true)
    setPublishError('')
    try {
      const res = await fetch(`/api/mediawatch/drafts/${currentDraft.id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ web: pubWeb, x: pubX, xText: pubX ? xText : undefined }),
      })
      const data = await res.json()
      if (!res.ok) { setPublishError(data.error ?? 'Fehler'); return }
      setCurrentDraft(data)
      loadDrafts()
      alert(`Publiziert!${data.publishedUrl ? `\n${data.publishedUrl}` : ''}`)
    } catch (e) {
      setPublishError(e instanceof Error ? e.message : 'Netzwerkfehler')
    } finally {
      setPublishing(false)
    }
  }

  const tabStyle = (active: boolean) => ({
    paddingBottom: '8px',
    paddingLeft: '2px',
    paddingRight: '2px',
    fontSize: '13px',
    fontWeight: active ? 600 : 400,
    color: active ? C.green : C.greenLight,
    background: 'none',
    border: 'none',
    borderBottom: `2px solid ${active ? C.green : 'transparent'}`,
    cursor: 'pointer',
    fontFamily: 'system-ui, sans-serif',
  } as React.CSSProperties)

  const inputSection = (
    <div>
      <div style={{ display: 'flex', gap: '16px', borderBottom: `1px solid ${C.border}`, marginBottom: '16px' }}>
        <button style={tabStyle(tab === 'url')} onClick={() => setTab('url')}>URL analysieren</button>
        <button style={tabStyle(tab === 'manual')} onClick={() => setTab('manual')}>Text manuell einfügen</button>
      </div>

      {tab === 'url' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://www.srf.ch/news/…"
            style={S.input}
            onKeyDown={e => e.key === 'Enter' && handleExtract()}
          />
          {extractError && <p style={{ color: C.red, fontSize: '13px', margin: 0 }}>{extractError}</p>}
          <div>
            <button onClick={handleExtract} disabled={!url || extracting} style={S.btn(C.green, !url || extracting)}>
              {extracting ? 'Analysiere…' : 'Analysieren'}
            </button>
          </div>
        </div>
      )}

      {tab === 'manual' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <input value={manualQuelle} onChange={e => setManualQuelle(e.target.value)} placeholder="Quelle (z.B. SRF News)" style={S.input} />
            <input value={manualTitel} onChange={e => setManualTitel(e.target.value)} placeholder="Originaltitel" style={S.input} />
            <input type="date" value={manualDatum} onChange={e => setManualDatum(e.target.value)} style={S.input} />
          </div>
          <textarea
            value={manualText}
            onChange={e => setManualText(e.target.value)}
            placeholder="Artikeltext hier einfügen…"
            rows={12}
            style={S.textarea}
          />
          <div>
            <button onClick={handleManualContinue} disabled={!manualText || !manualQuelle || !manualTitel} style={S.btn(C.green, !manualText || !manualQuelle || !manualTitel)}>
              Weiter
            </button>
          </div>
        </div>
      )}
    </div>
  )

  const metaSection = extraction && (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
        <div>
          <label style={S.label}>Quelle</label>
          <input value={metaQuelle} onChange={e => setMetaQuelle(e.target.value)} style={S.input} />
        </div>
        <div>
          <label style={S.label}>Originaltitel</label>
          <input value={metaTitle} onChange={e => setMetaTitle(e.target.value)} style={S.input} />
        </div>
        <div>
          <label style={S.label}>Datum</label>
          <input type="date" value={metaDatum} onChange={e => setMetaDatum(e.target.value)} style={S.input} />
        </div>
      </div>

      <div>
        <button onClick={() => setShowPreview(p => !p)} style={{ background: 'none', border: 'none', fontSize: '13px', color: C.greenLight, textDecoration: 'underline', cursor: 'pointer', padding: 0, fontFamily: 'system-ui, sans-serif' }}>
          {showPreview ? 'Vorschau ausblenden' : 'Extraktions-Vorschau anzeigen'}
        </button>
        {showPreview && (
          <div style={{ marginTop: '10px', border: `1px solid ${C.border}`, borderRadius: '6px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <p style={{ ...S.label, marginBottom: '6px' }}>Artikeltext (Markdown)</p>
              <pre style={{ fontSize: '12px', background: C.gray50, padding: '10px', borderRadius: '4px', overflow: 'auto', maxHeight: '200px', whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'ui-monospace, monospace' }}>
                {extraction.markdown.slice(0, 1200)}{extraction.markdown.length > 1200 ? '\n…' : ''}
              </pre>
            </div>
            {extraction.captions.length > 0 && (
              <div>
                <p style={{ ...S.label, marginBottom: '4px' }}>Bildbeschriftungen</p>
                {extraction.captions.map((c, i) => <p key={i} style={{ fontSize: '12px', margin: '2px 0', color: C.greenLight }}>— {c}</p>)}
              </div>
            )}
            {extraction.related.length > 0 && (
              <div>
                <p style={{ ...S.label, marginBottom: '4px' }}>Verwandte Artikel</p>
                {extraction.related.map((r, i) => <p key={i} style={{ fontSize: '12px', margin: '2px 0', color: C.greenLight }}>— {r.text}</p>)}
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div>
          <label style={S.label}>Kontext (optional)</label>
          <textarea value={kontext} onChange={e => setKontext(e.target.value)} rows={3} placeholder="Verifizierte Hintergrundinformationen…" style={{ ...S.textarea, resize: 'none' }} />
        </div>
        <div>
          <label style={S.label}>Schwerpunkt (optional)</label>
          <textarea value={schwerpunkt} onChange={e => setSchwerpunkt(e.target.value)} rows={3} placeholder="Worauf soll die Kritik eingehen?" style={{ ...S.textarea, resize: 'none' }} />
        </div>
      </div>

      {generateError && <p style={{ color: C.red, fontSize: '13px', margin: 0 }}>{generateError}</p>}
      <div>
        <button onClick={handleGenerateCritique} disabled={generating} style={S.btn(C.gold, generating)}>
          {generating ? 'Generiert…' : 'Kritik generieren'}
        </button>
      </div>
    </div>
  )

  // Shared publish panel — shown in both read and edit view once draft is saved
  const publishPanel = currentDraft && (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', background: C.white, marginTop: '8px' }}>
      <p style={{ fontSize: '14px', fontWeight: 600, color: C.green, margin: 0 }}>Veröffentlichen</p>
      <div style={{ display: 'flex', gap: '24px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontFamily: 'system-ui, sans-serif' }}>
          <input type="checkbox" checked={pubWeb} onChange={e => setPubWeb(e.target.checked)} style={{ width: '16px', height: '16px' }} />
          Website
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontFamily: 'system-ui, sans-serif' }}>
          <input type="checkbox" checked={pubX} onChange={e => setPubX(e.target.checked)} style={{ width: '16px', height: '16px' }} />
          X (Twitter)
        </label>
      </div>
      {pubX && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <a href="/api/mediawatch/xauth" style={{ fontSize: '13px', color: C.green, fontFamily: 'system-ui, sans-serif' }}>X verbinden →</a>
          <div>
            <label style={S.label}>X-Text ({xText.length}/280)</label>
            <textarea
              value={xText}
              onChange={e => setXText(e.target.value.slice(0, 280))}
              rows={3}
              style={{ ...S.textarea, fontFamily: 'system-ui, sans-serif', borderColor: xText.length >= 280 ? C.red : C.border, resize: 'none' }}
            />
            {xText.length >= 280 && <p style={{ color: C.red, fontSize: '12px', margin: '2px 0 0', fontFamily: 'system-ui, sans-serif' }}>Zeichenlimit erreicht.</p>}
          </div>
        </div>
      )}
      {publishError && <p style={{ color: C.red, fontSize: '13px', margin: 0, fontFamily: 'system-ui, sans-serif' }}>{publishError}</p>}
      <div>
        <button
          onClick={handlePublish}
          disabled={publishing || currentDraft.status === 'published'}
          style={S.btn(C.green, publishing || currentDraft.status === 'published')}
        >
          {publishing ? 'Wird veröffentlicht…' : currentDraft.status === 'published' ? 'Bereits publiziert' : 'Veröffentlichen'}
        </button>
      </div>
    </div>
  )

  // Toolbar shown in both read and edit modes
  const reviewToolbar = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {currentDraft && <StatusBadge status={currentDraft.status} />}
        {saving && <span style={{ fontSize: '12px', color: C.greenLight, fontFamily: 'system-ui, sans-serif' }}>Speichert…</span>}
        {currentDraft?.publishedUrl && (
          <a href={currentDraft.publishedUrl} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: '12px', color: C.greenLight, textDecoration: 'none', fontFamily: 'system-ui, sans-serif' }}>
            {currentDraft.publishedUrl}
          </a>
        )}
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={handleCopy}
          style={{
            background: copied ? '#dcfce7' : C.bg,
            color: copied ? '#166534' : C.greenLight,
            border: `1px solid ${copied ? '#86efac' : C.border}`,
            borderRadius: '6px', padding: '7px 14px',
            fontSize: '13px', fontWeight: 500, cursor: 'pointer',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          {copied ? 'Kopiert! ✓' : 'Kopieren'}
        </button>
        {viewMode === 'read'
          ? <button onClick={() => setViewMode('edit')} style={S.btnOutline()}>Bearbeiten</button>
          : <button onClick={() => setViewMode('read')} style={S.btn(C.green)}>← Leseansicht</button>
        }
      </div>
    </div>
  )

  const reviewSection = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* ── STREAMING VIEW ── */}
      {generating && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <span className="mw-dot" style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: C.gold, flexShrink: 0 }} />
            <span style={{ fontSize: '13px', color: C.greenLight, fontFamily: 'system-ui, sans-serif' }}>Kritik wird generiert…</span>
          </div>
          {generateError && <p style={{ color: C.red, fontSize: '13px', marginBottom: '16px', fontFamily: 'system-ui, sans-serif' }}>{generateError}</p>}
          <div
            className="mw-prose"
            style={{ maxWidth: '680px', minHeight: '120px' }}
            dangerouslySetInnerHTML={{ __html: markdownToHtml(editMarkdown) }}
          />
        </div>
      )}

      {/* ── READ VIEW ── */}
      {!generating && viewMode === 'read' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {reviewToolbar}
          {generateError && <p style={{ color: C.red, fontSize: '13px', margin: 0, fontFamily: 'system-ui, sans-serif' }}>{generateError}</p>}
          <VerifyMarkers markdown={editMarkdown} />
          <div
            className="mw-prose"
            style={{ maxWidth: '680px' }}
            dangerouslySetInnerHTML={{ __html: markdownToHtml(editMarkdown) }}
          />
          {currentDraft && publishPanel}
        </div>
      )}

      {/* ── EDIT VIEW ── */}
      {!generating && viewMode === 'edit' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {reviewToolbar}
          {generateError && <p style={{ color: C.red, fontSize: '13px', margin: 0, fontFamily: 'system-ui, sans-serif' }}>{generateError}</p>}
          <div>
            <label style={S.label}>Titel</label>
            <input value={editTitle} onChange={e => setEditTitle(e.target.value)} style={{ ...S.input, fontWeight: 600, fontSize: '15px' }} />
          </div>
          <VerifyMarkers markdown={editMarkdown} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={S.label}>Markdown</label>
              <textarea value={editMarkdown} onChange={e => setEditMarkdown(e.target.value)} rows={28} style={S.textarea} />
            </div>
            <div>
              <label style={S.label}>Vorschau</label>
              <div
                className="mw-prose"
                style={{ border: `1px solid ${C.border}`, borderRadius: '6px', padding: '20px', overflow: 'auto', maxHeight: '672px' }}
                dangerouslySetInnerHTML={{ __html: markdownToHtml(editMarkdown) }}
              />
            </div>
          </div>
          {currentDraft && publishPanel}
        </div>
      )}

    </div>
  )

  return (
    <>
      <style>{PROSE_STYLES}</style>
      <div style={{ minHeight: '100vh', background: C.paper, display: 'flex', fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '14px', color: C.green }}>
        {/* Sidebar */}
        <aside style={{ width: '260px', borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', flexShrink: 0, background: C.white }}>
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 600, fontSize: '14px', color: C.green }}>Media Watch</span>
            <button
              onClick={() => { setStage('input'); setCurrentDraft(null); setExtraction(null); setUrl('') }}
              style={{ fontSize: '12px', color: C.greenLight, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'system-ui, sans-serif' }}
            >
              + Neu
            </button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loadingDrafts && <p style={{ padding: '12px 16px', fontSize: '12px', color: C.greenLight }}>Lädt…</p>}
            {drafts.map(d => (
              <div key={d.id} style={{ display: 'flex', alignItems: 'stretch', borderBottom: `1px solid ${C.border}`, background: currentDraft?.id === d.id ? C.bg : 'transparent' }}>
                <button
                  onClick={() => openDraft(d)}
                  style={{
                    flex: 1, textAlign: 'left', padding: '10px 16px',
                    background: 'transparent', border: 'none',
                    cursor: 'pointer', fontFamily: 'system-ui, sans-serif', minWidth: 0,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '3px' }}>
                    <span style={{ fontSize: '12px', color: C.green, fontWeight: 500, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {d.title || d.originalTitle}
                    </span>
                    <StatusBadge status={d.status} />
                  </div>
                  <p style={{ fontSize: '11px', color: C.greenLight, margin: 0 }}>{d.quelle} · {new Date(d.updatedAt).toLocaleDateString('de-CH')}</p>
                </button>
                <button
                  onClick={() => handleDeleteDraft(d.id)}
                  title="Löschen"
                  style={{
                    background: 'none', border: 'none', borderLeft: `1px solid ${C.border}`,
                    cursor: 'pointer', color: C.greenLight, padding: '0 10px',
                    fontSize: '16px', lineHeight: 1, flexShrink: 0,
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div style={{ padding: '10px 16px', borderTop: `1px solid ${C.border}` }}>
            <button
              onClick={async () => { await fetch('/api/mediawatch/auth', { method: 'DELETE' }); location.href = '/admin/mediawatch/login' }}
              style={{ fontSize: '12px', color: C.greenLight, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'system-ui, sans-serif' }}
            >
              Abmelden
            </button>
          </div>
        </aside>

        {/* Main */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '32px', maxWidth: '960px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '12px', color: C.greenLight, marginBottom: '24px' }}>
            <button onClick={() => setStage('input')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: stage === 'input' ? C.green : C.greenLight, fontWeight: stage === 'input' ? 600 : 400, fontFamily: 'system-ui, sans-serif', fontSize: '12px' }}>Eingabe</button>
            <span>›</span>
            <button onClick={() => extraction && setStage('meta')} disabled={!extraction} style={{ background: 'none', border: 'none', cursor: extraction ? 'pointer' : 'default', color: stage === 'meta' ? C.green : C.greenLight, fontWeight: stage === 'meta' ? 600 : 400, opacity: extraction ? 1 : 0.4, fontFamily: 'system-ui, sans-serif', fontSize: '12px' }}>Metadaten &amp; Generierung</button>
            <span>›</span>
            <span style={{ color: stage === 'review' ? C.green : C.greenLight, fontWeight: stage === 'review' ? 600 : 400, opacity: stage === 'review' ? 1 : 0.4 }}>Review</span>
          </div>

          {stage === 'input' && inputSection}
          {stage === 'meta' && metaSection}
          {stage === 'review' && reviewSection}
        </main>
      </div>
    </>
  )
}

function markdownToHtml(md: string): string {
  const escape = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  const inline = (s: string) =>
    escape(s)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/\[VERIFIZIEREN\]/g, '<mark class="mw-verify">[VERIFIZIEREN]</mark>')

  const lines = md.split('\n')
  const out: string[] = []
  let para: string[] = []

  const flushPara = () => {
    if (para.length) {
      out.push(`<p class="mw-p">${para.join(' ')}</p>`)
      para = []
    }
  }

  for (const raw of lines) {
    const line = raw.trimEnd()
    if (line.startsWith('# '))        { flushPara(); out.push(`<h1 class="mw-h1">${inline(line.slice(2))}</h1>`) }
    else if (line.startsWith('## '))  { flushPara(); out.push(`<h2 class="mw-h2">${inline(line.slice(3))}</h2>`) }
    else if (line.startsWith('### ')) { flushPara(); out.push(`<h3 class="mw-h3">${inline(line.slice(4))}</h3>`) }
    else if (line === '---')           { flushPara(); out.push('<hr class="mw-hr" />') }
    else if (line === '')              { flushPara() }
    else                               { para.push(inline(line)) }
  }
  flushPara()
  return out.join('\n')
}
