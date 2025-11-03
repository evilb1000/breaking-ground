# Breaking Ground – Native Maps (Mapbox GL + Deck.gl)

This doc explains how our native map embedding works, what it can/can’t do, and how to rebuild it.

## What we ship
- Native Mapbox GL map rendered inside the article page (no iframes, no CSP issues)
- Deck.gl ColumnLayer for 3D “columns” per precinct (or any feature centroid)
- Multiple series per district (grouped columns), configurable per-article
- Smooth camera (pitch/bearing), 360° rotation, zoom, fullscreen, drag‑rotate
- Inline maps inside article body via `mapEmbed` block (PortableText)

## Requirements
- Next.js app: `nextjs-breaking-ground`
- Studio: `studio-breaking-ground`
- Packages (Next.js): `mapbox-gl deck.gl @deck.gl/core @deck.gl/layers`
- Env: `NEXT_PUBLIC_MAPBOX_TOKEN=pk_...` in `nextjs-breaking-ground/.env.local`

## Authoring (Sanity Studio)
Insert a `Map Embed` block in the article Body and set:
- `GeoJSON` (required): upload a `.geojson` file
- `Value Property` (optional): single numeric property for column height (e.g., `OConnor_2025_Total`)
- `Multiple Value Properties` (optional): list of properties for grouped columns (e.g., `Gainey_2025_Total, OConnor_2025_Total, Peduto_2021_Total`)
- `Height Scale` (number): multiplies values to control column height (try 5–20)
- `Column Radius` (m): width of each column (default 80)
- `Column Spacing` (m): distance between grouped columns (default 90)
- `Colors` (optional): hex list for series
- `Caption` (optional)

Placement: Put `Map Embed` anywhere in the Body. If a map is present in the Body, the page will not auto‑render a top map.

## Data assumptions
- GeoJSON may contain Points/Lines/Polygons
- Columns are drawn at feature centroid (or point coordinate)
- Height uses: `valueProperties[]` → `valueProperty` → `height|value|votes` → 0
- Coordinates must be `[lng, lat]`

## Frontend behavior
- Client component: `nextjs-breaking-ground/src/components/MapEmbedClient.tsx`
  - Mapbox GL light style; pitch=65°, bearing=30°, antialias on
  - Navigation + Fullscreen controls; drag/touch rotate & keyboard enabled
  - Fits bounds to data, eases back to 3D view
  - Deck.gl ColumnLayer draws grouped columns per centroid
- PortableText render (`/[slug]/page.tsx`):
  - `mapEmbed` → `<MapEmbedClient dataUrl valueProperty|valueProperties heightScale columnRadius columnSpacing colors />`

## What it can do
- 3D columns (single or grouped) at centroids
- Multiple maps per article
- Full interactive navigation (zoom/pan/rotate/fullscreen)

## What it does not do (yet)
- No stacked columns (only grouped side‑by‑side)
- No legend/color ramp (can add)
- No per‑feature hover tooltips (can add)
- No on‑page property switcher (editors set in Studio)

## Rebuild/replicate
1. Install packages
```bash
npm install mapbox-gl deck.gl @deck.gl/core @deck.gl/layers
```
2. Add env token
```bash
echo "NEXT_PUBLIC_MAPBOX_TOKEN=pk_..." > nextjs-breaking-ground/.env.local
```
3. Copy `MapEmbedClient.tsx` and wire `mapEmbed` in your PortableText renderer
4. In Studio, create `mapEmbed` schema (fields above) and add it to `blockContent`
5. Restart Studio + Next.js; author a Map Embed, upload `.geojson`, set value properties, publish

## Troubleshooting
- Blank map: verify token and restart dev server
- No columns: set `valueProperty` or `valueProperties`; confirm numeric values
- Still looks flat: increase `Height Scale`; ensure pitch/bearing via nav control
- Odd positions: verify coordinates are `[lng, lat]`

## File locations
- Schema: `studio-breaking-ground/schemaTypes/mapEmbed.tsx`
- Body: `studio-breaking-ground/schemaTypes/blockContent.ts`
- Client: `nextjs-breaking-ground/src/components/MapEmbedClient.tsx`
- Page renderer: `nextjs-breaking-ground/src/app/[slug]/page.tsx`
