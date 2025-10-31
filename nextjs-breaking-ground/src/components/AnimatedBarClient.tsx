"use client"
import React from 'react'
import BarChartAnimated from './BarChartAnimated'

type Row = Record<string, string>

export default function AnimatedBarClient({
  data,
  xField,
  yField,
  colors,
  duration,
}: {
  data: Row[]
  xField: string
  yField: string
  colors?: string[]
  duration?: number
}) {
  return (
    <BarChartAnimated
      data={data}
      xField={xField}
      yField={yField}
      colors={colors}
      duration={duration}
    />
  )
}


