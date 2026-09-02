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
  theme,
}: {
  data: Row[]
  xField: string
  yFields?: string[]
  duration?: number
  chartTitle?: string
  xLabel?: string
  yLabel?: string
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
      theme={theme}
    />
  )
}
