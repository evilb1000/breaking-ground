import {NextRequest, NextResponse} from 'next/server'

export const revalidate = 0

export async function GET(req: NextRequest) {
  const rawUrl = req.nextUrl.searchParams.get('u')
  if (!rawUrl) return NextResponse.json({error: 'Missing u param'}, {status: 400})

  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    return NextResponse.json({error: 'Invalid URL'}, {status: 400})
  }

  if (url.protocol !== 'https:' || url.hostname !== 'cdn.sanity.io') {
    return NextResponse.json({error: 'URL not allowed'}, {status: 403})
  }

  try {
    const res = await fetch(url.toString(), {cache: 'no-store'})
    if (!res.ok) return NextResponse.json({error: 'Upstream fetch failed'}, {status: 502})
    const json = await res.json()
    return NextResponse.json(json, {
      headers: {
        'Cache-Control': 'no-store',
      },
    })
  } catch {
    return NextResponse.json({error: 'Fetch failed'}, {status: 500})
  }
}


