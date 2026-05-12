"use client"
import React, {useMemo} from 'react'
import {useChartRevealProgress} from './useChartRevealProgress'

type Row = Record<string, string>

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
  chartTitle,
  xLabel,
  yLabel,
  showAxis = true,
  showTicks = true,
  tickCount = 5,
}: {
  data: Row[]
  xField: string
  yField: string
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

  const values = useMemo(() => data.map((d) => toNumber(d[yField])), [data, yField])
  const maxV = Math.max(1, ...values)
  const barW = innerW / Math.max(1, data.length)

  const {ref, progress} = useChartRevealProgress<SVGSVGElement>(duration)
  const eased = 1 - Math.pow(1 - progress, 3)

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${width} ${height + 40}`}
      className="mx-auto block h-auto w-full max-w-full overflow-visible"
      role="img"
    >
      {/* Title */}
      {chartTitle ? (
        <text x={width / 2} y={20} textAnchor="middle" fontSize={18} fontWeight={700}>{chartTitle}</text>
      ) : null}
      <g transform={`translate(${padding.left},${padding.top + (chartTitle ? 10 : 0)})`}>
        {/* Axes */}
        {showAxis && (
          <>
            {/* Y axis */}
            <line x1={0} y1={0} x2={0} y2={innerH} stroke="#ccc" />
            {/* X axis */}
            <line x1={0} y1={innerH} x2={innerW} y2={innerH} stroke="#ccc" />
          </>
        )}
        {showTicks && (
          <>
            {/* Y ticks */}
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
            {/* X ticks (sampled) */}
            {data.map((d, i) => {
              const x = i * barW + barW / 2
              // sample every N labels if many bars
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
        {data.map((d, i) => {
          const v = toNumber(d[yField])
          const targetH = (v / maxV) * innerH
          const h = targetH * eased
          const x = i * barW
          const y = innerH - h
          const barColor = colors && colors.length > 0 
            ? colors[i % colors.length] 
            : '#111'
          return (
            <g key={i}>
              <rect x={x + 4} y={y} width={Math.max(0, barW - 8)} height={h} fill={barColor} rx={4} />
            </g>
          )
        })}
        {/* Axis labels */}
        {xLabel ? (
          <text x={innerW / 2} y={innerH + 28} textAnchor="middle" fontSize={12} fontWeight={700} fill="#444">{xLabel}</text>
        ) : null}
        {yLabel ? (
          <text transform={`rotate(-90)`} x={-innerH / 2} y={-40} textAnchor="middle" fontSize={12} fontWeight={700} fill="#444">{yLabel}</text>
        ) : null}
      </g>
    </svg>
  )
}


