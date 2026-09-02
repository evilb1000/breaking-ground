"use client"

import React, {useEffect, useMemo, useRef, useState} from "react"
import {getPosterTheme, posterThemeStyle} from "@/lib/dataPosters"

type Row = Record<string, string>
type Point = {x: number; y: number}

const META = new Set(["day", "date", "is_estimate"])
const FALLBACK = ["#ff4ec8", "#3ee0c5", "#5ad4ff", "#ff8a3d", "#b56bff", "#f0c44c", "#4d7cff", "#c5cdd6", "#8b949e"]
const NEG = "#ff4b5c"

function toNumber(n: string | undefined) {
  if (n == null) return null
  const trimmed = n.trim()
  if (!trimmed || trimmed === "-" || trimmed === "—" || /^n\/?a$/i.test(trimmed)) return null
  const v = Number(trimmed.replace(/[$,%]/g, ""))
  return Number.isFinite(v) ? v : null
}

function formatPct(value: number, digits = 1) {
  const rounded = Number(value.toFixed(digits))
  if (Object.is(rounded, -0) || rounded === 0) return "0%"
  const abs = Math.abs(rounded).toFixed(digits).replace(/\.0$/, "")
  return `${rounded > 0 ? "+" : "-"}${abs}%`
}

function niceDomain(min: number, max: number): [number, number] {
  const lo = Math.min(-4, Math.floor((min - 0.2) / 2) * 2)
  const hi = Math.max(4, Math.ceil((max + 0.2) / 2) * 2)
  return [lo, hi]
}

function yTicks(min: number, max: number) {
  const out: number[] = []
  for (let v = min; v <= max + 0.001; v += 2) out.push(Number(v.toFixed(2)))
  return out
}

function linePath(points: Point[]) {
  if (points.length < 2) return ""
  return points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ")
}

export default function IndexedLinesChartAnimated({
  data,
  xField = "day",
  yFields,
  duration = 1800,
  chartTitle,
  xLabel,
  theme: themeSlug,
}: {
  data: Row[]
  xField?: string
  yFields?: string[]
  duration?: number
  chartTitle?: string
  xLabel?: string
  theme?: string
}) {
  const theme = getPosterTheme("indexed-lines", themeSlug)
  const rootRef = useRef<HTMLElement | null>(null)
  const [inView, setInView] = useState(false)

  const parsed = useMemo(() => {
    const keys = Object.keys(data[0] || {})
    const requested = (yFields || []).filter((field) => field && keys.includes(field))
    const names = requested.length
      ? requested
      : keys.filter((key) => !META.has(key.toLowerCase()) && key !== xField)
    const rows = data
      .map((row) => {
        const day = toNumber(row.day ?? row[xField])
        if (day == null) return null
        const values: Record<string, number | null> = {}
        for (const name of names) values[name] = toNumber(row[name])
        return {
          day,
          estimate: /^(yes|true|1)$/i.test(row.is_estimate || ""),
          values,
        }
      })
      .filter((row): row is NonNullable<typeof row> => Boolean(row))

    const nums = rows.flatMap((row) => names.map((name) => row.values[name]).filter((v): v is number => v != null))
    const [yMin, yMax] = niceDomain(Math.min(0, ...nums), Math.max(0, ...nums))
    const xMax = rows[rows.length - 1]?.day ?? 1
    const lastRealDay = [...rows].reverse().find((row) => !row.estimate)?.day ?? xMax
    const finishes = names
      .map((name, index) => {
        const last = [...rows].reverse().find((row) => row.values[name] != null)
        return {
          name,
          value: last?.values[name] ?? 0,
          color: theme.series?.[name] || FALLBACK[index % FALLBACK.length],
        }
      })
      .sort((a, b) => b.value - a.value)

    return {names, rows, yMin, yMax, xMax, lastRealDay, finishes}
  }, [data, theme.series, xField, yFields])

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced) {
      setInView(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => setInView(entries.some((entry) => entry.isIntersecting)),
      {threshold: 0.22},
    )
    observer.observe(el)
    const fallback = window.setTimeout(() => setInView(true), 600)
    return () => {
      observer.disconnect()
      window.clearTimeout(fallback)
    }
  }, [])

  const width = 500
  const height = 268
  const pad = {top: 8, right: 8, bottom: 22, left: 36}
  const innerW = width - pad.left - pad.right
  const innerH = height - pad.top - pad.bottom
  const xOf = (day: number) => pad.left + (day / Math.max(1, parsed.xMax)) * innerW
  const yOf = (value: number) => pad.top + ((parsed.yMax - value) / (parsed.yMax - parsed.yMin || 1)) * innerH
  const xTicks = [0, 60, 120, 180, 240, 300, 365, parsed.xMax].filter(
    (v, i, arr) => v <= parsed.xMax && arr.indexOf(v) === i,
  )

  const title = chartTitle || "Allegheny County YoY Rent Growth by Submarket"
  const subtitle = xLabel || "Daily asking rent per SF indexed to 0% on July 1, 2025"

  return (
    <figure
      ref={rootRef}
      className={`il-chart bg-font-roboto ${inView ? "is-in" : ""}`}
      data-theme={theme.slug}
      style={{...posterThemeStyle(theme), ["--il-dur" as string]: `${duration}ms`}}
      aria-label={title}
    >
      <header>
        <h3 className="il-title">{title}</h3>
        <p className="il-sub">{subtitle}</p>
      </header>

      <div className="il-body">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="il-svg"
          role="img"
          fill="none"
        >
          {yTicks(parsed.yMin, parsed.yMax).map((tick) => {
            const y = yOf(tick)
            return (
              <g key={tick}>
                <line
                  x1={pad.left}
                  x2={width - pad.right}
                  y1={y}
                  y2={y}
                  stroke={tick === 0 ? "rgba(255,255,255,0.34)" : "rgba(255,255,255,0.08)"}
                  strokeWidth={tick === 0 ? 1.2 : 1}
                />
                <text
                  x={pad.left - 6}
                  y={y + 3}
                  textAnchor="end"
                  fill={tick < 0 ? NEG : "#8b95a3"}
                  fontSize="8"
                  fontWeight={tick < 0 ? 800 : 600}
                >
                  {tick === 0 ? "0%" : formatPct(tick, 0)}
                </text>
              </g>
            )
          })}
          {xTicks.map((tick) => (
            <text key={tick} x={xOf(tick)} y={height - 4} textAnchor="middle" fill="#8b95a3" fontSize="8" fontWeight={600}>
              {tick === 0 ? "Day 0" : tick}
            </text>
          ))}
          {parsed.names.map((name, index) => {
            const color = theme.series?.[name] || FALLBACK[index % FALLBACK.length]
            const solid: Point[] = []
            const tail: Point[] = []
            for (const row of parsed.rows) {
              const value = row.values[name]
              if (value == null) continue
              const point = {x: xOf(row.day), y: yOf(value)}
              if (row.day <= parsed.lastRealDay) solid.push(point)
              if (row.day >= parsed.lastRealDay) tail.push(point)
            }
            return (
              <g key={name}>
                {solid.length > 1 ? (
                  <path
                    d={linePath(solid)}
                    className="il-stroke"
                    fill="none"
                    stroke={color}
                    strokeWidth="1.7"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    pathLength={1}
                    style={{["--i" as string]: String(index)}}
                  />
                ) : null}
                {tail.length > 1 ? (
                  <path
                    d={linePath(tail)}
                    className="il-est"
                    fill="none"
                    stroke={color}
                    strokeWidth="1.4"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    strokeDasharray="3 3"
                  />
                ) : null}
              </g>
            )
          })}
        </svg>

        <ol className="il-rank">
          {parsed.finishes.map((item) => (
            <li key={item.name} style={{color: item.color}}>
              <span className="il-pip" style={{background: item.color}} />
              <span className="il-rank-name">{item.name}</span>
              <span className="il-rank-val">{formatPct(item.value)}</span>
            </li>
          ))}
        </ol>
      </div>

      <p className="il-source">
        Source: CoStar daily asking rent per SF · July 1, 2025–July 20, 2026 · Dashed tail is the July 20 estimate
      </p>
    </figure>
  )
}
