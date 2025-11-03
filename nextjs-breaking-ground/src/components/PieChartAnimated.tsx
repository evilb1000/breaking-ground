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

export default function PieChartAnimated({
  data,
  xField,
  yField,
  colors,
  duration = 800,
  chartTitle,
  showLegend = true,
}: {
  data: Row[]
  xField: string
  yField: string
  colors?: string[]
  duration?: number
  chartTitle?: string
  showLegend?: boolean
}) {
  const width = 800
  const height = 500
  const padding = {top: 60, right: 20, bottom: 20, left: 20}
  const radius = Math.min(width - padding.left - padding.right, height - padding.top - padding.bottom) / 2 - 20
  const centerX = width / 2
  const centerY = padding.top + (height - padding.top - padding.bottom) / 2

  const totals = useMemo(() => data.map((d) => toNumber(d[yField])), [data, yField])
  const total = useMemo(() => totals.reduce((sum, val) => sum + val, 0), [totals])

  const segments = useMemo(() => {
    let currentAngle = -Math.PI / 2
    return data.map((d, i) => {
      const value = toNumber(d[yField])
      const percentage = total > 0 ? value / total : 0
      const angle = percentage * 2 * Math.PI
      const startAngle = currentAngle
      const endAngle = currentAngle + angle
      currentAngle = endAngle
      return {
        label: d[xField],
        value,
        percentage,
        startAngle,
        endAngle,
        midAngle: startAngle + angle / 2,
        color: colors?.[i % (colors?.length || 1)] || '#111',
      }
    })
  }, [data, xField, yField, total, colors])

  const {ref, progress} = useScrollProgress<SVGSVGElement>()
  const [t, setT] = useState(0)
  useEffect(() => {
    let raf = 0
    const animate = () => {
      const target = progress
      const next = t + (target - t) * 0.15
      setT(next)
      if (Math.abs(target - next) > 0.001) raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [progress, t])

  const arcPath = (startAngle: number, endAngle: number, easedProgress: number) => {
    const sAngle = startAngle
    const eAngle = startAngle + (endAngle - startAngle) * easedProgress
    const largeArcFlag = eAngle - sAngle > Math.PI ? 1 : 0
    const x1 = centerX + radius * Math.cos(sAngle)
    const y1 = centerY + radius * Math.sin(sAngle)
    const x2 = centerX + radius * Math.cos(eAngle)
    const y2 = centerY + radius * Math.sin(eAngle)
    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`
  }

  const eased = 1 - Math.pow(1 - t, 3)

  return (
    <svg ref={ref} width={width} height={height} className="mx-auto block">
      {chartTitle ? (
        <text x={centerX} y={30} textAnchor="middle" fontSize={18} fontWeight={700}>{chartTitle}</text>
      ) : null}
      
      {segments.map((seg, i) => (
        <g key={i}>
          <path
            d={arcPath(seg.startAngle, seg.endAngle, eased)}
            fill={seg.color}
            stroke="#fff"
            strokeWidth={2}
          />
          {seg.percentage > 0.05 && eased > 0.5 && (
            <text
              x={centerX + (radius * 0.7) * Math.cos(seg.midAngle)}
              y={centerY + (radius * 0.7) * Math.sin(seg.midAngle)}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={14}
              fontWeight={700}
              fill="#fff"
            >
              {`${(seg.percentage * 100).toFixed(0)}%`}
            </text>
          )}
        </g>
      ))}

      {showLegend && (
        <g transform={`translate(${centerX + radius + 40}, ${padding.top})`}>
          {segments.map((seg, i) => (
            <g key={i} transform={`translate(0, ${i * 25})`}>
              <rect x={0} y={0} width={16} height={16} fill={seg.color} />
              <text x={24} y={12} fontSize={12} fontWeight={500} fill="#333">
                {seg.label}
              </text>
            </g>
          ))}
        </g>
      )}
    </svg>
  )
}

