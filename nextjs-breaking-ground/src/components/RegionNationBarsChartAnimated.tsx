"use client"

import React, {useEffect, useMemo, useState} from "react"
import {getPosterTheme, posterThemeStyle} from "@/lib/dataPosters"
import {usePosterInView} from "@/components/usePosterInView"

type Row = Record<string, string>

const REGION_ORDER = ["Midwest", "Northeast", "South", "Southwest", "West Coast"]
const FALLBACK = ["#6d28d9", "#d13184", "#ff7a2e", "#ffb347", "#ffe08a"]

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

function formatPct(value: number) {
  const rounded = Math.round(value * 10) / 10
  if (Object.is(rounded, -0) || rounded === 0) return "0%"
  return `${rounded > 0 ? "+" : ""}${rounded.toFixed(1).replace(/\.0$/, "")}%`
}

export default function RegionNationBarsChartAnimated({
  data,
  duration = 1800,
  chartTitle,
  xLabel,
  caption,
  theme: themeSlug,
}: {
  data: Row[]
  duration?: number
  chartTitle?: string
  xLabel?: string
  caption?: string
  theme?: string
}) {
  const theme = getPosterTheme("region-nation-bars", themeSlug)
  const {ref: rootRef, inView} = usePosterInView()
  const [kpiT, setKpiT] = useState(0)

  const parsed = useMemo(() => {
    const records = data
      .map((row) => ({
        type: (row.geography_type || "").toLowerCase(),
        name: (row.geography || row.region || "").trim(),
        year: toNumber(row.year),
        sales: toNumber(row.sales_transactions) ?? 0,
        yoy: toNumber(row.sales_transactions_yoy_change),
      }))
      .filter((row) => row.year != null && row.name)

    const years = [...new Set(records.map((row) => row.year as number))].sort((a, b) => a - b)
    const regions = REGION_ORDER.filter((name) => records.some((row) => row.type === "region" && row.name === name))
    const extra = [...new Set(records.filter((row) => row.type === "region").map((row) => row.name))].filter(
      (name) => !regions.includes(name),
    )
    const regionNames = [...regions, ...extra]

    const byYear = years.map((year) => {
      const parts = regionNames.map((name) => {
        const hit = records.find((row) => row.year === year && row.type === "region" && row.name === name)
        return {name, sales: hit?.sales ?? 0}
      })
      const national = records.find((row) => row.year === year && row.type === "national")
      const regionalTotal = parts.reduce((sum, part) => sum + part.sales, 0)
      return {
        year,
        parts,
        regionalTotal,
        national: national?.sales ?? regionalTotal,
        yoy: national?.yoy ?? null,
      }
    })

    const maxBar = Math.max(1, ...byYear.map((row) => Math.max(row.regionalTotal, row.national)))
    const latest = byYear[byYear.length - 1]
    const first = byYear[0]
    const topRegion = latest
      ? [...latest.parts].sort((a, b) => b.sales - a.sales)[0]
      : {name: "", sales: 0}
    const vsFirst = first && latest && first.national ? latest.national / first.national - 1 : 0

    return {regionNames, byYear, maxBar, latest, topRegion, vsFirst}
  }, [data])

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

  const colorOf = (name: string, index: number) => theme.series?.[name] || FALLBACK[index % FALLBACK.length]
  const title = chartTitle || "U.S. multifamily sales — regions vs. the nation"
  const subtitle = xLabel || "Annual sales transactions. Regions stack to the U.S. total."

  return (
    <figure
      ref={rootRef}
      className={`rn-chart bg-font-roboto ${inView ? "is-in" : ""}`}
      data-theme={theme.slug}
      style={posterThemeStyle(theme)}
      aria-label={title}
    >
      <header>
        <h3 className="rn-title">{title}</h3>
        <p className="rn-sub">{subtitle}</p>
        <dl className="rn-kpis">
          <div className="rn-kpi">
            <dt>{parsed.latest?.year || ""} U.S. sales</dt>
            <dd>{formatCount((parsed.latest?.national || 0) * kpiT)}</dd>
          </div>
          <div className="rn-kpi">
            <dt>Vs {parsed.byYear[0]?.year}</dt>
            <dd className={parsed.vsFirst < 0 ? "is-neg" : undefined}>{formatPct(parsed.vsFirst * kpiT)}</dd>
          </div>
          <div className="rn-kpi">
            <dt>{parsed.topRegion.name || "Top region"}</dt>
            <dd>{formatCount((parsed.topRegion.sales || 0) * kpiT)}</dd>
          </div>
        </dl>
      </header>

      <div className="rn-panels">
        <div>
          <p className="rn-section">Regional sales</p>
          {parsed.byYear.map((row, rowIndex) => (
            <div
              key={row.year}
              className="rn-row"
              style={{["--r" as string]: String(rowIndex)} as React.CSSProperties}
            >
              <span className="rn-year">{row.year}</span>
              <div className="rn-stack">
                {row.parts.map((part, partIndex) => (
                  <span
                    key={part.name}
                    className="rn-seg"
                    title={`${part.name}: ${formatCount(part.sales)}`}
                    style={
                      {
                        ["--w" as string]: `${(part.sales / parsed.maxBar) * 100}%`,
                        ["--s" as string]: String(partIndex),
                        background: colorOf(part.name, partIndex),
                      } as React.CSSProperties
                    }
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div>
          <p className="rn-section">National</p>
          {parsed.byYear.map((row, rowIndex) => (
            <div
              key={`us-${row.year}`}
              className="rn-row"
              style={{["--r" as string]: String(rowIndex)} as React.CSSProperties}
            >
              <div className="rn-nation-track">
                <span
                  className="rn-nation"
                  style={
                    {
                      ["--w" as string]: `${(row.national / parsed.maxBar) * 100}%`,
                      background: theme.series?.["United States"] || "#f4f0ea",
                    } as React.CSSProperties
                  }
                />
              </div>
              <span className="rn-nation-val">{formatCount(row.national)}</span>
            </div>
          ))}
        </div>
      </div>

      <figcaption className="rn-legend">
        {parsed.regionNames.map((name, index) => (
          <span key={name}>
            <span className="rn-swatch" style={{background: colorOf(name, index)}} />
            {name}
          </span>
        ))}
        <span>
          <span className="rn-swatch" style={{background: theme.series?.["United States"] || "#f4f0ea"}} />
          United States
        </span>
      </figcaption>
      {caption?.trim() ? <p className="hr-source">{caption.trim()}</p> : null}
    </figure>
  )
}
