import {NextRequest, NextResponse} from 'next/server'

export const revalidate = 0

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('u')
  if (!url) return NextResponse.json({error: 'Missing u param'}, {status: 400})
  try {
    const res = await fetch(url, {cache: 'no-store'})
    if (!res.ok) return NextResponse.json({error: `Upstream ${res.status}`}, {status: 502})
    const json = await res.json()
    return NextResponse.json(json, {
      headers: {'Cache-Control': 'no-store'},
    })
  } catch (e: any) {
    return NextResponse.json({error: e?.message || 'Fetch failed'}, {status: 500})
  }
}


