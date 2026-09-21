"use client"

import React, {useEffect, useMemo, useState} from "react"
import {getPosterTheme, interpolatePosterScale, posterThemeStyle} from "@/lib/dataPosters"
import {usePosterInView} from "@/components/usePosterInView"

type Row = Record<string, string>
type SeriesPoint = {year: number; value: number}
type Series = {id: string; label: string; points: SeriesPoint[]}

function toNumber(n: string | undefined) {
  if (n == null) return null
  const trimmed = n.trim()
  if (!trimmed || trimmed === "-" || trimmed === "—" || /^n\/?a$/i.test(trimmed)) return null
  const v = Number(trimmed.replace(/[$,]/g, ""))
  return Number.isFinite(v) ? v : null
}

function formatCount(value: number) {
  return Math.round(value).toLocaleString("en-US")
}

function formatSigned(value: number) {
  const rounded = Math.round(value)
  const body = Math.abs(rounded).toLocaleString("en-US")
  return `${rounded < 0 ? "−" : "+"}${body}`
}

function linePath(points: Array<{x: number; y: number}>) {
  if (points.length < 2) return ""
  return points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ")
}

function niceMax(value: number) {
  if (value <= 1000) return Math.ceil(value / 200) * 200
  if (value <= 5000) return Math.ceil(value / 1000) * 1000
  if (value <= 25000) return Math.ceil(value / 5000) * 5000
  return Math.ceil(value / 10000) * 10000
}

function useKpiT(inView: boolean) {
  const [t, setT] = useState(0)
  useEffect(() => {
    if (!inView) return
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced) {
      setT(1)
      return
    }
    const start = performance.now()
    let frame = 0
    const tick = (now: number) => {
      const u = Math.min(1, (now - start) / 900)
      setT(u)
      if (u < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [inView])
  return t
}

export default function DecadeLinesChartAnimated({
  data,
  duration = 1600,
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
  const theme = getPosterTheme("decade-lines", themeSlug)
  const {ref: rootRef, inView} = usePosterInView()
  const kpiT = useKpiT(inView)

  const parsed = useMemo(() => {
    const groups = new Map<string, Series>()
    for (const row of data) {
      const year = toNumber(row.year)
      const value = toNumber(row.value)
      const id = (row.series || row.label || "Series").trim()
      if (year == null || value == null || !id) continue
      const existing = groups.get(id) || {id, label: (row.label || id).trim(), points: []}
      existing.points.push({year, value})
      groups.set(id, existing)
    }
    const series = [...groups.values()]
      .map((item) => ({
        ...item,
        points: item.points.sort((a, b) => a.year - b.year),
      }))
      .filter((item) => item.points.length)
      .sort((a, b) => (b.points.at(-1)?.value || 0) - (a.points.at(-1)?.value || 0))

    const years = [...new Set(series.flatMap((item) => item.points.map((p) => p.year)))].sort((a, b) => a - b)
    const values = series.flatMap((item) => item.points.map((p) => p.value))
    const single = series.length === 1 ? series[0] : null
    const minValue = Math.min(...values)
    const maxValue = Math.max(...values)

    let yMin = 0
    let yMax = niceMax(maxValue)
    if (single) {
      const pad = Math.max(4000, (maxValue - minValue) * 0.35)
      yMin = Math.floor((minValue - pad) / 2000) * 2000
      yMax = Math.ceil((maxValue + pad) / 2000) * 2000
    }

    let peak = single ? single.points[0] : null
    let drop = single ? {from: single.points[0], to: single.points[0], delta: 0} : null
    let latest = single ? single.points[single.points.length - 1] : null
    if (single) {
      peak = single.points.reduce((best, point) => (point.value > best.value ? point : best), single.points[0])
      for (let i = 1; i < single.points.length; i += 1) {
        const delta = single.points[i].value - single.points[i - 1].value
        if (drop && delta < drop.delta) drop = {from: single.points[i - 1], to: single.points[i], delta}
      }
      latest = single.points[single.points.length - 1]
    }

    const firstYear = years[0]
    const lastYear = years[years.length - 1]
    const changes = series.map((item) => {
      const start = item.points.find((p) => p.year === firstYear)?.value ?? item.points[0].value
      const end = item.points.find((p) => p.year === lastYear)?.value ?? item.points[item.points.length - 1].value
      return {item, start, end, delta: end - start}
    })
    const leader = changes[0] ? changes.reduce((best, row) => (row.delta > best.delta ? row : best), changes[0]) : null
    const combined = changes.reduce((sum, row) => sum + row.delta, 0)

    return {series, years, single, yMin, yMax, peak, drop, latest, leader, combined, firstYear, lastYear}
  }, [data])

  const width = parsed.single ? 640 : 700
  const height = parsed.single ? 280 : 320
  const pad = parsed.single
    ? {top: 28, right: 28, bottom: 32, left: 52}
    : {top: 16, right: 118, bottom: 28, left: 44}
  const innerW = width - pad.left - pad.right
  const innerH = height - pad.top - pad.bottom
  const yearMin = parsed.years[0] ?? 1970
  const yearMax = parsed.years[parsed.years.length - 1] ?? 2020
  const span = yearMax - yearMin || 1
  const xOf = (year: number) => pad.left + ((year - yearMin) / span) * innerW
  const yOf = (value: number) => pad.top + ((parsed.yMax - value) / (parsed.yMax - parsed.yMin || 1)) * innerH

  const seriesColors = parsed.series.map((_, index) => {
    const named = theme.series?.[`c${index}`]
    if (named) return named
    return interpolatePosterScale(theme.scale, parsed.series.length <= 1 ? 0.7 : index / Math.max(1, parsed.series.length - 1))
  })

  const yTicks = parsed.single
    ? [parsed.yMin, parsed.yMin + (parsed.yMax - parsed.yMin) / 2, parsed.yMax]
    : [0, parsed.yMax / 2, parsed.yMax]

  const title = chartTitle || "DECENNIAL POPULATION"
  const eyebrow = yLabel || "CENSUS"
  const subtitle = xLabel || "Decennial Census resident population"
  const source = caption?.trim() || "Source: U.S. Census Bureau, decennial Census, April 1."

  const endLabels = parsed.single
    ? []
    : (() => {
        const raw = parsed.series.map((item, index) => {
          const last = item.points[item.points.length - 1]
          return {id: item.id, label: item.label, color: seriesColors[index], y: yOf(last.value), x: xOf(last.year)}
        })
        raw.sort((a, b) => a.y - b.y)
        const gap = 12
        for (let i = 1; i < raw.length; i += 1) {
          if (raw[i].y - raw[i - 1].y < gap) raw[i].y = raw[i - 1].y + gap
        }
        return raw
      })()

  return (
    <figure
      ref={rootRef}
      className={`dl-chart bg-font-roboto ${inView ? "is-in" : ""}`}
      data-theme={theme.slug}
      data-kind={parsed.single ? "single" : "multi"}
      style={{...posterThemeStyle(theme), ["--dl-dur" as string]: `${duration}ms`}}
      aria-label={title}
    >
      <header className="dl-head">
        <p className="dl-eyebrow">{eyebrow}</p>
        <h3 className="dl-title">{title}</h3>
        <p className="dl-sub">{subtitle}</p>
        <dl className="dl-kpis">
          {parsed.single && parsed.peak && parsed.drop && parsed.latest ? (
            <>
              <div className="dl-kpi">
                <dd>{formatCount(parsed.peak.value * kpiT)}</dd>
                <dt>{parsed.peak.year} Census high · all-time peak</dt>
              </div>
              <div className="dl-kpi">
                <dd>{formatSigned(parsed.drop.delta * kpiT)}</dd>
                <dt>
                  {parsed.drop.from.year}–{parsed.drop.to.year} change · the decade that broke the high
                </dt>
              </div>
              <div className="dl-kpi">
                <dd>{formatCount(parsed.latest.value * kpiT)}</dd>
                <dt>
                  {parsed.latest.year} Census · still {formatCount(parsed.peak.value - parsed.latest.value)} below{" "}
                  {parsed.peak.year}
                </dt>
              </div>
            </>
          ) : parsed.leader ? (
            <>
              <div className="dl-kpi">
                <dd>{Math.round(parsed.series.length * kpiT)}</dd>
                <dt>Townships up more than 5%</dt>
              </div>
              <div className="dl-kpi">
                <dd>{formatSigned(parsed.leader.delta * kpiT)}</dd>
                <dt>
                  {parsed.leader.item.label} · {formatCount(parsed.leader.start)} → {formatCount(parsed.leader.end)}
                </dt>
              </div>
              <div className="dl-kpi">
                <dd>{formatSigned(parsed.combined * kpiT)}</dd>
                <dt>
                  Combined headcount · {parsed.firstYear}–{parsed.lastYear}
                </dt>
              </div>
            </>
          ) : null}
        </dl>
      </header>

      <svg viewBox={`0 0 ${width} ${height}`} className="dl-svg" role="img" fill="none">
        <defs>
          <linearGradient id="dl-line-grad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="var(--hr-y1)" />
            <stop offset="45%" stopColor="var(--hr-y2)" />
            <stop offset="100%" stopColor="var(--hr-y3)" />
          </linearGradient>
        </defs>
        {yTicks.map((tick) => {
          const y = yOf(tick)
          return (
            <g key={tick}>
              <line x1={pad.left} x2={width - pad.right} y1={y} y2={y} stroke="var(--hr-track)" strokeWidth="1" />
              <text x={pad.left - 8} y={y + 3} textAnchor="end" fill="var(--hr-muted)" fontSize="9" fontWeight={600}>
                {formatCount(tick)}
              </text>
            </g>
          )
        })}
        {parsed.years.map((year) => (
          <text key={year} x={xOf(year)} y={height - 6} textAnchor="middle" fill="var(--hr-muted)" fontSize="10" fontWeight={600}>
            {year}
          </text>
        ))}
        {parsed.series.map((item, index) => {
          const plotted = item.points.map((p) => ({x: xOf(p.year), y: yOf(p.value), ...p}))
          return (
            <g key={item.id} className="dl-series" style={{"--i": String(index)} as React.CSSProperties}>
              <path
                d={linePath(plotted)}
                className="dl-stroke"
                stroke={parsed.single ? "url(#dl-line-grad)" : seriesColors[index]}
                strokeWidth={parsed.single ? 2.2 : 1.6}
                strokeLinejoin="round"
                strokeLinecap="round"
                pathLength={1}
              />
              {plotted.map((point) => (
                <g key={`${item.id}-${point.year}`} className="dl-dot" transform={`translate(${point.x} ${point.y})`}>
                  <circle r={parsed.single ? 5 : 3} fill={parsed.single ? interpolatePosterScale(theme.scale, (point.year - yearMin) / span) : seriesColors[index]} />
                  {parsed.single && point.year !== parsed.peak?.year ? (
                    <text
                      y={16}
                      textAnchor="middle"
                      fill="var(--hr-muted)"
                      fontSize="9"
                      fontWeight={600}
                    >
                      {formatCount(point.value)}
                    </text>
                  ) : null}
                </g>
              ))}
            </g>
          )
        })}
        {parsed.peak && parsed.single ? (
          <g className="dl-peak" transform={`translate(${xOf(parsed.peak.year)} ${yOf(parsed.peak.value)})`}>
            <text y="-28" textAnchor="middle" fill="var(--hr-label)" fontSize="9" fontWeight={700}>
              PEAK {formatCount(parsed.peak.value)}
            </text>
          </g>
        ) : null}
        {endLabels.map((item) => (
          <g key={`lab-${item.id}`} className="dl-endlab">
            <path d={`M${item.x + 6} ${yOf(parsed.series.find((s) => s.id === item.id)?.points.at(-1)?.value || 0)} L${width - pad.right + 8} ${item.y}`} stroke={item.color} strokeWidth="0.8" />
            <text x={width - pad.right + 12} y={item.y + 3} fill={item.color} fontSize="9" fontWeight={700}>
              {item.label}
            </text>
          </g>
        ))}
      </svg>

      <figcaption className="dl-caption">
        <p className="dl-caption-label">CENSUS COUNTS</p>
        <p className="dl-source">{source}</p>
      </figcaption>
    </figure>
  )
}
