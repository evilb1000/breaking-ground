"use client"
import {useEffect, useRef, useState} from "react"

const TOP_BAND = 0.16
const MIN_VIEWPORT_COVERAGE = 0.58
const SHORT_TOP_BAND = 0.18
const SHORT_VISIBLE = 0.9

const IO_THRESHOLDS = Array.from({length: 21}, (_, i) => i / 20)

/** True when the poster has been scrolled into place as the main thing on screen. */
export function posterDominatesViewport(el: Element, viewportHeight = window.innerHeight) {
  if (viewportHeight <= 0) return false

  const rect = el.getBoundingClientRect()
  const visible = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0)
  if (visible <= 0) return false

  const viewportCoverage = visible / viewportHeight
  const elementCoverage = visible / Math.max(rect.height, 1)
  const topInPlace = rect.top <= viewportHeight * TOP_BAND
  const tallReady = topInPlace && viewportCoverage >= MIN_VIEWPORT_COVERAGE
  const shortReady =
    rect.top <= viewportHeight * SHORT_TOP_BAND &&
    elementCoverage >= SHORT_VISIBLE

  return tallReady || shortReady
}

export function usePosterInView() {
  const ref = useRef<HTMLElement | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setInView(true)
      return
    }

    if (!("IntersectionObserver" in window)) {
      setInView(true)
      return
    }

    let done = false
    const tryStart = () => {
      if (done || !posterDominatesViewport(el)) return
      done = true
      setInView(true)
      cleanup()
    }

    const observer = new IntersectionObserver(tryStart, {
      threshold: IO_THRESHOLDS,
      rootMargin: "0px",
    })
    observer.observe(el)
    window.addEventListener("scroll", tryStart, {passive: true})
    window.addEventListener("resize", tryStart)
    tryStart()

    function cleanup() {
      observer.disconnect()
      window.removeEventListener("scroll", tryStart)
      window.removeEventListener("resize", tryStart)
    }

    return cleanup
  }, [])

  return {ref, inView}
}
