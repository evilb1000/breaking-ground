"use client"
import React from 'react'
import LineChartAnimated from './LineChartAnimated'

type Row = Record<string, string>

export default function AnimatedLineClient({
  data,
  xField,
  yField,
  colors,
  duration,
  chartTitle,
  xLabel,
  yLabel,
  showAxis,
  showTicks,
  tickCount,
}: {
  data: Row[]
  xField: string
  yField: string
  colors?: string[]
  duration?: number
  chartTitle?: string
  xLabel?: string
  yLabel?: string
  showAxis?: boolean
  showTicks?: boolean
  tickCount?: number
}) {
  return (
    <LineChartAnimated
      data={data}
      xField={xField}
      yField={yField}
      colors={colors}
      duration={duration}
      chartTitle={chartTitle}
      xLabel={xLabel}
      yLabel={yLabel}
      showAxis={showAxis}
      showTicks={showTicks}
      tickCount={tickCount}
    />
  )
}

