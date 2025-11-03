"use client"
import React, {useEffect, useRef} from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
// Using native Mapbox layers for reliability; deck.gl overlay removed

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

export default function MapEmbedClient({dataUrl, valueProperty, heightScale = 1}: {dataUrl: string; valueProperty?: string; heightScale?: number}) {
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!dataUrl) return
    let map: mapboxgl.Map | null = null
    let cleanup: (() => void) | null = null

    async function init() {
      const res = await fetch(dataUrl)
      const geojson = await res.json()

      map = new mapboxgl.Map({
        container: container.current as HTMLDivElement,
        style: 'mapbox://styles/mapbox/light-v10',
        center: [-79.9959, 40.4406],
        zoom: 10,
        pitch: 65,
        bearing: 30,
        antialias: true,
      })

      map.on('load', () => {
        // Ensure obvious 3D perspective
        map!.setPitch(65)
        map!.setBearing(30)

        // Add source
        if (!map!.getSource('data')) {
          map!.addSource('data', {type: 'geojson', data: geojson as any})
        }

        // Fit to bounds
        try {
          const bounds = new mapboxgl.LngLatBounds()
          const addToBounds = (g: any) => {
            const t = g.type
            if (t === 'Point') bounds.extend(g.coordinates as [number, number])
            if (t === 'MultiPoint') (g.coordinates as [number, number][]).forEach((c) => bounds.extend(c))
            if (t === 'LineString' || t === 'MultiLineString' || t === 'Polygon' || t === 'MultiPolygon') {
              const flat = JSON.stringify(g.coordinates).match(/-?\d+\.?\d*/g)?.map(Number) || []
              for (let i = 0; i < flat.length; i += 2) bounds.extend([flat[i], flat[i + 1]] as [number, number])
            }
          }
          const iterate = (feat: any) => addToBounds(feat.geometry)
          if (geojson.type === 'FeatureCollection') geojson.features.forEach(iterate)
          else if (geojson.type === 'Feature') iterate(geojson)
          if (!bounds.isEmpty()) {
            map!.fitBounds(bounds, {padding: 60, duration: 800})
            map!.easeTo({pitch: 65, bearing: 30, duration: 800})
          }
        } catch {}

        const hasPolygon = JSON.stringify(geojson).includes('Polygon')
        const hasLine = JSON.stringify(geojson).includes('LineString')
        const hasPoint = JSON.stringify(geojson).includes('Point')

        if (hasPolygon && !map!.getLayer('fill-extrusion')) {
          map!.addLayer({
            id: 'fill-extrusion',
            type: 'fill-extrusion',
            source: 'data',
            paint: {
              'fill-extrusion-color': '#e24a3f',
              // Use a numeric property for height: height | value | votes (fallback 0)
              // Scale up for visual punch; adjust scale as needed
              'fill-extrusion-height': [
                '*',
                ['coalesce', ['get', valueProperty || ''], ['get', 'height'], ['get', 'value'], ['get', 'votes'], 0],
                heightScale
              ],
              'fill-extrusion-opacity': 0.8,
            },
          })
        }
        if (hasLine && !map!.getLayer('lines')) {
          map!.addLayer({
            id: 'lines',
            type: 'line',
            source: 'data',
            paint: {
              'line-color': '#0d47a1',
              'line-width': 2,
            },
          })
        }
        if (hasPoint && !map!.getLayer('points')) {
          map!.addLayer({
            id: 'points',
            type: 'circle',
            source: 'data',
            paint: {
              // Circle radius scaled by the same property (capped)
              'circle-radius': [
                'min',
                20,
                ['+', 3, ['/', ['coalesce', ['get', valueProperty || ''], ['get', 'height'], ['get', 'value'], ['get', 'votes'], 0], 50]]
              ],
              'circle-color': '#0d47a1',
              'circle-stroke-width': 1,
              'circle-stroke-color': '#ffffff',
            },
          })
        }
      })
    }

    init()
    return () => {
      if (cleanup) cleanup()
      map?.remove()
    }
  }, [dataUrl])

  return (
    <div
      ref={container}
      style={{
        width: '100%',
        height: 600,
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 2px 16px rgba(0,0,0,0.15)',
      }}
    />
  )
}


