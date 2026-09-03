"use client"
import React, {useEffect, useState} from 'react'
import AnimatedBarClient from '@/components/AnimatedBarClient'
import AnimatedPieClient from '@/components/AnimatedPieClient'
import AnimatedLineClient from '@/components/AnimatedLineClient'
import AnimatedDonutClient from '@/components/AnimatedDonutClient'
import AnimatedComboClient from '@/components/AnimatedComboClient'
import AnimatedHeatmapRangeClient from '@/components/AnimatedHeatmapRangeClient'
import AnimatedIndexedLinesClient from '@/components/AnimatedIndexedLinesClient'
import AnimatedRegionNationBarsClient from '@/components/AnimatedRegionNationBarsClient'
import type {ComboSeriesConfig} from '@/components/ComboChartAnimated'

type Doc = any

export default function ChartFromRefClient({
  id,
  align,
  size,
}: {
  id: string
  align?: 'left' | 'right' | 'center'
  size?: 'small' | 'medium' | 'large' | 'full'
}) {
  const [doc, setDoc] = useState<Doc | null>(null)
  const [rows, setRows] = useState<Array<Record<string, string>>>([])

  useEffect(() => {
    if (!id) return
    const fetchDoc = async () => {
      try {
        const res = await fetch(`/api/chart/${id}`)
        if (!res.ok) {
          console.error('Failed to fetch chart:', res.statusText)
          return
        }
        const d = await res.json() as Doc & {csvData?: Array<Record<string, string>>}
        setDoc(d || null)
        // Use parsed CSV data from API (fetched server-side, no CORS issues)
        if (d?.csvData) {
          setRows(d.csvData)
        }
      } catch (error) {
        console.error('Error fetching chart:', error)
      }
    }
    fetchDoc()
  }, [id])

  if (!doc) return null

  const yField = (doc.yFields?.[0] as string) || ''
  const yFields = Array.isArray(doc.yFields) ? (doc.yFields as string[]).filter(Boolean) : []
  const seriesConfig = Array.isArray(doc.seriesConfig)
    ? (doc.seriesConfig as ComboSeriesConfig[]).filter((series) => series.field)
    : []
  const comboSeriesConfig = seriesConfig.length
    ? seriesConfig
    : yFields.slice(0, 2).map((field, index) => ({
        field,
        renderAs: index === 0 ? 'bar' : 'line',
        axis: index === 0 ? 'left' : 'right',
      } satisfies ComboSeriesConfig))
  const widthClass =
    size === 'small'
      ? 'w-full max-w-full md:max-w-[25%]'
      : size === 'medium'
        ? 'w-full max-w-full md:max-w-[50%]'
        : size === 'large'
          ? 'w-full max-w-full md:max-w-[75%]'
          : 'w-full max-w-full'
  const alignClass =
    align === 'left'
      ? 'mx-auto my-8 block md:float-left md:mr-8 md:mb-6 md:my-0'
      : align === 'right'
        ? 'mx-auto my-8 block md:float-right md:ml-8 md:mb-6 md:my-0'
        : 'mx-auto my-8 block'

  return (
    <div className={`${widthClass} ${alignClass}`}>
      {doc.chartType === 'bar' ? (
        <AnimatedBarClient
          data={rows}
          xField={doc.xField}
          yField={yField}
          colors={doc.colors}
          duration={doc.animationDuration ?? 1200}
          chartTitle={doc.chartTitle}
          xLabel={doc.xLabel}
          yLabel={doc.yLabel}
          showAxis={doc.showAxis ?? true}
          showTicks={doc.showTicks ?? true}
          tickCount={doc.tickCount ?? 5}
        />
      ) : doc.chartType === 'pie' ? (
        <AnimatedPieClient
          data={rows}
          xField={doc.xField}
          yField={yField}
          colors={doc.colors}
          duration={doc.animationDuration ?? 1200}
          chartTitle={doc.chartTitle}
          showLegend={doc.showLegend ?? true}
        />
      ) : doc.chartType === 'donut' ? (
        <AnimatedDonutClient
          data={rows}
          xField={doc.xField}
          yField={yField}
          colors={doc.colors}
          duration={doc.animationDuration ?? 1200}
          chartTitle={doc.chartTitle}
          numberFormat={doc.numberFormat}
          showLegend={doc.showLegend ?? true}
        />
      ) : doc.chartType === 'line' ? (
        <AnimatedLineClient
          data={rows}
          xField={doc.xField}
          yFields={yFields.length ? yFields : [yField]}
          colors={doc.colors}
          duration={doc.animationDuration ?? 1200}
          chartTitle={doc.chartTitle}
          xLabel={doc.xLabel}
          yLabel={doc.yLabel}
          showAxis={doc.showAxis ?? true}
          showTicks={doc.showTicks ?? true}
          tickCount={doc.tickCount ?? 5}
        />
      ) : doc.chartType === 'combo' ? (
        <AnimatedComboClient
          data={rows}
          xField={doc.xField}
          seriesConfig={comboSeriesConfig}
          colors={doc.colors}
          duration={doc.animationDuration ?? 1200}
          chartTitle={doc.chartTitle}
          xLabel={doc.xLabel}
          yLabel={doc.yLabel}
          showAxis={doc.showAxis ?? true}
          showTicks={doc.showTicks ?? true}
          tickCount={doc.tickCount ?? 5}
        />
      ) : doc.chartType === 'heatmapRange' ? (
        <AnimatedHeatmapRangeClient
          data={rows}
          xField={doc.xField}
          yFields={yFields}
          duration={doc.animationDuration ?? 1200}
          chartTitle={doc.chartTitle}
          xLabel={doc.xLabel}
          yLabel={doc.yLabel}
          theme={doc.posterTheme}
        />
      ) : doc.chartType === 'indexedLines' ? (
        <AnimatedIndexedLinesClient
          data={rows}
          xField={doc.xField}
          yFields={yFields}
          duration={doc.animationDuration ?? 2200}
          chartTitle={doc.chartTitle}
          xLabel={doc.xLabel}
          theme={doc.posterTheme}
        />
      ) : doc.chartType === 'regionNationBars' ? (
        <AnimatedRegionNationBarsClient
          data={rows}
          duration={doc.animationDuration ?? 1800}
          chartTitle={doc.chartTitle}
          xLabel={doc.xLabel}
          theme={doc.posterTheme}
        />
      ) : (
        <p className="text-gray-600 text-sm">Chart type "{doc.chartType}" not implemented.</p>
      )}
    </div>
  )
}


