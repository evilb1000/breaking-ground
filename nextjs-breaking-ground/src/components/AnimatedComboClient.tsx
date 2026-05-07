"use client"
import React from 'react'
import ComboChartAnimated, {type ComboSeriesConfig} from './ComboChartAnimated'

type Row = Record<string, string>

export default function AnimatedComboClient({
  data,
  xField,
  seriesConfig,
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
  seriesConfig: ComboSeriesConfig[]
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
    <ComboChartAnimated
      data={data}
      xField={xField}
      seriesConfig={seriesConfig}
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
