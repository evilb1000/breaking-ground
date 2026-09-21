"use client"

import React from "react"
import DecadeLinesChartAnimated from "./DecadeLinesChartAnimated"

type Row = Record<string, string>

export default function AnimatedDecadeLinesClient({
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
    <DecadeLinesChartAnimated
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
