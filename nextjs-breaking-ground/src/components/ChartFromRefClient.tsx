"use client"
import React, {useEffect, useState} from 'react'
import AnimatedBarClient from '@/components/AnimatedBarClient'
import AnimatedPieClient from '@/components/AnimatedPieClient'
import AnimatedLineClient from '@/components/AnimatedLineClient'

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
  const widthClass = size === 'small' ? 'max-w-[25%]' : size === 'medium' ? 'max-w-[50%]' : size === 'large' ? 'max-w-[75%]' : 'max-w-full'
  const alignClass = align === 'left' ? 'float-left mr-8 mb-6' : align === 'right' ? 'float-right ml-8 mb-6' : 'mx-auto my-8 block'

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
      ) : doc.chartType === 'line' ? (
        <AnimatedLineClient
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
      ) : (
        <p className="text-gray-600 text-sm">Chart type "{doc.chartType}" not implemented.</p>
      )}
    </div>
  )
}


