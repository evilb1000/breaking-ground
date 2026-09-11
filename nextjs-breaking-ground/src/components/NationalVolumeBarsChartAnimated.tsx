"use client"

import React, {useMemo} from "react"
import {getPosterTheme, posterThemeStyle} from "@/lib/dataPosters"
import {usePosterInView} from "@/components/usePosterInView"

type Row = Record<string, string>

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

function formatDealCount(value: number) {
  return Math.round(value).toLocaleString("en-US")
}

function niceVolumeMax(value: number) {
  const billions = value / 1e9
  if (billions <= 150) return 150e9
  if (billions <= 180) return 180e9
  if (billions <= 200) return 200e9
  return Math.ceil(billions / 50) * 50 * 1e9
}

export default function NationalVolumeBarsChartAnimated({
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
  const theme = getPosterTheme("national-volume-bars", themeSlug)
  const {ref: rootRef, inView} = usePosterInView()

  const parsed = useMemo(() => {
    const records = data
      .map((row) => ({
        market: (row.market || row.geography || "").trim(),
        year: toNumber(row.year),
        volume: toNumber(row.sales_volume),
        deals: toNumber(row.sales_transactions),
      }))
      .filter((row) => row.year != null && row.volume != null)

    const markets = [...new Set(records.map((row) => row.market).filter(Boolean))]
    const preferred =
      markets.find((name) => /united states|u\.s\.|national/i.test(name)) || markets[0] || ""
    const years = records
      .filter((row) => !preferred || !row.market || row.market === preferred)
      .sort((a, b) => (a.year as number) - (b.year as number))

    const maxVolume = Math.max(1, ...years.map((row) => row.volume as number))
    const yMax = niceVolumeMax(maxVolume)
    const ticks = [0, 50, 100, 150].filter((tick) => tick * 1e9 <= yMax)

    return {years, yMax, ticks}
  }, [data])

  const title = chartTitle || "FIVE YEARS OF INDUSTRIAL SALES"
  const eyebrow = yLabel || "U.S. INDUSTRIAL INVESTMENT"
  const subtitle = xLabel || "Annual U.S. sales volume with completed transaction count"
  const source =
    caption?.trim() ||
    "Source: CoStar Group. Annual totals aggregate quarterly industrial sales data across 230 U.S. markets."

  return (
    <figure
      ref={rootRef}
      className={`nv-chart bg-font-roboto ${inView ? "is-in" : ""}`}
      data-theme={theme.slug}
      style={
        {
          ...posterThemeStyle(theme),
          ["--n" as string]: String(Math.max(1, parsed.years.length)),
        } as React.CSSProperties
      }
      aria-label={title}
    >
      <header className="nv-head">
        <p className="nv-eyebrow">{eyebrow}</p>
        <h3 className="nv-title">{title}</h3>
        <p className="nv-sub">{subtitle}</p>
        <div className="nv-rule" />
      </header>

      <div className="nv-plot">
        <div className="nv-y" aria-hidden="true">
          {parsed.ticks.map((tick) => (
            <span
              key={tick}
              className="nv-tick"
              style={{bottom: `${(tick * 1e9 / parsed.yMax) * 100}%`}}
            >
              ${tick}B
            </span>
          ))}
        </div>
        <div className="nv-main">
          <div className="nv-stage">
            {parsed.ticks.map((tick) => (
              <span
                key={`grid-${tick}`}
                className="nv-grid"
                style={{bottom: `${(tick * 1e9 / parsed.yMax) * 100}%`}}
              />
            ))}
            <div className="nv-cols">
              {parsed.years.map((row, index) => {
                const latest = index === parsed.years.length - 1
                const height = ((row.volume as number) / parsed.yMax) * 100
                return (
                  <div
                    key={row.year}
                    className={`nv-col${latest ? " is-latest" : ""}`}
                    style={
                      {
                        ["--i" as string]: String(index),
                        ["--h" as string]: `${height}%`,
                      } as React.CSSProperties
                    }
                  >
                    <div className="nv-track">
                      <span className="nv-val">{formatBillions(row.volume as number)}</span>
                      <span className="nv-bar" />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="nv-feet">
            {parsed.years.map((row) => (
              <div key={`foot-${row.year}`} className="nv-foot">
                <span className="nv-year">{row.year}</span>
                <span className="nv-deals">
                  {row.deals != null ? (
                    <>
                      <span className="nv-deals-n">{formatDealCount(row.deals)}</span>
                      <span className="nv-deals-l">DEALS</span>
                    </>
                  ) : null}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <figcaption className="nv-caption">
        <p className="nv-caption-label">ANNUAL SALES VOLUME</p>
        <p className="nv-source">{source}</p>
      </figcaption>
    </figure>
  )
}
