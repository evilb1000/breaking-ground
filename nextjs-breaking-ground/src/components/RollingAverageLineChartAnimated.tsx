"use client"

import React, {useMemo} from "react"
import {getPosterTheme, posterThemeStyle} from "@/lib/dataPosters"
import {usePosterInView} from "@/components/usePosterInView"

type Row = Record<string, string>
type Point = {x: number; y: number; t: number; value: number; label: string}

function toNumber(n: string | undefined) {
  if (n == null) return null
  const trimmed = n.trim()
  if (!trimmed || trimmed === "-" || trimmed === "—" || /^n\/?a$/i.test(trimmed)) return null
  const v = Number(trimmed.replace(/[$,]/g, ""))
  return Number.isFinite(v) ? v : null
}

function parsePeriod(value: string) {
  const match = String(value || "").trim().match(/^(\d{4})\s*Q([1-4])$/i)
  if (!match) return null
  const year = Number(match[1])
  const quarter = Number(match[2])
  return {year, quarter, t: year + (quarter - 1) / 4, label: `${year} Q${quarter}`}
}

function formatMillions(value: number) {
  const millions = value / 1e6
  const rounded = Math.round(millions * 10) / 10
  return `${rounded.toFixed(1)}M SF`
}

function niceMillionMax(value: number) {
  const millions = value / 1e6
  if (millions <= 80) return 80e6
  if (millions <= 100) return 100e6
  if (millions <= 140) return 140e6
  if (millions <= 160) return 160e6
  return Math.ceil(millions / 20) * 20 * 1e6
}

function millionTicks(yMax: number) {
  const maxM = yMax / 1e6
  const ticks: number[] = []
  for (let value = 0; value <= maxM + 0.001; value += 20) ticks.push(value)
  return ticks
}

function linePath(points: Point[]) {
  if (points.length < 2) return ""
  return points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ")
}

function areaPath(points: Point[], baseline: number) {
  if (points.length < 2) return ""
  const first = points[0]
  const last = points[points.length - 1]
  return `${linePath(points)} L${last.x.toFixed(2)} ${baseline.toFixed(2)} L${first.x.toFixed(2)} ${baseline.toFixed(2)} Z`
}

function rollingField(row: Row) {
  return (
    row.rolling_4_quarter_average_sf ||
    row.rolling_12_month_average ||
    row.rolling_average ||
    ""
  )
}

export default function RollingAverageLineChartAnimated({
  data,
  duration = 1800,
  chartTitle,
  xLabel,
  yLabel,
  caption,
  theme: themeSlug,
}: {
  data: Row[]
  duration?: number
  chartTitle?: string
  xLabel?: string
  yLabel?: string
  caption?: string
  theme?: string
}) {
  const theme = getPosterTheme("rolling-average-line", themeSlug)
  const {ref: rootRef, inView} = usePosterInView()

  const parsed = useMemo(() => {
    const points = data
      .map((row) => {
        const period = parsePeriod(row.period || row.quarter || "")
        const value = toNumber(rollingField(row))
        if (!period || value == null) return null
        return {...period, value}
      })
      .filter((row): row is NonNullable<typeof row> => Boolean(row))

    const maxValue = Math.max(0, ...points.map((point) => point.value))
    const yMax = niceMillionMax(maxValue)
    const ticks = millionTicks(yMax)
    const tMin = points[0]?.t ?? 2016
    const tMax = points[points.length - 1]?.t ?? 2026
    const years = [...new Set(points.map((p) => p.year))]
    const xTicks = years.filter((year) => year % 2 === 0)
    const latest = points[points.length - 1] || null

    return {points, yMax, ticks, tMin, tMax, xTicks, latest}
  }, [data])

  const width = 640
  const height = 280
  const pad = {top: 18, right: 54, bottom: 32, left: 42}
  const innerW = width - pad.left - pad.right
  const innerH = height - pad.top - pad.bottom
  const span = parsed.tMax - parsed.tMin || 1
  const xOf = (t: number) => pad.left + ((t - parsed.tMin) / span) * innerW
  const yOf = (value: number) => pad.top + ((parsed.yMax - value) / parsed.yMax) * innerH
  const baseline = yOf(0)
  const plotted: Point[] = parsed.points.map((p) => ({
    x: xOf(p.t),
    y: yOf(p.value),
    t: p.t,
    value: p.value,
    label: p.label,
  }))
  const last = plotted[plotted.length - 1]

  const title = chartTitle || "ROLLING 12-MONTH AVERAGE"
  const eyebrow = yLabel || "NATIONAL SERIES"
  const subtitle = xLabel || "Rolling 12-month average"
  const latestLabel = parsed.latest ? formatMillions(parsed.latest.value) : ""
  const source =
    caption?.trim() ||
    `The trailing four-quarter average reached ${latestLabel} in ${parsed.latest?.label || "the latest quarter"}. Measurement ends at ${parsed.latest?.label || "the latest quarter"}; every later quarter and QTD observation is excluded.\nSource: CoStar Group. Rolling average equals the mean of the current and prior three quarters.`

  return (
    <figure
      ref={rootRef}
      className={`ra-chart bg-font-roboto ${inView ? "is-in" : ""}`}
      data-theme={theme.slug}
      style={{...posterThemeStyle(theme), ["--ra-dur" as string]: `${duration}ms`}}
      aria-label={title}
    >
      <header className="ra-head">
        <p className="ra-eyebrow">{eyebrow}</p>
        <h3 className="ra-title">{title}</h3>
        <p className="ra-sub">{subtitle}</p>
        <div className="ra-rule" />
        <p className="ra-legend">
          <span className="ra-swatch" />
          ROLLING 12-MONTH AVERAGE
        </p>
      </header>

      <svg viewBox={`0 0 ${width} ${height}`} className="ra-svg" role="img" fill="none">
        {parsed.ticks.map((tick) => {
          const y = yOf(tick * 1e6)
          return (
            <g key={tick}>
              <line
                x1={pad.left}
                x2={width - pad.right}
                y1={y}
                y2={y}
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="1"
              />
              <text
                x={pad.left - 8}
                y={y + 3}
                textAnchor="end"
                fill="var(--hr-muted)"
                fontSize="9"
                fontWeight={600}
              >
                {tick}M
              </text>
            </g>
          )
        })}
        {parsed.xTicks.map((year) => (
          <text
            key={year}
            x={xOf(year)}
            y={height - 4}
            textAnchor="middle"
            fill="var(--hr-muted)"
            fontSize="10"
            fontWeight={600}
          >
            {year}
          </text>
        ))}
        {plotted.length > 1 ? (
          <path
            d={areaPath(plotted, baseline)}
            className="ra-fill"
            fill="var(--hr-wash-a)"
          />
        ) : null}
        {plotted.length > 1 ? (
          <path
            d={linePath(plotted)}
            className="ra-stroke"
            stroke="var(--hr-gold)"
            strokeWidth="2.2"
            strokeLinejoin="round"
            strokeLinecap="round"
            pathLength={1}
          />
        ) : null}
        {last ? (
          <g className="ra-end" transform={`translate(${last.x} ${last.y})`}>
            <circle r="7" fill="var(--hr-bg)" stroke="var(--hr-title)" strokeWidth="2" />
            <text
              x="-10"
              y="-12"
              textAnchor="end"
              fill="var(--hr-title)"
              fontSize="12"
              fontWeight={800}
            >
              {latestLabel}
            </text>
          </g>
        ) : null}
      </svg>

      <figcaption className="ra-caption">
        <p className="ra-caption-label">CURRENT SIGNAL</p>
        <p className="ra-source">{source}</p>
      </figcaption>
    </figure>
  )
}
