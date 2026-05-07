"use client"
import React, {useMemo} from 'react'
import {useChartRevealProgress} from './useChartRevealProgress'

type Row = Record<string, string>

export type ComboSeriesConfig = {
  field: string
  label?: string
  renderAs: 'bar' | 'line'
  axis: 'left' | 'right'
  color?: string
}

function toNumber(n: string | undefined) {
  const v = Number(n)
  return Number.isFinite(v) ? v : 0
}

function maxForAxis(data: Row[], series: ComboSeriesConfig[], axis: 'left' | 'right') {
  const values = data.flatMap((d) =>
    series.filter((s) => s.axis === axis).map((s) => toNumber(d[s.field]))
  )
  return Math.max(1, ...values)
}

export default function ComboChartAnimated({
  data,
  xField,
  seriesConfig,
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
  seriesConfig: ComboSeriesConfig[]
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
  const padding = {top: 20, right: 58, bottom: 40, left: 58}
  const innerW = width - padding.left - padding.right
  const innerH = height - padding.top - padding.bottom
  const activeSeries = useMemo(
    () =>
      seriesConfig
        .filter((series) => series.field && (series.renderAs === 'bar' || series.renderAs === 'line'))
        .map((series, index) => ({
          ...series,
          label: series.label || series.field,
          color: series.color || colors?.[index % colors.length] || ['#113251', '#ff611d', '#1a7a4a', '#c85006'][index % 4],
        })),
    [seriesConfig, colors]
  )
  const barSeries = activeSeries.filter((series) => series.renderAs === 'bar')
  const lineSeries = activeSeries.filter((series) => series.renderAs === 'line')
  const leftMax = maxForAxis(data, activeSeries, 'left')
  const rightMax = maxForAxis(data, activeSeries, 'right')
  const barW = innerW / Math.max(1, data.length)
  const groupedBarW = barW / Math.max(1, barSeries.length)
  const xCenter = (i: number) => i * barW + barW / 2
  const yScale = (value: number, axis: 'left' | 'right') =>
    innerH - (value / (axis === 'left' ? leftMax : rightMax)) * innerH
  const rightAxisLabel = activeSeries.find((series) => series.axis === 'right')?.label

  const {ref, progress} = useChartRevealProgress<SVGSVGElement>(duration)

  const eased = 1 - Math.pow(1 - progress, 3)
  const linePaths = useMemo(
    () =>
      lineSeries.map((series) => {
        const points = data.map((d, i) => ({
          x: xCenter(i),
          y: yScale(toNumber(d[series.field]), series.axis),
        }))
        const visibleCount = Math.ceil(points.length * eased)
        if (visibleCount === 0 || points.length === 0) return ''
        return points.slice(0, visibleCount).reduce((path, point, index) => {
          return `${path}${index === 0 ? 'M' : ' L'} ${point.x} ${point.y}`
        }, '')
      }),
    [data, lineSeries, eased, leftMax, rightMax]
  )
  const legendItemWidth = 150
  const legendWidth = activeSeries.length * legendItemWidth

  return (
    <svg ref={ref} width={width} height={height + 46} className="mx-auto block">
      {chartTitle ? (
        <text x={width / 2} y={20} textAnchor="middle" fontSize={18} fontWeight={700}>{chartTitle}</text>
      ) : null}
      <g transform={`translate(${padding.left},${padding.top + (chartTitle ? 10 : 0)})`}>
        {showAxis ? (
          <>
            <line x1={0} y1={0} x2={0} y2={innerH} stroke="#ccc" />
            <line x1={innerW} y1={0} x2={innerW} y2={innerH} stroke="#ccc" />
            <line x1={0} y1={innerH} x2={innerW} y2={innerH} stroke="#ccc" />
          </>
        ) : null}
        {showTicks ? (
          <>
            {Array.from({length: tickCount}).map((_, i) => {
              const percent = i / (tickCount - 1)
              const y = innerH - innerH * percent
              const leftValue = Math.round(leftMax * percent)
              const rightValue = Math.round(rightMax * percent)
              return (
                <g key={`y-${i}`}>
                  <line x1={-4} x2={0} y1={y} y2={y} stroke="#999" />
                  <text x={-8} y={y} textAnchor="end" dominantBaseline="middle" fontSize={12} fontWeight={700} fill="#333">{leftValue}</text>
                  <line x1={innerW} x2={innerW + 4} y1={y} y2={y} stroke="#999" />
                  <text x={innerW + 8} y={y} textAnchor="start" dominantBaseline="middle" fontSize={12} fontWeight={700} fill="#333">{rightValue}</text>
                </g>
              )
            })}
            {data.map((d, i) => {
              const x = xCenter(i)
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
        ) : null}
        {data.map((d, rowIndex) => (
          <g key={`bars-${rowIndex}`}>
            {barSeries.map((series, seriesIndex) => {
              const value = toNumber(d[series.field])
              const targetH = innerH - yScale(value, series.axis)
              const h = targetH * eased
              const x = rowIndex * barW + seriesIndex * groupedBarW
              const y = innerH - h
              return (
                <rect
                  key={`${series.field}-${rowIndex}`}
                  x={x + 4}
                  y={y}
                  width={Math.max(0, groupedBarW - 8)}
                  height={h}
                  fill={series.color}
                  rx={4}
                />
              )
            })}
          </g>
        ))}
        {lineSeries.map((series, lineIndex) => (
          <g key={series.field}>
            {linePaths[lineIndex] ? (
              <path
                d={linePaths[lineIndex]}
                fill="none"
                stroke={series.color}
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : null}
            {data.map((d, i) => {
              const visible = i < Math.ceil(data.length * eased)
              if (!visible) return null
              return (
                <circle
                  key={`${series.field}-${i}`}
                  cx={xCenter(i)}
                  cy={yScale(toNumber(d[series.field]), series.axis)}
                  r={4}
                  fill={series.color}
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
          <text transform="rotate(-90)" x={-innerH / 2} y={-44} textAnchor="middle" fontSize={14} fontWeight={800} fill="#333">{yLabel}</text>
        ) : null}
        {rightAxisLabel ? (
          <text transform="rotate(90)" x={innerH / 2} y={-innerW - 44} textAnchor="middle" fontSize={14} fontWeight={800} fill="#333">{rightAxisLabel}</text>
        ) : null}
        {activeSeries.length > 1 ? (
          <g transform={`translate(${innerW / 2 - legendWidth / 2}, ${innerH + 50})`}>
            {activeSeries.map((series, i) => (
              <g key={series.field} transform={`translate(${i * legendItemWidth}, 0)`}>
                {series.renderAs === 'bar' ? (
                  <rect x={0} y={-8} width={18} height={12} fill={series.color} rx={2} />
                ) : (
                  <line x1={0} y1={0} x2={18} y2={0} stroke={series.color} strokeWidth={3} strokeLinecap="round" />
                )}
                <text x={26} y={4} fontSize={12} fontWeight={700} fill="#333">
                  {series.label}
                </text>
              </g>
            ))}
          </g>
        ) : null}
      </g>
    </svg>
  )
}
