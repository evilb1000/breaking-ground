"use client"

import React from "react"
import RollingAverageLineChartAnimated from "./RollingAverageLineChartAnimated"

type Row = Record<string, string>

export default function AnimatedRollingAverageLineClient({
  data,
  duration,
  chartTitle,
  xLabel,
  yLabel,
  caption,
  theme,
}: {
  data: Row[]
  duration?: number
  chartTitle?: string
  xLabel?: string
  yLabel?: string
  caption?: string
  theme?: string
}) {
  return (
    <RollingAverageLineChartAnimated
      data={data}
      duration={duration}
      chartTitle={chartTitle}
      xLabel={xLabel}
      yLabel={yLabel}
      caption={caption}
      theme={theme}
    />
  )
}
