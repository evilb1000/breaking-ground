"use client"

import React, {useEffect, useMemo, useState} from "react"
import {getPosterTheme, interpolatePosterScale, posterThemeStyle} from "@/lib/dataPosters"
import {usePosterInView} from "@/components/usePosterInView"

type Row = Record<string, string>

function toNumber(n: string | undefined) {
  if (n == null) return null
  const trimmed = n.trim()
  if (!trimmed || trimmed === "-" || trimmed === "—" || /^n\/?a$/i.test(trimmed)) return null
  const v = Number(trimmed.replace(/[$,%]/g, ""))
  return Number.isFinite(v) ? v : null
}

function formatValue(value: number, format: string) {
  if (format === "percent") return `${value.toFixed(1)}%`
  if (format === "currency") return `$${Math.round(value).toLocaleString("en-US")}`
  return Math.round(value).toLocaleString("en-US")
}

function formatDetail(detail: string) {
  return detail.replace(/\b(\d+)\b/g, (match) => Number(match).toLocaleString("en-US"))
}

function useKpiT(inView: boolean) {
  const [t, setT] = useState(0)
  useEffect(() => {
    if (!inView) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
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

export default function RankedBarsChartAnimated({
  data,
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
  const theme = getPosterTheme("ranked-bars", themeSlug)
  const {ref: rootRef, inView} = usePosterInView()
  const kpiT = useKpiT(inView)

  const parsed = useMemo(() => {
    const bars = data
      .filter((row) => (row.role || "bar").toLowerCase() === "bar")
      .map((row) => ({
        label: (row.label || "").trim(),
        detail: (row.detail || "").trim(),
        value: toNumber(row.value) || 0,
        format: (row.display || "integer").trim(),
        colorValue: toNumber(row.color_value) ?? toNumber(row.value) ?? 0,
        reference: toNumber(row.reference),
      }))
      .filter((row) => row.label)
    const kpis = data
      .filter((row) => (row.role || "").toLowerCase() === "kpi")
      .map((row) => ({
        value: toNumber(row.value) || 0,
        format: (row.display || "integer").trim(),
        label: (row.detail || row.label || "").trim(),
      }))
    const maxValue = Math.max(1, ...bars.map((row) => row.value))
    const colors = bars.map((row) => row.colorValue)
    const cMin = Math.min(...colors)
    const cMax = Math.max(...colors)
    const reference = bars.find((row) => row.reference != null)?.reference ?? null
    return {bars, kpis, maxValue, cMin, cMax, reference}
  }, [data])

  const title = chartTitle || "RANKED SERIES"
  const eyebrow = yLabel || "CENSUS"
  const subtitle = xLabel || "Ranked values"
  const source = caption?.trim() || "Source: U.S. Census Bureau."
  const displayFormat = parsed.bars[0]?.format || "integer"

  return (
    <figure
      ref={rootRef}
      className={`rb-chart bg-font-roboto ${inView ? "is-in" : ""}`}
      data-theme={theme.slug}
      style={posterThemeStyle(theme)}
      aria-label={title}
    >
      <header className="rb-head">
        <p className="rb-eyebrow">{eyebrow}</p>
        <h3 className="rb-title">{title}</h3>
        <p className="rb-sub">{subtitle}</p>
        <dl className="rb-kpis">
          {parsed.kpis.map((kpi) => (
            <div key={kpi.label} className="rb-kpi">
              <dd>{formatValue(kpi.value * kpiT, kpi.format)}</dd>
              <dt>{kpi.label}</dt>
            </div>
          ))}
        </dl>
      </header>

      <ol className="rb-list">
        {parsed.bars.map((row, index) => {
          const t = parsed.cMax === parsed.cMin ? 1 : (row.colorValue - parsed.cMin) / (parsed.cMax - parsed.cMin)
          const color = interpolatePosterScale(theme.scale, t)
          const width = (row.value / parsed.maxValue) * 100
          const ref = parsed.reference != null ? (parsed.reference / parsed.maxValue) * 100 : null
          return (
            <li
              key={row.label}
              className="rb-row"
              style={{"--i": String(index), "--bar": color, "--w": `${width}%`} as React.CSSProperties}
            >
              <div className="rb-meta">
                <span className="rb-name">{row.label}</span>
                {row.detail ? <span className="rb-detail">{formatDetail(row.detail)}</span> : null}
                <span className="rb-val" style={{color}}>
                  {formatValue(displayFormat === "currency" ? row.colorValue : row.value, displayFormat)}
                </span>
              </div>
              <div className="rb-track">
                <span className="rb-fill" style={{background: color}} />
                {ref != null ? <span className="rb-ref" style={{left: `${ref}%`}} /> : null}
              </div>
            </li>
          )
        })}
      </ol>

      <figcaption className="rb-caption">
        <p className="rb-caption-label">RANKED</p>
        <p className="rb-source">{source}</p>
      </figcaption>
    </figure>
  )
}
