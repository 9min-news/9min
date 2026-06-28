'use client'

import { useState, useEffect } from 'react'

export function InlineNewsletterCTA() {
  const [subscribed, setSubscribed] = useState(false)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  useEffect(() => {
    if (document.cookie.split(';').some(c => c.trim().startsWith('9min_sub='))) {
      setSubscribed(true)
    }
  }, [])

  if (subscribed || status === 'done') return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/gate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setStatus('done')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <aside style={{
      margin: '48px 0',
      padding: '28px 0',
      borderTop: '1px solid var(--color-border)',
      borderBottom: '1px solid var(--color-border)',
    }}>
      <p style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 500,
        fontSize: '18px',
        color: 'var(--color-tannengruen)',
        margin: '0 0 6px',
        lineHeight: 1.3,
      }}>
        9min im Posteingang
      </p>
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: '14px',
        color: 'var(--color-textgrau)',
        margin: '0 0 20px',
        lineHeight: 1.5,
      }}>
        Neue Beiträge direkt — keine Werbung, kein Algorithmus.
      </p>

      {status === 'error' && (
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '13px',
          color: '#B04040',
          margin: '0 0 12px',
        }}>
          Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.
        </p>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <input
          type="email"
          name="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="ihre@email.ch"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            padding: '9px 14px',
            border: '1px solid var(--color-border)',
            borderRadius: '2px',
            background: '#fff',
            color: 'var(--color-tannengruen)',
            outline: 'none',
            flex: '1 1 200px',
            minWidth: '0',
          }}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            padding: '9px 20px',
            background: 'var(--color-gold)',
            color: '#fff',
            border: 'none',
            borderRadius: '2px',
            cursor: status === 'loading' ? 'wait' : 'pointer',
            whiteSpace: 'nowrap',
            opacity: status === 'loading' ? 0.7 : 1,
          }}
        >
          {status === 'loading' ? '…' : 'Abonnieren'}
        </button>
      </form>
    </aside>
  )
}
