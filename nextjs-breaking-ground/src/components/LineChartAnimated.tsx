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

export default function LineChartAnimated({
  data,
  xField,
  yFields,
  colors,
  duration = 800,
  chartTitle,
  xLabel,
  yLabel,
  showAxis = true,
  showTicks = true,
  tickCount = 5,
}: {
  data: Row[]
  xField: string
  yFields: string[]
  colors?: string[]
  duration?: number
  chartTitle?: string
  xLabel?: string
  yLabel?: string
  showAxis?: boolean
  showTicks?: boolean
  tickCount?: number
}) {
  const width = 800
  const height = 420
  const padding = {top: 20, right: 20, bottom: 40, left: 50}
  const innerW = width - padding.left - padding.right
  const innerH = height - padding.top - padding.bottom
  const activeYFields = useMemo(() => yFields.filter(Boolean), [yFields])

  const values = useMemo(
    () => data.flatMap((d) => activeYFields.map((field) => toNumber(d[field]))),
    [data, activeYFields]
  )
  const maxV = Math.max(1, ...values)
  const xScale = (i: number) => (i / Math.max(1, data.length - 1)) * innerW
  const yScale = (v: number) => innerH - (v / maxV) * innerH

  const lineColor = (index: number) =>
    colors?.[index % colors.length] || ['#113251', '#ff611d', '#1a7a4a', '#c85006'][index % 4]

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

  // Build animated path
  const eased = 1 - Math.pow(1 - t, 3)
  const series = useMemo(
    () =>
      activeYFields.map((field, fieldIndex) => ({
        field,
        color: lineColor(fieldIndex),
        points: data.map((d, i) => {
          const v = toNumber(d[field])
          return {
            x: xScale(i),
            y: yScale(v),
            label: d[xField],
            value: v,
          }
        }),
      })),
    [data, xField, activeYFields, maxV, colors]
  )

  // Generate path string for line
  const pathData = useMemo(
    () =>
      series.map(({points}) => {
        if (points.length === 0) return ''
        const visibleCount = Math.ceil(points.length * eased)
        if (visibleCount === 0) return ''

        let path = `M ${points[0].x} ${points[0].y}`
        for (let i = 1; i < visibleCount; i++) {
          path += ` L ${points[i].x} ${points[i].y}`
        }
        return path
      }),
    [series, eased]
  )
  const legendItemWidth = 140
  const legendWidth = series.length * legendItemWidth

  return (
    <svg ref={ref} width={width} height={height + 40} className="mx-auto block">
      {chartTitle ? (
        <text x={width / 2} y={20} textAnchor="middle" fontSize={18} fontWeight={700}>{chartTitle}</text>
      ) : null}
      <g transform={`translate(${padding.left},${padding.top + (chartTitle ? 10 : 0)})`}>
        {showAxis && (
          <>
            <line x1={0} y1={0} x2={0} y2={innerH} stroke="#ccc" />
            <line x1={0} y1={innerH} x2={innerW} y2={innerH} stroke="#ccc" />
          </>
        )}
        {showTicks && (
          <>
            {Array.from({length: tickCount}).map((_, i) => {
              const t = i / (tickCount - 1)
              const v = Math.round(maxV * t)
              const y = innerH - innerH * t
              return (
                <g key={i}>
                  <line x1={-4} x2={0} y1={y} y2={y} stroke="#999" />
                  <text x={-8} y={y} textAnchor="end" dominantBaseline="middle" fontSize={12} fontWeight={700} fill="#333">{v}</text>
                </g>
              )
            })}
            {data.map((d, i) => {
              const x = xScale(i)
              const step = Math.ceil(data.length / 8)
              if (i % step !== 0) return null
              return (
                <g key={`x-${i}`}>
                  <line x1={x} x2={x} y1={innerH} y2={innerH + 4} stroke="#999" />
                  <text x={x} y={innerH + 14} textAnchor="middle" fontSize={12} fontWeight={700} fill="#333">{String(d[xField])}</text>
                </g>
              )
            })}
          </>
        )}
        {series.map((line, lineIndex) => (
          <g key={line.field}>
            {pathData[lineIndex] ? (
              <path
                d={pathData[lineIndex]}
                fill="none"
                stroke={line.color}
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : null}
            {line.points.map((pt, i) => {
              const visible = i < Math.ceil(line.points.length * eased)
              if (!visible) return null
              return (
                <circle
                  key={`${line.field}-${i}`}
                  cx={pt.x}
                  cy={pt.y}
                  r={4}
                  fill={line.color}
                  stroke="#fff"
                  strokeWidth={2}
                />
              )
            })}
          </g>
        ))}
        {xLabel ? (
          <text x={innerW / 2} y={innerH + 28} textAnchor="middle" fontSize={14} fontWeight={800} fill="#333">{xLabel}</text>
        ) : null}
        {yLabel ? (
          <text transform={`rotate(-90)`} x={-innerH / 2} y={-40} textAnchor="middle" fontSize={14} fontWeight={800} fill="#333">{yLabel}</text>
        ) : null}
        {series.length > 1 ? (
          <g transform={`translate(${innerW / 2 - legendWidth / 2}, ${innerH + 50})`}>
            {series.map((line, i) => (
              <g key={line.field} transform={`translate(${i * 140}, 0)`}>
                <line x1={0} y1={0} x2={18} y2={0} stroke={line.color} strokeWidth={3} strokeLinecap="round" />
                <text x={26} y={4} fontSize={12} fontWeight={700} fill="#333">
                  {line.field}
                </text>
              </g>
            ))}
          </g>
        ) : null}
      </g>
    </svg>
  )
}

