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
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-paper)]">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-medium text-[var(--color-tannengruen)] mb-8 text-center">
          Media Watch
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Passwort"
            required
            autoFocus
            className="border border-[var(--color-border)] rounded px-4 py-3 text-[var(--color-tannengruen)] bg-white focus:outline-none focus:border-[var(--color-tannengruen)]"
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="bg-[var(--color-tannengruen)] text-white px-4 py-3 rounded hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? 'Anmelden…' : 'Anmelden'}
          </button>
        </form>
      </div>
    </div>
  )
}
