"use client"

import React from "react"
import HeatmapRangeChartAnimated from "./HeatmapRangeChartAnimated"

type Row = Record<string, string>

export default function AnimatedHeatmapRangeClient({
  data,
  xField,
  yFields,
  duration,
  chartTitle,
  xLabel,
  yLabel,
  caption,
  theme,
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
  return (
    <HeatmapRangeChartAnimated
      data={data}
      xField={xField}
      yFields={yFields}
      duration={duration}
      chartTitle={chartTitle}
      xLabel={xLabel}
      yLabel={yLabel}
      caption={caption}
      theme={theme}
    />
  )
}
