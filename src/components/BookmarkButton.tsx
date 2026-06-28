'use client'

import { useState, useEffect } from 'react'

interface BookmarkButtonProps {
  slug: string
}

export function BookmarkButton({ slug }: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    fetch('/api/user/bookmark')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data.bookmarks)) {
          setBookmarked(data.bookmarks.includes(slug))
        }
        setChecked(true)
      })
      .catch(() => setChecked(true))
  }, [slug])

  // Don't show until we know auth state
  if (!checked) return null

  async function toggle() {
    setLoading(true)
    try {
      const res = await fetch('/api/user/bookmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      })
      if (res.status === 401) {
        // Not logged in — redirect to login with current page as next
        window.location.href = `/anmelden?next=${encodeURIComponent(window.location.pathname)}`
        return
      }
      const data = await res.json()
      if (data.ok) setBookmarked(data.bookmarked)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-label={bookmarked ? 'Lesezeichen entfernen' : 'Lesezeichen setzen'}
      title={bookmarked ? 'Gespeichert' : 'Merken'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        background: 'transparent',
        border: '1px solid var(--color-border)',
        borderRadius: '2px',
        padding: '6px 12px',
        cursor: loading ? 'wait' : 'pointer',
        fontFamily: 'var(--font-body)',
        fontSize: '11px',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: bookmarked ? 'var(--color-gold)' : 'var(--color-textgrau-hell)',
        borderColor: bookmarked ? 'var(--color-gold)' : 'var(--color-border)',
        transition: 'color 0.15s, border-color 0.15s',
      }}
    >
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill={bookmarked ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
      </svg>
      {bookmarked ? 'Gespeichert' : 'Merken'}
    </button>
  )
}
