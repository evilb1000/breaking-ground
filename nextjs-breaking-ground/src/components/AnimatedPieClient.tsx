"use client"
import React from 'react'
import PieChartAnimated from './PieChartAnimated'

type Row = Record<string, string>

export default function AnimatedPieClient({
  data,
  xField,
  yField,
  colors,
  duration,
  chartTitle,
  showLegend,
}: {
  data: Row[]
  xField: string
  yField: string
  colors?: string[]
  duration?: number
  chartTitle?: string
  showLegend?: boolean
}) {
  return (
    <PieChartAnimated
      data={data}
      xField={xField}
      yField={yField}
      colors={colors}
      duration={duration}
      chartTitle={chartTitle}
      showLegend={showLegend}
    />
  )
}

