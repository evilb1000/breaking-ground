import { client } from '@/sanity/client'
import type { Metadata } from 'next'

async function fetchDoc(slug: string) {
  const QUERY = `*[_type == "animatedData" && slug.current == $slug][0]{
    title,
    slug,
    chartType,
    xField,
    yFields,
    groupField,
    colors,
    animationDuration,
    animationEasing,
    showAxis,
    showLegend,
    dataFile{asset->{url}}
  }`
  return client.fetch<any>(QUERY, {slug})
}

function parseCsv(text: string) {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length === 0) return {headers: [], rows: []}
  const headers = lines[0].split(',').map((h) => h.trim())
  const rows = lines.slice(1).map((l) => {
    const cols = l.split(',')
    const obj: Record<string, string> = {}
    headers.forEach((h, i) => (obj[h] = (cols[i] ?? '').trim()))
    return obj
  })
  return {headers, rows}
}

function number(n: string | undefined) {
  const v = Number(n)
  return Number.isFinite(v) ? v : 0
}

function BarChart({data, xField, yField, colors}: {data: any[]; xField: string; yField: string; colors?: string[]}) {
  const width = 800
  const height = 420
  const padding = {top: 20, right: 20, bottom: 40, left: 50}
  const innerW = width - padding.left - padding.right
  const innerH = height - padding.top - padding.bottom
  const values = data.map((d) => number(d[yField]))
  const maxV = Math.max(1, ...values)
  const barW = innerW / Math.max(1, data.length)
  const barColor = colors?.[0] || '#111'

  return (
    <svg width={width} height={height} className="mx-auto block">
      <g transform={`translate(${padding.left},${padding.top})`}>
        {data.map((d, i) => {
          const v = number(d[yField])
          const h = (v / maxV) * innerH
          const x = i * barW
          const y = innerH - h
          return <rect key={i} x={x + 4} y={y} width={Math.max(0, barW - 8)} height={h} fill={barColor} rx={4} />
        })}
      </g>
    </svg>
  )
}

export const revalidate = 0

export async function generateMetadata({params}: {params: Promise<{slug: string}>}): Promise<Metadata> {
  const {slug} = await params
  const doc = await fetchDoc(slug)
  return {title: doc?.title ? `${doc.title} • Animated Data` : 'Animated Data'}
}

export default async function DataPage({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params
  const doc = await fetchDoc(slug)
  if (!doc) {
    return <main className="max-w-5xl mx-auto px-6 py-12">Not found</main>
  }
  const url: string | undefined = doc?.dataFile?.asset?.url
  const csv = url ? await fetch(url, {cache: 'no-store'}).then((r) => r.text()) : ''
  const {rows} = parseCsv(csv)
  const xField = doc.xField as string
  const yField = (doc.yFields?.[0] as string) || ''

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="font-serif text-3xl font-bold mb-2">{doc.title}</h1>
      <p className="text-sm text-gray-600 mb-8">Chart: {doc.chartType}</p>
      {doc.chartType === 'bar' ? (
        <BarChart data={rows} xField={xField} yField={yField} colors={doc.colors} />
      ) : (
        <p>Renderer coming soon for chart type: {doc.chartType}</p>
      )}
    </main>
  )
}


