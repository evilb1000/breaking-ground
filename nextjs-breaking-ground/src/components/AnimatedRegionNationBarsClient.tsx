"use client"

import React from "react"
import RegionNationBarsChartAnimated from "./RegionNationBarsChartAnimated"

type Row = Record<string, string>

export default function AnimatedRegionNationBarsClient({
  data,
  duration,
  chartTitle,
  xLabel,
  theme,
}: {
  data: Row[]
  duration?: number
  chartTitle?: string
  xLabel?: string
  theme?: string
}) {
  return (
    <RegionNationBarsChartAnimated
      data={data}
      duration={duration}
      chartTitle={chartTitle}
      xLabel={xLabel}
      theme={theme}
    />
  )
}
