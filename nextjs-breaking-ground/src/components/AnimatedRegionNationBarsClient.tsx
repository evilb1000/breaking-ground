"use client"

import React from "react"
import RegionNationBarsChartAnimated from "./RegionNationBarsChartAnimated"

type Row = Record<string, string>

export default function AnimatedRegionNationBarsClient({
  data,
  duration,
  chartTitle,
  xLabel,
  caption,
  theme,
}: {
  data: Row[]
  duration?: number
  chartTitle?: string
  xLabel?: string
  caption?: string
  theme?: string
}) {
  return (
    <RegionNationBarsChartAnimated
      data={data}
      duration={duration}
      chartTitle={chartTitle}
      xLabel={xLabel}
      caption={caption}
      theme={theme}
    />
  )
}
