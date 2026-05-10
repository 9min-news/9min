'use client'

import { useEffect, useRef } from 'react'

const BASE_RATE = 0.3
const SCROLL_RATE = 1.8
const SCROLL_DECAY = 2000

export function ComingSoonVideo({ className }: { className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return

    v.playbackRate = BASE_RATE

    const onScroll = () => {
      v.playbackRate = SCROLL_RATE
      if (scrollTimer.current) clearTimeout(scrollTimer.current)
      scrollTimer.current = setTimeout(() => {
        v.playbackRate = BASE_RATE
      }, SCROLL_DECAY)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    v.play().catch(() => {})

    return () => {
      window.removeEventListener('scroll', onScroll)
      if (scrollTimer.current) clearTimeout(scrollTimer.current)
    }
  }, [])

  return (
    <video
      ref={videoRef}
      src="/9min-intro-vid.mp4"
      muted
      playsInline
      loop
      className={className}
    />
  )
}
