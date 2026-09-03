"use client"

import React, {useEffect, useMemo, useState} from "react"
import {getPosterTheme, interpolatePosterScale, posterThemeStyle} from "@/lib/dataPosters"
import {usePosterInView} from "@/components/usePosterInView"

type Row = Record<string, string>

const RESERVED = new Set(["year1", "year2", "year3", "avg_3yr", "sales", "units"])
const YEAR_COLORS = ["var(--hr-y1)", "var(--hr-y2)", "var(--hr-y3)"]
const YEAR_LABELS = [
  "Year 1 (Q3 '23–Q2 '24)",
  "Year 2 (Q3 '24–Q2 '25)",
  "Year 3 (Q3 '25–Q2 '26)",
]

function toNumber(n: string | undefined) {
  if (n == null) return null
  const trimmed = n.trim()
  if (!trimmed || trimmed === "-" || trimmed === "—" || /^n\/?a$/i.test(trimmed)) return null
  const v = Number(trimmed.replace(/[$,]/g, ""))
  return Number.isFinite(v) ? v : null
}

function luminance(rgb: string) {
  const m = rgb.match(/\d+/g)
  if (!m) return 0
  const [r, g, b] = m.map(Number)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255
}

function percentile(values: number[], p: number) {
  if (!values.length) return 1
  const s = [...values].sort((a, b) => a - b)
  const idx = (s.length - 1) * p
  const lo = Math.floor(idx)
  const hi = Math.ceil(idx)
  return s[lo] + (s[hi] - s[lo]) * (idx - lo)
}

function prettyQuarter(header: string) {
  const short = header.trim().match(/^Q([1-4])\s+'?(\d{2})$/i)
  if (short) return `Q${short[1]} '${short[2]}`
  const long = header.trim().match(/^(\d{4})\s+Q([1-4])$/i)
  if (long) return `Q${long[2]} '${long[1].slice(2)}`
  return header
}

function isQuarterHeader(header: string) {
  return /^(?:Q[1-4](?:\s+'?\d{2})?|\d{4}\s+Q[1-4])$/i.test(header.trim())
}

function formatK(value: number) {
  return `$${Math.round(value / 1000)}k`
}

function formatCount(value: number) {
  return String(Math.round(value))
}

function niceCountMax(value: number) {
  if (value <= 8) return 8
  if (value <= 20) return 20
  const step = value <= 40 ? 10 : 20
  return Math.ceil(value / step) * step
}

function mean(values: number[]) {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0
}

export default function HeatmapRangeChartAnimated({
  data,
  xField,
  yFields,
  duration = 2200,
  chartTitle,
  xLabel,
  yLabel,
  caption,
  theme: themeSlug,
}: {
  data: Row[]
  xField: string
  yFields?: string[]
  duration?: number
  chartTitle?: string
  xLabel?: string
  yLabel?: string
  caption?: string
  theme?: string
}) {
  const theme = getPosterTheme("heatmap-range", themeSlug)
  const {ref: rootRef, inView} = usePosterInView()
  const [hoverRow, setHoverRow] = useState<number | null>(null)
  const [kpiT, setKpiT] = useState(0)

  const parsed = useMemo(() => {
    const keys = Object.keys(data[0] || {})
    const requested = (yFields || []).filter(
      (field) => field && !RESERVED.has(field) && field !== xField && keys.includes(field),
    )
    const autoQuarters = keys.filter(isQuarterHeader)
    const requestedQuarters = requested.filter(isQuarterHeader)
    const quarterFields =
      requestedQuarters.length > 1 ? requestedQuarters : autoQuarters.length ? autoQuarters : requested
    const rows = data
      .map((row) => {
        const label = String(row[xField] || "").trim()
        if (!label) return null
        const quarters = quarterFields.map((field) => toNumber(row[field]))
        const years = [toNumber(row.year1), toNumber(row.year2), toNumber(row.year3)] as Array<number | null>
        const avg = toNumber(row.avg_3yr)
        const sales = toNumber(row.sales) ?? 0
        return {label, quarters, years, avg, sales}
      })
      .filter((row): row is NonNullable<typeof row> => Boolean(row))

    const cellValues = rows.flatMap((row) => row.quarters.filter((v): v is number => v != null))
    const colorMax = Math.max(1, percentile(cellValues, 0.95))
    const yearValues = rows.flatMap((row) => [...row.years, row.avg].filter((v): v is number => v != null))
    let compared = 0
    let matched = 0
    for (const row of rows) {
      const years = row.years.filter((value): value is number => value != null)
      if (!years.length || !row.sales) continue
      compared += 1
      if (Math.abs(years.reduce((sum, value) => sum + value, 0) - row.sales) <= 1) matched += 1
    }
    const isCount = compared > 0 && matched / compared >= 0.6
    const rangeMax = isCount
      ? niceCountMax(Math.max(0, ...yearValues, ...rows.map((row) => row.sales)))
      : Math.max(400_000, Math.ceil((Math.max(0, ...yearValues) * 1.05) / 50_000) * 50_000)
    const totalSales = rows.reduce((sum, row) => sum + row.sales, 0)
    const weighted3yr =
      totalSales > 0
        ? rows.reduce((sum, row) => sum + (row.avg ?? 0) * row.sales, 0) / totalSales
        : mean(rows.map((row) => row.avg).filter((v): v is number => v != null))
    const lastFour = quarterFields.slice(-4)
    const latestValues = rows.flatMap((row) =>
      lastFour
        .map((_, i) => row.quarters[quarterFields.length - lastFour.length + i])
        .filter((v): v is number => v != null),
    )
    const leader = rows.reduce(
      (best, row) => (row.sales > best.sales ? row : best),
      rows[0] || {label: "", sales: 0, quarters: [], years: [null, null, null], avg: null},
    )

    return {
      quarterFields,
      rows,
      colorMax,
      rangeMax,
      isCount,
      weighted3yr,
      latest12: isCount ? latestValues.reduce((sum, value) => sum + value, 0) : mean(latestValues),
      disclosed: totalSales > 0 ? totalSales : cellValues.length,
      leader,
    }
  }, [data, xField, yFields])

  useEffect(() => {
    if (!inView) return
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced || duration <= 0) {
      setKpiT(1)
      return
    }
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const next = Math.min(1, (now - start) / Math.min(900, duration))
      setKpiT(1 - Math.pow(1 - next, 3))
      if (next < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, duration])

  const isCount = parsed.isCount
  const formatValue = isCount ? formatCount : formatK
  const title =
    chartTitle ||
    (isCount ? "Where Pittsburgh multifamily actually trades" : "What a Pittsburgh multifamily unit actually trades for")
  const subtitle =
    xLabel ||
    (isCount
      ? "Every submarket. Every reported sale. Twelve complete quarters."
      : "Every submarket. Weighted by units sold. Disclosed transactions only.")

  return (
    <figure
      ref={rootRef}
      className={`hr-chart bg-font-roboto ${inView ? "is-in" : ""}`}
      data-theme={theme.slug}
      data-kind={isCount ? "count" : "currency"}
      style={posterThemeStyle(theme)}
      aria-label={title}
    >
      <header>
        <h3 className="hr-chart-title">{title}</h3>
        <p className="hr-chart-sub">{subtitle}</p>
        <dl className="hr-kpis">
          {isCount ? (
            <>
              <div className="hr-kpi">
                <dt>Total sales</dt>
                <dd>{formatCount(parsed.disclosed * kpiT)}</dd>
              </div>
              <div className="hr-kpi">
                <dt>Latest 12 months</dt>
                <dd>{formatCount(parsed.latest12 * kpiT)}</dd>
              </div>
              <div className="hr-kpi">
                <dt>{parsed.leader.label} · #1</dt>
                <dd>{formatCount(parsed.leader.sales * kpiT)}</dd>
              </div>
            </>
          ) : (
            <>
              <div className="hr-kpi">
                <dt>Three-year weighted avg</dt>
                <dd>{formatK(parsed.weighted3yr * kpiT)}</dd>
              </div>
              <div className="hr-kpi">
                <dt>Latest 12 months</dt>
                <dd>{formatK(parsed.latest12 * kpiT)}</dd>
              </div>
              <div className="hr-kpi">
                <dt>Disclosed sales</dt>
                <dd>{Math.round(parsed.disclosed * kpiT)}</dd>
              </div>
            </>
          )}
        </dl>
      </header>

      <div className="hr-panels">
        <div>
          <p className="hr-section-label">{isCount ? "Quarterly sales count" : "Weighted avg sale price / unit"}</p>
          <div className="hr-heat-scroll">
            <div
              className="hr-heat"
              style={{
                gridTemplateColumns: `96px repeat(${parsed.quarterFields.length}, minmax(0, 1fr))`,
              }}
            >
              <div className="hr-heat-head" />
              {parsed.quarterFields.map((field, colIndex) => (
                <div
                  key={field}
                  className={`hr-q ${colIndex > 0 && colIndex % 4 === 0 ? "hr-year-start" : ""}`}
                >
                  {prettyQuarter(field)}
                </div>
              ))}
              {parsed.rows.map((row, rowIndex) => (
                <React.Fragment key={row.label}>
                  <div
                    className={`hr-heat-label ${hoverRow === rowIndex ? "hr-row-hot" : ""}`}
                    onMouseEnter={() => setHoverRow(rowIndex)}
                    onMouseLeave={() => setHoverRow(null)}
                  >
                    {row.label}
                  </div>
                  {row.quarters.map((value, colIndex) => {
                    const heat = value == null ? 0 : Math.max(0, Math.min(1, value / parsed.colorMax))
                    const fill = value == null ? theme.tokens.emptyCell : interpolatePosterScale(theme.scale, heat)
                    const color = value == null ? theme.tokens.emptyText : luminance(fill) < 0.6 ? theme.tokens.cellTextLight : theme.tokens.cellTextDark
                    return (
                      <div
                        key={`${row.label}-${colIndex}`}
                        className={`hr-cell ${colIndex > 0 && colIndex % 4 === 0 ? "hr-year-start" : ""}`}
                        style={
                          {
                            ["--c" as string]: String(colIndex),
                            ["--r" as string]: String(rowIndex),
                            ["--heat" as string]: heat.toFixed(3),
                            background: fill,
                            color,
                          } as React.CSSProperties
                        }
                        onMouseEnter={() => setHoverRow(rowIndex)}
                        onMouseLeave={() => setHoverRow(null)}
                      >
                        {value == null ? "—" : formatValue(value)}
                      </div>
                    )
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        <div className={isCount ? "hr-stack-rail" : undefined}>
          <div className="hr-range-head">
            <p className="hr-section-label">{yLabel || (isCount ? "Three-year total · by window" : "Annual windows")}</p>
            <p className="hr-section-label">{isCount ? "Total" : "3-year avg"}</p>
          </div>
          {parsed.rows.map((row, rowIndex) => (
            <div
              key={`range-${row.label}`}
              className={`hr-range-row ${hoverRow === rowIndex ? "hr-row-hot" : ""}`}
              style={{["--r" as string]: String(rowIndex)} as React.CSSProperties}
              onMouseEnter={() => setHoverRow(rowIndex)}
              onMouseLeave={() => setHoverRow(null)}
            >
              {isCount ? (
                <div className="hr-stack-track">
                  {row.years.map((value, yearIndex) => {
                    if (value == null || value <= 0) return null
                    return (
                      <span
                        key={`${row.label}-y${yearIndex}`}
                        className="hr-stack-seg"
                        style={
                          {
                            ["--w" as string]: `${(value / parsed.rangeMax) * 100}%`,
                            ["--y" as string]: String(yearIndex),
                            ["--r" as string]: String(rowIndex),
                            background: YEAR_COLORS[yearIndex],
                          } as React.CSSProperties
                        }
                      />
                    )
                  })}
                </div>
              ) : (
                <div className="hr-track">
                  {row.years.map((value, yearIndex) => {
                    if (value == null) return null
                    return (
                      <span
                        key={`${row.label}-y${yearIndex}`}
                        className="hr-dot"
                        style={
                          {
                            ["--x" as string]: `${(value / parsed.rangeMax) * 100}%`,
                            ["--y" as string]: String(yearIndex),
                            ["--r" as string]: String(rowIndex),
                            ["--dot" as string]: YEAR_COLORS[yearIndex],
                            background: YEAR_COLORS[yearIndex],
                          } as React.CSSProperties
                        }
                      />
                    )
                  })}
                </div>
              )}
              <div className="hr-avg">{row.avg == null && !row.sales ? "—" : formatValue(isCount ? row.sales : (row.avg ?? 0))}</div>
            </div>
          ))}
          <div className="hr-axis">
            <span>{isCount ? "0" : "$0"}</span>
            <span>{formatValue(parsed.rangeMax / 2)}</span>
            <span>{formatValue(parsed.rangeMax)}</span>
          </div>
        </div>
      </div>

      <figcaption className="hr-legend">
        <span className="hr-scale" />
        <span>{isCount ? "0" : "$0"}</span>
        <span>{isCount ? `${formatCount(parsed.colorMax)} sales / qtr` : `${formatK(parsed.colorMax)}+`}</span>
        {YEAR_LABELS.map((label, i) => (
          <span key={label}>
            <span className="hr-swatch" style={{background: YEAR_COLORS[i]}} />
            {label}
          </span>
        ))}
      </figcaption>
      {caption?.trim() || isCount ? (
        <p className="hr-source">
          {caption?.trim() || "Source: CoStar Multi-Family · 2023 Q3–2026 Q2 · Complete quarters only"}
        </p>
      ) : null}
    </figure>
  )
}
