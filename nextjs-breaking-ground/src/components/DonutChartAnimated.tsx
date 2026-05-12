"use client"
import React, {useMemo} from 'react'
import {useChartRevealProgress} from './useChartRevealProgress'

type Row = Record<string, string>

function toNumber(n: string | undefined) {
  const v = Number(n)
  return Number.isFinite(v) ? v : 0
}

function formatValue(value: number, numberFormat?: string) {
  const format = numberFormat?.toLowerCase()

  if (format?.includes('$') || format?.includes('currency')) {
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    })
  }

  return value.toLocaleString('en-US', {maximumFractionDigits: 1})
}

export default function DonutChartAnimated({
  data,
  xField,
  yField,
  colors,
  duration = 800,
  chartTitle,
  numberFormat,
  showLegend = true,
}: {
  data: Row[]
  xField: string
  yField: string
  colors?: string[]
  duration?: number
  chartTitle?: string
  numberFormat?: string
  showLegend?: boolean
}) {
  const width = 800
  const height = 500
  const padding = {top: 60, right: 20, bottom: 20, left: 20}
  const outerRadius = Math.min(width - padding.left - padding.right, height - padding.top - padding.bottom) / 2 - 20
  const innerRadius = outerRadius * 0.58
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

  const {ref, progress} = useChartRevealProgress<SVGSVGElement>(duration)

  const arcPath = (startAngle: number, endAngle: number, easedProgress: number) => {
    const eAngle = startAngle + (endAngle - startAngle) * easedProgress
    const largeArcFlag = eAngle - startAngle > Math.PI ? 1 : 0
    const outerStartX = centerX + outerRadius * Math.cos(startAngle)
    const outerStartY = centerY + outerRadius * Math.sin(startAngle)
    const outerEndX = centerX + outerRadius * Math.cos(eAngle)
    const outerEndY = centerY + outerRadius * Math.sin(eAngle)
    const innerEndX = centerX + innerRadius * Math.cos(eAngle)
    const innerEndY = centerY + innerRadius * Math.sin(eAngle)
    const innerStartX = centerX + innerRadius * Math.cos(startAngle)
    const innerStartY = centerY + innerRadius * Math.sin(startAngle)

    return [
      `M ${outerStartX} ${outerStartY}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEndX} ${outerEndY}`,
      `L ${innerEndX} ${innerEndY}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStartX} ${innerStartY}`,
      'Z',
    ].join(' ')
  }

  const eased = 1 - Math.pow(1 - progress, 3)

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto block h-auto w-full max-w-full overflow-visible"
      role="img"
    >
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
          {seg.percentage > 0.05 && eased > 0.5 ? (
            <text
              x={centerX + ((outerRadius + innerRadius) / 2) * Math.cos(seg.midAngle)}
              y={centerY + ((outerRadius + innerRadius) / 2) * Math.sin(seg.midAngle)}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={14}
              fontWeight={700}
              fill="#fff"
            >
              {`${(seg.percentage * 100).toFixed(0)}%`}
            </text>
          ) : null}
        </g>
      ))}

      {total > 0 ? (
        <g>
          <text x={centerX} y={centerY - 6} textAnchor="middle" fontSize={24} fontWeight={700} fill="#312e28">
            {formatValue(total, numberFormat)}
          </text>
          <text x={centerX} y={centerY + 18} textAnchor="middle" fontSize={12} fontWeight={700} fill="#595959">
            Total
          </text>
        </g>
      ) : null}

      {showLegend && (
        <g transform={`translate(${centerX + outerRadius + 40}, ${padding.top})`}>
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
