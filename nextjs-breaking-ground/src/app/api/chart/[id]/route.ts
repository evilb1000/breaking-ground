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
    const doc = await client.fetch(`*[_id == $id && _type in ["chartData", "animatedData"]][0]{
      chartType, xField, yFields, colors,
      animationDuration, chartTitle, xLabel, yLabel,
      showAxis, showTicks, tickCount, showLegend,
      dataFile{asset->{url}}
    }`, {id})

    if (!doc) {
      return NextResponse.json({error: 'Chart not found'}, {status: 404})
    }

    return NextResponse.json(doc)
  } catch (error) {
    console.error('Error fetching chart:', error)
    return NextResponse.json({error: 'Failed to fetch chart'}, {status: 500})
  }
}

