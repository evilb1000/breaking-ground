import {client} from '@/sanity/client'
import {NextResponse} from 'next/server'

export async function GET(
  request: Request,
  {params}: {params: Promise<{id: string}>}
) {
  const {id} = await params
  if (!id) {
    return NextResponse.json({error: 'Missing chart ID'}, {status: 400})
  }

  try {
    const doc = await client.fetch(`*[_id == $id && _type == "chartData"][0]{
      chartType, xField, yFields, seriesConfig, colors,
      animationDuration, chartTitle, xLabel, yLabel,
      showAxis, showTicks, tickCount, numberFormat, showLegend,
      dataFile{asset->{url}}
    }`, {id})

    if (!doc) {
      return NextResponse.json({error: 'Chart not found'}, {status: 404})
    }

    // Fetch and parse CSV server-side to avoid CORS
    const url: string | undefined = doc?.dataFile?.asset?.url
    let csvData: Array<Record<string, string>> = []
    
    if (url) {
      try {
        const csvResponse = await fetch(url)
        if (csvResponse.ok) {
          const csvText = await csvResponse.text()
          const lines = csvText.trim().split(/\r?\n/)
          const headers = lines[0]?.split(',')?.map((h: string) => h.trim()) || []
          csvData = lines.slice(1).map((l: string) => {
            const cols = l.split(',')
            const obj: Record<string, string> = {}
            headers.forEach((h, i) => (obj[h] = (cols[i] ?? '').trim()))
            return obj
          })
        }
      } catch (csvError) {
        console.error('Error fetching CSV:', csvError)
      }
    }

    return NextResponse.json({
      ...doc,
      csvData, // Include parsed CSV data
    })
  } catch (error) {
    console.error('Error fetching chart:', error)
    return NextResponse.json({error: 'Failed to fetch chart'}, {status: 500})
  }
}

