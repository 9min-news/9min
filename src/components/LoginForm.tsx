'use client'

import { useState } from 'react'

interface LoginFormProps {
  next?: string
  onClose?: () => void
}

export function LoginForm({ next = '/', onClose }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/auth/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, next }),
      })
      setStatus(res.ok ? 'sent' : 'error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div style={{ textAlign: 'center', padding: '8px 0' }}>
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: '16px',
          color: 'var(--color-tannengruen)',
          margin: '0 0 6px',
        }}>
          Link verschickt.
        </p>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '13px',
          color: 'var(--color-textgrau-hell)',
          margin: 0,
        }}>
          Prüfen Sie Ihr Postfach — der Link ist 15 Minuten gültig.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: '13px',
        color: 'var(--color-textgrau)',
        margin: '0 0 14px',
        lineHeight: 1.5,
      }}>
        E-Mail-Adresse eingeben — Sie erhalten einen Anmeldelink.
      </p>

      {status === 'error' && (
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '12px',
          color: '#B04040',
          margin: '0 0 10px',
        }}>
          Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.
        </p>
      )}

      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="ihre@email.ch"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            padding: '9px 12px',
            border: '1px solid var(--color-border)',
            borderRadius: '2px',
            background: '#fff',
            color: 'var(--color-tannengruen)',
            outline: 'none',
            flex: 1,
            minWidth: 0,
          }}
          autoFocus
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '12px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            padding: '9px 16px',
            background: 'var(--color-tannengruen)',
            color: '#fff',
            border: 'none',
            borderRadius: '2px',
            cursor: status === 'loading' ? 'wait' : 'pointer',
            whiteSpace: 'nowrap',
            opacity: status === 'loading' ? 0.7 : 1,
          }}
        >
          {status === 'loading' ? '…' : 'Anmelden'}
        </button>
      </div>
    </form>
  )
}
