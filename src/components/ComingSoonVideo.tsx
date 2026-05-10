'use client'

import { useEffect, useRef } from 'react'

const BASE_RATE = 0.3
const SCROLL_RATE = 1.8
const SCROLL_DECAY = 2000 // ms to ease back to base rate

export function ComingSoonVideo({ className }: { className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rafRef = useRef<number | null>(null)
  const reversingRef = useRef(false)
  const lastTimestamp = useRef<number | null>(null)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return

    v.playbackRate = BASE_RATE

    const reverseStep = (ts: number) => {
      if (lastTimestamp.current === null) lastTimestamp.current = ts
      const delta = (ts - lastTimestamp.current) / 1000
      lastTimestamp.current = ts

      v.currentTime = Math.max(0, v.currentTime - delta * BASE_RATE)

      if (v.currentTime < 0.05) {
        reversingRef.current = false
        lastTimestamp.current = null
        v.playbackRate = BASE_RATE
        v.play()
      } else {
        rafRef.current = requestAnimationFrame(reverseStep)
      }
    }

    const onEnded = () => {
      reversingRef.current = true
      rafRef.current = requestAnimationFrame(reverseStep)
    }

    const onScroll = () => {
      if (reversingRef.current) return
      v.playbackRate = SCROLL_RATE
      if (scrollTimer.current) clearTimeout(scrollTimer.current)
      scrollTimer.current = setTimeout(() => {
        v.playbackRate = BASE_RATE
      }, SCROLL_DECAY)
    }

    v.addEventListener('ended', onEnded)
    window.addEventListener('scroll', onScroll, { passive: true })
    v.play().catch(() => {})

    return () => {
      v.removeEventListener('ended', onEnded)
      window.removeEventListener('scroll', onScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (scrollTimer.current) clearTimeout(scrollTimer.current)
    }
  }, [])

  return (
    <video
      ref={videoRef}
      src="/9min-intro-vid.mp4"
      muted
      playsInline
      className={className}
    />
  )
}
