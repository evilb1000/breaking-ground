"use client"
import {useEffect, useRef, useState} from 'react'
import {posterDominatesViewport} from '@/components/usePosterInView'

const IO_THRESHOLDS = Array.from({length: 21}, (_, i) => i / 20)

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

    const tryStart = () => {
      if (!posterDominatesViewport(el)) return
      startAnimation()
      cleanup()
    }

    const observer = new IntersectionObserver(tryStart, {
      threshold: IO_THRESHOLDS,
      rootMargin: '0px',
    })
    observer.observe(el)
    window.addEventListener('scroll', tryStart, {passive: true})
    window.addEventListener('resize', tryStart)
    tryStart()

    function cleanup() {
      observer.disconnect()
      window.removeEventListener('scroll', tryStart)
      window.removeEventListener('resize', tryStart)
    }

    return () => {
      cleanup()
      cancelAnimationFrame(raf)
    }
  }, [duration])

  return {ref, progress}
}
