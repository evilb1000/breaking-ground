"use client"
import React, {useEffect, useRef} from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import {MapboxOverlay} from '@deck.gl/mapbox'
import {ColumnLayer} from '@deck.gl/layers'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

export default function MapEmbedClient({
  dataUrl,
  valueProperty,
  heightScale = 1,
  valueProperties,
  columnRadius = 80,
  columnSpacing = 90,
  colors,
}: {
  dataUrl: string
  valueProperty?: string
  heightScale?: number
  valueProperties?: string[]
  columnRadius?: number // in meters
  columnSpacing?: number // in meters between grouped columns
  colors?: string[]
}) {
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!dataUrl) return
    let map: mapboxgl.Map | null = null
    let overlay: MapboxOverlay | null = null

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
        bearingSnap: 0, // allow smooth 360° rotation without snapping to north
        pitchWithRotate: true,
        antialias: true,
      })

      // Add basic UI controls for zoom/rotation/fullscreen
      map.addControl(new mapboxgl.NavigationControl({visualizePitch: true}), 'top-right')
      map.addControl(new mapboxgl.FullscreenControl(), 'top-right')
      // Ensure interactions are enabled
      map.dragRotate.enable()
      map.touchZoomRotate.enableRotation(true)
      map.keyboard.enable()

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

        // Build grouped columns at each feature centroid using deck.gl ColumnLayer
        try {
          const features = geojson.type === 'FeatureCollection' ? geojson.features : [geojson]
          const toCentroid = (geom: any): [number, number] => {
            if (geom.type === 'Point') return geom.coordinates as [number, number]
            // naive centroid: average outer ring coordinates
            const coords = geom.type.includes('Polygon') ? geom.coordinates[0] : geom.coordinates[0][0]
            let sx = 0, sy = 0
            coords.forEach((c: [number, number]) => { sx += c[0]; sy += c[1] })
            const n = coords.length || 1
            return [sx / n, sy / n]
          }

          const series = (valueProperties && valueProperties.length > 0) ? valueProperties : [valueProperty].filter(Boolean) as string[]
          const palette = (colors && colors.length ? colors : ['#e24a3f', '#0d47a1', '#43a047']).slice(0, Math.max(1, series.length))

          const metersToLng = (m: number, atLng: number, atLat: number) => m / (111320 * Math.cos(atLat * Math.PI / 180))
          const metersToLat = (m: number) => m / 110540

          const layers = (series.length ? series : ['value']).map((key, idx) => new ColumnLayer({
            id: `col-${idx}`,
            data: features,
            extruded: true,
            radius: columnRadius, // meters
            pickable: false,
            getFillColor: (_: any) => {
              const c = palette[idx % palette.length]
              // hex to rgba
              const m = c.match(/#([0-9a-f]{6})/i)
              if (!m) return [226, 74, 63, 200]
              const num = parseInt(m[1], 16)
              return [(num >> 16) & 255, (num >> 8) & 255, num & 255, 200]
            },
            getElevation: (f: any) => {
              const v = Number(f.properties?.[key]) || Number(f.properties?.value) || Number(f.properties?.votes) || 0
              return v * heightScale
            },
            getPosition: (f: any) => {
              const [lng, lat] = toCentroid(f.geometry)
              // offset columns side-by-side east-west
              const dxm = (idx - (series.length - 1) / 2) * columnSpacing
              const dLng = metersToLng(dxm, lng, lat)
              const dLat = 0
              return [lng + dLng, lat + dLat]
            }
          }))

          overlay = new MapboxOverlay({layers})
          map!.addControl(overlay as any)
        } catch {}
      })
    }

    init()
    return () => {
      if (overlay) (overlay as any).setProps({layers: []})
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


