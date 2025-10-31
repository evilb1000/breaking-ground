"use client"
import React, {useEffect, useState} from 'react'
import {createClient} from '@sanity/client'
import AnimatedBarClient from '@/components/AnimatedBarClient'

type Doc = any

const client = createClient({
  projectId: 'y9xwdi89',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})

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
      const d = await client.fetch<Doc>(`*[_id == $id][0]{
        chartType, xField, yFields, colors,
        animationDuration, chartTitle, xLabel, yLabel,
        showAxis, showTicks, tickCount,
        dataFile{asset->{url}}
      }`, {id})
      setDoc(d || null)
      const url: string | undefined = d?.dataFile?.asset?.url
      if (url) {
        const txt = await fetch(url).then((r) => r.text()).catch(() => '')
        const lines = txt.trim().split(/\r?\n/)
        const headers = lines[0]?.split(',')?.map((h) => h.trim()) || []
        const parsed = lines.slice(1).map((l) => {
          const cols = l.split(',')
          const obj: Record<string, string> = {}
          headers.forEach((h, i) => (obj[h] = (cols[i] ?? '').trim()))
          return obj
        })
        setRows(parsed)
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
      ) : (
        <p className="text-gray-600 text-sm">Chart type “{doc.chartType}” not implemented.</p>
      )}
    </div>
  )
}


