"use client"
import {useEffect, useRef, useState} from 'react'

export function useChartRevealProgress<T extends Element>(duration = 800) {
  const ref = useRef<T | null>(null)
  const startedRef = useRef(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let raf = 0
    const startAnimation = () => {
      if (startedRef.current) return
      startedRef.current = true

      if (duration <= 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setProgress(1)
        return
      }

      const start = performance.now()
      const tick = (now: number) => {
        const next = Math.min(1, (now - start) / duration)
        setProgress(next)
        if (next < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }

    if (!('IntersectionObserver' in window)) {
      startAnimation()
      return () => cancelAnimationFrame(raf)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          startAnimation()
          observer.disconnect()
        }
      },
      {rootMargin: '0px 0px 0px 0px', threshold: 0.01}
    )

    observer.observe(el)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [duration])

  return {ref, progress}
}
