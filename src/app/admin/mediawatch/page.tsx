'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { Draft } from '@/lib/mediawatch/draft'
import { buildXText } from '@/lib/mediawatch/utils'

type Stage = 'input' | 'meta' | 'review'
type InputTab = 'url' | 'manual'

interface ExtractionResult {
  title: string
  markdown: string
  captions: string[]
  related: Array<{ text: string; url?: string }>
  siteName: string
  publishedTime: string
}

function StatusBadge({ status }: { status: Draft['status'] }) {
  const map: Record<Draft['status'], { label: string; cls: string }> = {
    extracted: { label: 'Extrahiert', cls: 'bg-blue-100 text-blue-700' },
    draft: { label: 'Entwurf', cls: 'bg-yellow-100 text-yellow-700' },
    review: { label: 'Review', cls: 'bg-orange-100 text-orange-700' },
    published: { label: 'Publiziert', cls: 'bg-green-100 text-green-700' },
    discarded: { label: 'Verworfen', cls: 'bg-gray-100 text-gray-500' },
  }
  const { label, cls } = map[status] ?? map.draft
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>{label}</span>
  )
}

function VerifyMarkers({ markdown }: { markdown: string }) {
  const matches = [...markdown.matchAll(/\[VERIFIZIEREN\]/g)]
  if (matches.length === 0) return null
  return (
    <div className="bg-yellow-50 border border-yellow-300 rounded p-3 mb-3">
      <p className="text-yellow-800 font-medium text-sm mb-1">
        {matches.length} offene Prüfstelle{matches.length > 1 ? 'n' : ''} [VERIFIZIEREN]
      </p>
      <p className="text-yellow-700 text-xs">
        Bitte alle markierten Stellen vor der Publikation prüfen und ersetzen.
      </p>
    </div>
  )
}

export default function MediaWatchPage() {
  // Stage management
  const [stage, setStage] = useState<Stage>('input')
  const [tab, setTab] = useState<InputTab>('url')

  // Input fields
  const [url, setUrl] = useState('')
  const [manualText, setManualText] = useState('')
  const [manualQuelle, setManualQuelle] = useState('')
  const [manualTitel, setManualTitel] = useState('')
  const [manualDatum, setManualDatum] = useState('')

  // Extraction result
  const [extraction, setExtraction] = useState<ExtractionResult | null>(null)
  const [extractError, setExtractError] = useState('')
  const [extracting, setExtracting] = useState(false)

  // Meta fields (editable after extraction)
  const [metaQuelle, setMetaQuelle] = useState('')
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDatum, setMetaDatum] = useState('')
  const [kontext, setKontext] = useState('')
  const [schwerpunkt, setSchwerpunkt] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  // Critique / draft
  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState('')
  const [currentDraft, setCurrentDraft] = useState<Draft | null>(null)

  // Review editor
  const [editTitle, setEditTitle] = useState('')
  const [editMarkdown, setEditMarkdown] = useState('')
  const [saving, setSaving] = useState(false)
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Publish controls
  const [pubWeb, setPubWeb] = useState(true)
  const [pubX, setPubX] = useState(false)
  const [xText, setXText] = useState('')
  const [publishing, setPublishing] = useState(false)
  const [publishError, setPublishError] = useState('')

  // Draft list
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [loadingDrafts, setLoadingDrafts] = useState(false)

  // X connected?
  const [xConnected] = useState(false) // server-side env can't be read client-side

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

  // Auto-save review edits with debounce
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

  // Rebuild X text when title or markdown changes
  useEffect(() => {
    if (!editTitle || !editMarkdown) return
    const url = currentDraft?.publishedUrl ?? 'https://9min.ch/...'
    setXText(buildXText(editTitle, editMarkdown, url))
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
    setExtraction({
      title: manualTitel,
      markdown: manualText,
      captions: [],
      related: [],
      siteName: manualQuelle,
      publishedTime: manualDatum,
    })
    setMetaTitle(manualTitel)
    setMetaQuelle(manualQuelle)
    setMetaDatum(manualDatum)
    setStage('meta')
  }

  async function handleGenerateCritique() {
    if (!extraction) return
    setGenerating(true)
    setGenerateError('')
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
      const data = await res.json()
      if (!res.ok) { setGenerateError(data.error ?? 'Fehler'); return }
      setCurrentDraft(data)
      setEditTitle(data.title)
      setEditMarkdown(data.markdown)
      setStage('review')
      loadDrafts()
    } catch (e) {
      setGenerateError(e instanceof Error ? e.message : 'Netzwerkfehler')
    } finally {
      setGenerating(false)
    }
  }

  function openDraft(draft: Draft) {
    setCurrentDraft(draft)
    setEditTitle(draft.title)
    setEditMarkdown(draft.markdown)
    setStage('review')
  }

  async function handlePublish() {
    if (!currentDraft) return
    if (!pubWeb && !pubX) { setPublishError('Mindestens ein Publikationsziel wählen.'); return }
    if (!window.confirm(`Wirklich veröffentlichen?\n\nWebsite: ${pubWeb ? 'Ja' : 'Nein'}\nX: ${pubX ? 'Ja' : 'Nein'}`)) return
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

  const inputSection = (
    <div className="space-y-4">
      <div className="flex gap-2 border-b border-[var(--color-border)]">
        {(['url', 'manual'] as InputTab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-[var(--color-tannengruen)] text-[var(--color-tannengruen)]' : 'border-transparent text-[var(--color-textgrau)]'}`}
          >
            {t === 'url' ? 'URL analysieren' : 'Text manuell einfügen'}
          </button>
        ))}
      </div>

      {tab === 'url' && (
        <div className="space-y-3">
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://www.srf.ch/news/..."
            className="w-full border border-[var(--color-border)] rounded px-4 py-3 text-[var(--color-tannengruen)] bg-white focus:outline-none focus:border-[var(--color-tannengruen)]"
            onKeyDown={e => e.key === 'Enter' && handleExtract()}
          />
          {extractError && <p className="text-red-600 text-sm">{extractError}</p>}
          <button
            onClick={handleExtract}
            disabled={!url || extracting}
            className="bg-[var(--color-tannengruen)] text-white px-6 py-2.5 rounded hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {extracting ? 'Analysiere…' : 'Analysieren'}
          </button>
        </div>
      )}

      {tab === 'manual' && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <input value={manualQuelle} onChange={e => setManualQuelle(e.target.value)} placeholder="Quelle (z.B. SRF News)" className="border border-[var(--color-border)] rounded px-3 py-2 text-sm" />
            <input value={manualTitel} onChange={e => setManualTitel(e.target.value)} placeholder="Originaltitel" className="border border-[var(--color-border)] rounded px-3 py-2 text-sm" />
            <input type="date" value={manualDatum} onChange={e => setManualDatum(e.target.value)} className="border border-[var(--color-border)] rounded px-3 py-2 text-sm" />
          </div>
          <textarea
            value={manualText}
            onChange={e => setManualText(e.target.value)}
            placeholder="Artikeltext hier einfügen…"
            rows={12}
            className="w-full border border-[var(--color-border)] rounded px-4 py-3 text-sm font-mono resize-y"
          />
          <button
            onClick={handleManualContinue}
            disabled={!manualText || !manualQuelle || !manualTitel}
            className="bg-[var(--color-tannengruen)] text-white px-6 py-2.5 rounded hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            Weiter
          </button>
        </div>
      )}
    </div>
  )

  const metaSection = extraction && (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs text-[var(--color-textgrau)] mb-1">Quelle</label>
          <input value={metaQuelle} onChange={e => setMetaQuelle(e.target.value)} className="w-full border border-[var(--color-border)] rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs text-[var(--color-textgrau)] mb-1">Originaltitel</label>
          <input value={metaTitle} onChange={e => setMetaTitle(e.target.value)} className="w-full border border-[var(--color-border)] rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs text-[var(--color-textgrau)] mb-1">Datum</label>
          <input type="date" value={metaDatum} onChange={e => setMetaDatum(e.target.value)} className="w-full border border-[var(--color-border)] rounded px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
        <button onClick={() => setShowPreview(p => !p)} className="text-sm text-[var(--color-textgrau)] underline underline-offset-2">
          {showPreview ? 'Vorschau ausblenden' : 'Extraktions-Vorschau anzeigen'}
        </button>
        {showPreview && (
          <div className="mt-3 border border-[var(--color-border)] rounded p-4 space-y-3 text-sm">
            <div>
              <p className="text-xs text-[var(--color-textgrau)] mb-1">Artikeltext (Markdown)</p>
              <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto max-h-48 whitespace-pre-wrap">{extraction.markdown.slice(0, 1000)}{extraction.markdown.length > 1000 ? '\n…' : ''}</pre>
            </div>
            {extraction.captions.length > 0 && (
              <div>
                <p className="text-xs text-[var(--color-textgrau)] mb-1">Bildbeschriftungen</p>
                <ul className="text-xs space-y-1">{extraction.captions.map((c, i) => <li key={i} className="text-gray-700">— {c}</li>)}</ul>
              </div>
            )}
            {extraction.related.length > 0 && (
              <div>
                <p className="text-xs text-[var(--color-textgrau)] mb-1">Verwandte Artikel</p>
                <ul className="text-xs space-y-1">{extraction.related.map((r, i) => <li key={i} className="text-gray-700">— {r.text}</li>)}</ul>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-[var(--color-textgrau)] mb-1">Kontext (optional)</label>
          <textarea value={kontext} onChange={e => setKontext(e.target.value)} rows={3} placeholder="Verifizierte Hintergrundinformationen…" className="w-full border border-[var(--color-border)] rounded px-3 py-2 text-sm resize-none" />
        </div>
        <div>
          <label className="block text-xs text-[var(--color-textgrau)] mb-1">Schwerpunkt (optional)</label>
          <textarea value={schwerpunkt} onChange={e => setSchwerpunkt(e.target.value)} rows={3} placeholder="Worauf soll die Kritik besonders eingehen?" className="w-full border border-[var(--color-border)] rounded px-3 py-2 text-sm resize-none" />
        </div>
      </div>

      {generateError && <p className="text-red-600 text-sm">{generateError}</p>}
      <button
        onClick={handleGenerateCritique}
        disabled={generating}
        className="bg-[var(--color-gold)] text-white px-6 py-2.5 rounded hover:opacity-90 disabled:opacity-50 transition-opacity font-medium"
      >
        {generating ? 'Kritik wird generiert… (ca. 60 s)' : 'Kritik generieren'}
      </button>
    </div>
  )

  const reviewSection = currentDraft && (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StatusBadge status={currentDraft.status} />
          {saving && <span className="text-xs text-[var(--color-textgrau)]">Speichert…</span>}
        </div>
        {currentDraft.publishedUrl && (
          <a href={currentDraft.publishedUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--color-tannengruen)] underline">{currentDraft.publishedUrl}</a>
        )}
      </div>

      <div>
        <label className="block text-xs text-[var(--color-textgrau)] mb-1">Titel</label>
        <input
          value={editTitle}
          onChange={e => setEditTitle(e.target.value)}
          className="w-full border border-[var(--color-border)] rounded px-3 py-2 font-medium text-[var(--color-tannengruen)]"
        />
      </div>

      <VerifyMarkers markdown={editMarkdown} />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-[var(--color-textgrau)] mb-1">Markdown</label>
          <textarea
            value={editMarkdown}
            onChange={e => setEditMarkdown(e.target.value)}
            rows={28}
            className="w-full border border-[var(--color-border)] rounded px-3 py-2 text-sm font-mono resize-y"
          />
        </div>
        <div>
          <label className="block text-xs text-[var(--color-textgrau)] mb-1">Vorschau</label>
          <div
            className="prose-9min border border-[var(--color-border)] rounded px-4 py-3 overflow-auto max-h-[672px] text-sm"
            dangerouslySetInnerHTML={{ __html: markdownToHtml(editMarkdown) }}
          />
        </div>
      </div>

      {/* Publish controls */}
      <div className="border border-[var(--color-border)] rounded p-4 space-y-4">
        <h3 className="font-medium text-[var(--color-tannengruen)]">Veröffentlichen</h3>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={pubWeb} onChange={e => setPubWeb(e.target.checked)} className="w-4 h-4" />
            <span className="text-sm">Website</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={pubX} onChange={e => setPubX(e.target.checked)} className="w-4 h-4" />
            <span className="text-sm">X (Twitter)</span>
          </label>
        </div>

        {pubX && (
          <div className="space-y-2">
            {!xConnected && (
              <a
                href="/api/mediawatch/xauth"
                className="inline-block text-sm text-[var(--color-tannengruen)] underline underline-offset-2"
              >
                X verbinden →
              </a>
            )}
            <div>
              <label className="block text-xs text-[var(--color-textgrau)] mb-1">
                X-Text ({xText.length}/280)
              </label>
              <textarea
                value={xText}
                onChange={e => setXText(e.target.value.slice(0, 280))}
                rows={3}
                className={`w-full border rounded px-3 py-2 text-sm resize-none ${xText.length >= 280 ? 'border-red-400' : 'border-[var(--color-border)]'}`}
              />
              {xText.length >= 280 && <p className="text-red-500 text-xs">Zeichenlimit erreicht.</p>}
            </div>
          </div>
        )}

        {publishError && <p className="text-red-600 text-sm">{publishError}</p>}

        <button
          onClick={handlePublish}
          disabled={publishing || currentDraft.status === 'published'}
          className="bg-[var(--color-tannengruen)] text-white px-6 py-2.5 rounded hover:opacity-90 disabled:opacity-50 transition-opacity font-medium"
        >
          {publishing ? 'Wird veröffentlicht…' : currentDraft.status === 'published' ? 'Bereits publiziert' : 'Veröffentlichen'}
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[var(--color-bg-paper)] flex">
      {/* Sidebar */}
      <aside className="w-72 border-r border-[var(--color-border)] flex flex-col shrink-0">
        <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
          <h2 className="font-medium text-[var(--color-tannengruen)]">Media Watch</h2>
          <button
            onClick={() => { setStage('input'); setCurrentDraft(null); setExtraction(null); setUrl(''); }}
            className="text-xs text-[var(--color-textgrau)] hover:text-[var(--color-tannengruen)]"
          >
            + Neu
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loadingDrafts && <p className="p-4 text-xs text-[var(--color-textgrau)]">Lädt…</p>}
          {drafts.map(d => (
            <button
              key={d.id}
              onClick={() => openDraft(d)}
              className={`w-full text-left p-3 border-b border-[var(--color-border)] hover:bg-gray-50 transition-colors ${currentDraft?.id === d.id ? 'bg-gray-50' : ''}`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="text-sm text-[var(--color-tannengruen)] font-medium line-clamp-2 leading-snug">{d.title || d.originalTitle}</span>
                <StatusBadge status={d.status} />
              </div>
              <p className="text-xs text-[var(--color-textgrau)]">{d.quelle} · {new Date(d.updatedAt).toLocaleDateString('de-CH')}</p>
            </button>
          ))}
        </div>
        <div className="p-3 border-t border-[var(--color-border)]">
          <form action="/api/mediawatch/auth" method="post" onSubmit={async e => { e.preventDefault(); await fetch('/api/mediawatch/auth', { method: 'DELETE' }); location.href = '/admin/mediawatch/login' }}>
            <button type="submit" className="text-xs text-[var(--color-textgrau)] hover:text-[var(--color-tannengruen)]">Abmelden</button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-8 max-w-4xl">
        <div className="mb-6 flex gap-3 items-center text-sm text-[var(--color-textgrau)]">
          <button onClick={() => setStage('input')} className={stage === 'input' ? 'text-[var(--color-tannengruen)] font-medium' : 'hover:text-[var(--color-tannengruen)]'}>Eingabe</button>
          <span>›</span>
          <button onClick={() => extraction && setStage('meta')} disabled={!extraction} className={`${stage === 'meta' ? 'text-[var(--color-tannengruen)] font-medium' : 'hover:text-[var(--color-tannengruen)]'} disabled:opacity-40`}>Metadaten &amp; Generierung</button>
          <span>›</span>
          <span className={stage === 'review' ? 'text-[var(--color-tannengruen)] font-medium' : 'opacity-40'}>Review</span>
        </div>

        {stage === 'input' && inputSection}
        {stage === 'meta' && metaSection}
        {stage === 'review' && reviewSection}
      </main>
    </div>
  )
}

// Minimal markdown-to-HTML for the preview pane (no MDXRemote needed since we're client-side)
function markdownToHtml(md: string): string {
  return md
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/^---$/gm, '<hr />')
    .replace(/\[VERIFIZIEREN\]/g, '<mark style="background:yellow;padding:1px 4px">[VERIFIZIEREN]</mark>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>')
    .replace(/<p><h/g, '<h').replace(/<\/h([123])><\/p>/g, '</h$1>')
    .replace(/<p><hr \/><\/p>/g, '<hr />')
}
