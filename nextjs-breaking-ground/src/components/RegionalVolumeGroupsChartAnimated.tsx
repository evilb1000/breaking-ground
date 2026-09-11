"use client"

import React, {useMemo} from "react"
import {getPosterTheme, posterThemeStyle} from "@/lib/dataPosters"
import {usePosterInView} from "@/components/usePosterInView"

type Row = Record<string, string>

const REGION_ORDER = ["West Coast", "Southwest", "Midwest", "South", "Northeast"]

function toNumber(n: string | undefined) {
  if (n == null) return null
  const trimmed = n.trim()
  if (!trimmed || trimmed === "-" || trimmed === "—" || /^n\/?a$/i.test(trimmed)) return null
  const v = Number(trimmed.replace(/[$,]/g, ""))
  return Number.isFinite(v) ? v : null
}

function formatBillions(value: number) {
  const billions = value / 1e9
  const rounded = Math.round(billions * 10) / 10
  return `$${rounded.toFixed(1)}B`
}

function formatDeals(value: number) {
  return Math.round(value).toLocaleString("en-US")
}

function niceVolumeMax(value: number) {
  const billions = value / 1e9
  if (billions <= 40) return 50e9
  if (billions <= 50) return 50e9
  return Math.ceil(billions / 10) * 10 * 1e9
}

export default function RegionalVolumeGroupsChartAnimated({
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
  const theme = getPosterTheme("regional-volume-groups", themeSlug)
  const {ref: rootRef, inView} = usePosterInView()

  const parsed = useMemo(() => {
    const records = data
      .map((row) => ({
        region: (row.region || row.geography || "").trim(),
        year: toNumber(row.year),
        volume: toNumber(row.sales_volume),
        deals: toNumber(row.sales_transactions),
      }))
      .filter((row) => row.region && row.year != null && row.volume != null)

    const named = REGION_ORDER.filter((name) => records.some((row) => row.region === name))
    const extra = [...new Set(records.map((row) => row.region))].filter((name) => !named.includes(name))
    const regions = [...named, ...extra]
    const years = [...new Set(records.map((row) => row.year as number))].sort((a, b) => a - b)
    const groups = regions.map((region) => ({
      region,
      years: years.map((year) => {
        const hit = records.find((row) => row.region === region && row.year === year)
        return {year, volume: hit?.volume ?? 0, deals: hit?.deals ?? null}
      }),
    }))

    const maxVolume = Math.max(1, ...records.map((row) => row.volume as number))
    const yMax = niceVolumeMax(maxVolume)
    const ticks = [0, 10, 20, 30, 40].filter((tick) => tick * 1e9 <= yMax)

    return {groups, years, yMax, ticks}
  }, [data])

  const title = chartTitle || "FIVE-YEAR INDUSTRIAL SALES BY REGION"
  const eyebrow = yLabel || "U.S. INDUSTRIAL INVESTMENT"
  const subtitle = xLabel || "Annual sales volume and completed transaction count · 2021–2025"
  const source =
    caption?.trim() ||
    "Source: CoStar Group. Regional totals aggregate quarterly industrial market data across 230 U.S. markets."

  return (
    <figure
      ref={rootRef}
      className={`rg-chart bg-font-roboto ${inView ? "is-in" : ""}`}
      data-theme={theme.slug}
      style={posterThemeStyle(theme)}
      aria-label={title}
    >
      <header className="rg-head">
        <p className="rg-eyebrow">{eyebrow}</p>
        <h3 className="rg-title">{title}</h3>
        <p className="rg-sub">{subtitle}</p>
        <div className="rg-rule" />
      </header>

      <div className="rg-plot">
        <div className="rg-y" aria-hidden="true">
          {parsed.ticks.map((tick) => (
            <span
              key={tick}
              className="rg-tick"
              style={{bottom: `${(tick * 1e9 / parsed.yMax) * 100}%`}}
            >
              ${tick}B
            </span>
          ))}
        </div>
        <div className="rg-main">
          <div className="rg-stage">
            {parsed.ticks.map((tick) => (
              <span
                key={`grid-${tick}`}
                className="rg-grid"
                style={{bottom: `${(tick * 1e9 / parsed.yMax) * 100}%`}}
              />
            ))}
            <div className="rg-groups">
              {parsed.groups.map((group, groupIndex) => (
                <div
                  key={group.region}
                  className="rg-group"
                  style={{["--g" as string]: String(groupIndex)} as React.CSSProperties}
                >
                  <div className="rg-cols">
                    {group.years.map((row, index) => {
                      const latest = index === group.years.length - 1
                      const height = (row.volume / parsed.yMax) * 100
                      return (
                        <div
                          key={`${group.region}-${row.year}`}
                          className={`rg-col${latest ? " is-latest" : ""}`}
                          style={
                            {
                              ["--i" as string]: String(index),
                              ["--h" as string]: `${height}%`,
                            } as React.CSSProperties
                          }
                        >
                          <div className="rg-track">
                            <span className="rg-val">{formatBillions(row.volume)}</span>
                            <span className="rg-bar" />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="rg-feet">
                    {group.years.map((row) => (
                      <div key={`${group.region}-foot-${row.year}`} className="rg-foot">
                        <span className="rg-year">{row.year}</span>
                        <span className="rg-deals">{row.deals != null ? formatDeals(row.deals) : ""}</span>
                      </div>
                    ))}
                  </div>
                  <p className="rg-name">{group.region}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <figcaption className="rg-caption">
        <p className="rg-caption-label">
          BAR LABELS: ANNUAL SALES VOLUME · FIGURES BELOW EACH YEAR: TOTAL DEALS
        </p>
        <p className="rg-source">{source}</p>
      </figcaption>
    </figure>
  )
}
