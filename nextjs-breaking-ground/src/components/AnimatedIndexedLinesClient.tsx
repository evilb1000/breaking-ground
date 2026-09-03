"use client"

import React from "react"
import IndexedLinesChartAnimated from "./IndexedLinesChartAnimated"

type Row = Record<string, string>

export default function AnimatedIndexedLinesClient({
  data,
  xField,
  yFields,
  duration,
  chartTitle,
  xLabel,
  caption,
  theme,
}: {
  data: Row[]
  xField?: string
  yFields?: string[]
  duration?: number
  chartTitle?: string
  xLabel?: string
  caption?: string
  theme?: string
}) {
  return (
    <IndexedLinesChartAnimated
      data={data}
      xField={xField}
      yFields={yFields}
      duration={duration}
      chartTitle={chartTitle}
      xLabel={xLabel}
      caption={caption}
      theme={theme}
    />
  )
}
