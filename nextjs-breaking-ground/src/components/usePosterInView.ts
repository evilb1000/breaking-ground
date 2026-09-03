"use client"
import {useEffect, useRef, useState} from "react"

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

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        setInView(true)
        observer.disconnect()
      },
      {
        // Reading down, the top edge arrives first. A 20–25% threshold on a
        // tall poster waits until the reader is already looking at empty bars.
        threshold: 0.01,
        rootMargin: "0px 0px 0px 0px",
      },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return {ref, inView}
}
