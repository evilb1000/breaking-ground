"use client"

import React, {useEffect, useMemo, useState} from "react"
import {getPosterTheme, interpolatePosterScale, posterThemeStyle} from "@/lib/dataPosters"
import {usePosterInView} from "@/components/usePosterInView"

type Row = Record<string, string>

const DECADES = [
  {key: "d1980", year: 1980},
  {key: "d1990", year: 1990},
  {key: "d2000", year: 2000},
  {key: "d2010", year: 2010},
  {key: "d2020", year: 2020},
] as const

const CAP = 31

function toNumber(n: string | undefined) {
  if (n == null) return null
  const trimmed = n.trim()
  if (!trimmed || trimmed === "-" || trimmed === "—" || /^n\/?a$/i.test(trimmed)) return null
  const v = Number(trimmed.replace(/[$,%]/g, ""))
  return Number.isFinite(v) ? v : null
}

function formatPct(value: number) {
  const rounded = Math.round(value * 10) / 10
  const body = Math.abs(rounded).toFixed(rounded % 1 === 0 ? 0 : 1)
  return `${rounded < 0 ? "−" : "+"}${body}`
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

export default function DecadeHeatmapChartAnimated({
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
  const theme = getPosterTheme("decade-heatmap", themeSlug)
  const {ref: rootRef, inView} = usePosterInView()
  const kpiT = useKpiT(inView)

  const parsed = useMemo(() => {
    const rows = data
      .filter((row) => (row.role || "row").toLowerCase() === "row")
      .map((row) => {
        const decades = DECADES.map((decade) => toNumber(row[decade.key]))
        return {
          label: (row.label || "").trim(),
          county: (row.county || "").trim(),
          decades,
          mean: toNumber(row.mean) ?? (decades.filter((v): v is number => v != null).reduce((a, b) => a + b, 0) /
            Math.max(1, decades.filter((v) => v != null).length)),
        }
      })
      .filter((row) => row.label)
    const kpis = data
      .filter((row) => (row.role || "").toLowerCase() === "kpi")
      .map((row) => ({
        value: toNumber(row.kpi_value || row.value) || 0,
        label: (row.kpi_detail || row.detail || row.label || "").trim(),
      }))
    const all = rows.flatMap((row) => row.decades.filter((v): v is number => v != null))
    const railMin = Math.min(-20, ...all, 0)
    const railMax = Math.max(40, ...all)
    return {rows, kpis, railMin, railMax}
  }, [data])

  const title = chartTitle || "FASTEST GROWING TOWNSHIPS"
  const eyebrow = yLabel || "WESTERN PENNSYLVANIA"
  const subtitle = xLabel || "Decade percent change from the prior Census"
  const source = caption?.trim() || "Source: U.S. Census Bureau, decennial Census."
  const colorOf = (value: number | null) => {
    if (value == null) return "var(--hr-empty-cell)"
    const t = (Math.max(-CAP, Math.min(CAP, value)) + CAP) / (CAP * 2)
    return interpolatePosterScale(theme.scale, t)
  }
  const inkOf = (value: number | null) => {
    if (value == null) return "var(--hr-empty-text)"
    return Math.abs(value) >= 18 ? "var(--hr-cell-text-light)" : "var(--hr-cell-text-dark)"
  }

  return (
    <figure
      ref={rootRef}
      className={`dh-chart bg-font-roboto ${inView ? "is-in" : ""}`}
      data-theme={theme.slug}
      style={posterThemeStyle(theme)}
      aria-label={title}
    >
      <header className="dh-head">
        <p className="dh-eyebrow">{eyebrow}</p>
        <h3 className="dh-title">{title}</h3>
        <p className="dh-sub">{subtitle}</p>
        <dl className="dh-kpis">
          {parsed.kpis.map((kpi) => (
            <div key={kpi.label} className="dh-kpi">
              <dd>{`${(kpi.value * kpiT).toFixed(1)}%`}</dd>
              <dt>{kpi.label}</dt>
            </div>
          ))}
        </dl>
      </header>

      <div className="dh-panels">
        <div>
          <p className="dh-section">Decade percent change from prior Census</p>
          <div className="dh-heat">
            <div className="dh-heat-row dh-heat-head-row">
              <div className="dh-heat-head" />
              {DECADES.map((decade) => (
                <div key={decade.key} className="dh-q">
                  {decade.year}
                </div>
              ))}
            </div>
            {parsed.rows.map((row, r) => (
              <div key={row.label} className="dh-heat-row">
                <div className="dh-heat-label">
                  <span>{row.label}</span>
                  <span className="dh-county">{row.county}</span>
                </div>
                {row.decades.map((value, c) => (
                  <div
                    key={`${row.label}-${c}`}
                    className="dh-cell"
                    style={
                      {
                        background: colorOf(value),
                        color: inkOf(value),
                        ["--r" as string]: String(r),
                        ["--c" as string]: String(c),
                      } as React.CSSProperties
                    }
                  >
                    {value == null ? "—" : formatPct(value)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="dh-section">5-decade mean change</p>
          <div className="dh-rail">
            {parsed.rows.map((row, r) => {
              const span = parsed.railMax - parsed.railMin || 1
              return (
                <div key={`rail-${row.label}`} className="dh-rail-row">
                  <span className="dh-range-label">
                    {row.label}
                    <span className="dh-county"> {row.county}</span>
                  </span>
                  <div className="dh-axis">
                    {row.decades.map((value, c) =>
                      value == null ? null : (
                        <span
                          key={`${row.label}-dot-${c}`}
                          className="dh-dot"
                          style={
                            {
                              left: `${((value - parsed.railMin) / span) * 100}%`,
                              background: colorOf(value),
                              ["--r" as string]: String(r),
                              ["--c" as string]: String(c),
                            } as React.CSSProperties
                          }
                        />
                      ),
                    )}
                  </div>
                  <span className="dh-mean">{formatPct(row.mean)}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="dh-legend" aria-hidden="true">
        <span>−{CAP}%</span>
        <span className="dh-scale" style={{background: theme.tokens.scale}} />
        <span>+{CAP}%</span>
      </div>

      <figcaption className="dh-caption">
        <p className="dh-caption-label">DECENNIAL CHANGE</p>
        <p className="dh-source">{source}</p>
      </figcaption>
    </figure>
  )
}
