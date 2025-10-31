"use client"
import React, {useEffect, useMemo, useRef, useState} from 'react'

type Row = Record<string, string>

// Track element and return a 0..1 progress value driven by scroll position
function useScrollProgress<T extends Element>() {
  const ref = useRef<T | null>(null)
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight || 1
      // Start when top enters 80% of viewport, finish when bottom reaches 20%
      const start = vh * 0.8
      const end = -rect.height * 0.2
      const p = (start - rect.top) / (start - end)
      const clamped = Math.max(0, Math.min(1, p))
      setProgress(clamped)
    }
    onScroll()
    let raf = 0
    const handler = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(onScroll)
    }
    window.addEventListener('scroll', handler, {passive: true})
    window.addEventListener('resize', handler)
    return () => {
      window.removeEventListener('scroll', handler)
      window.removeEventListener('resize', handler)
      cancelAnimationFrame(raf)
    }
  }, [])
  return {ref, progress}
}

function toNumber(n: string | undefined) {
  const v = Number(n)
  return Number.isFinite(v) ? v : 0
}

export default function BarChartAnimated({
  data,
  xField,
  yField,
  colors,
  duration = 800,
}: {
  data: Row[]
  xField: string
  yField: string
  colors?: string[]
  duration?: number
}) {
  const width = 800
  const height = 420
  const padding = {top: 20, right: 20, bottom: 40, left: 50}
  const innerW = width - padding.left - padding.right
  const innerH = height - padding.top - padding.bottom

  const values = useMemo(() => data.map((d) => toNumber(d[yField])), [data, yField])
  const maxV = Math.max(1, ...values)
  const barW = innerW / Math.max(1, data.length)
  const barColor = colors?.[0] || '#111'

  const {ref, progress} = useScrollProgress<SVGSVGElement>()
  const [t, setT] = useState(0)
  // Smoothly follow scroll progress (lerp)
  useEffect(() => {
    let raf = 0
    const animate = () => {
      const target = progress
      const next = t + (target - t) * 0.15 // smoothing factor
      setT(next)
      if (Math.abs(target - next) > 0.001) raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [progress, t])

  return (
    <svg ref={ref} width={width} height={height} className="mx-auto block">
      <g transform={`translate(${padding.left},${padding.top})`}>
        {data.map((d, i) => {
          const v = toNumber(d[yField])
          const targetH = (v / maxV) * innerH
          // easeOutCubic on scroll progress
          const eased = 1 - Math.pow(1 - t, 3)
          const h = targetH * eased
          const x = i * barW
          const y = innerH - h
          return (
            <g key={i}>
              <rect x={x + 4} y={y} width={Math.max(0, barW - 8)} height={h} fill={barColor} rx={4} />
            </g>
          )
        })}
      </g>
    </svg>
  )
}


