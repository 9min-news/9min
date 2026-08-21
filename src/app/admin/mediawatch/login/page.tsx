'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/mediawatch/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      router.push('/admin/mediawatch')
    } else {
      const data = await res.json()
      setError(data.error ?? 'Fehler')
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#FAFAF7',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '15px',
    }}>
      <div style={{ width: '100%', maxWidth: '340px', padding: '0 1rem' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#1A2E1A', marginBottom: '2rem', textAlign: 'center', letterSpacing: '-0.01em' }}>
          Media Watch
        </h1>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Passwort"
            required
            autoFocus
            style={{
              border: '1px solid #D4D0C8',
              borderRadius: '6px',
              padding: '10px 14px',
              fontSize: '15px',
              color: '#1A2E1A',
              background: '#fff',
              outline: 'none',
              width: '100%',
              boxSizing: 'border-box',
            }}
          />
          {error && <p style={{ color: '#dc2626', fontSize: '13px', margin: 0 }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? '#4A5C4A' : '#1A2E1A',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '10px 16px',
              fontSize: '15px',
              cursor: loading ? 'default' : 'pointer',
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            {loading ? 'Anmelden…' : 'Anmelden'}
          </button>
        </form>
      </div>
    </div>
  )
}
