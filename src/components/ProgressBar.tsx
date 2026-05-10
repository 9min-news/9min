'use client'

import { useEffect, useState } from 'react'

// Reading progress bar — 2px fixed at top of viewport.
// Color: tannengrün → gold at 100%.
// Only rendered inside AnalyseLayout.
export function ProgressBar() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const update = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0)
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <div
      role="progressbar"
      aria-label="Lesefortschritt"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '2px',
        width: `${progress}%`,
        background: progress >= 100 ? '#D4A847' : '#1A2E1A',
        transition: 'background 200ms ease',
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    />
  )
}
