# Article Layout System

This document maps the current article page architecture and wiring for:

- `nextjs-breaking-ground/src/app/[slug]/page.tsx`

It is intended as a "tangled wires" map: render layers, component boundaries, data objects, and runtime dependencies.

## 1) Top-Level Route and Rendering Layers

Primary route component:

- `PostPage` in `nextjs-breaking-ground/src/app/[slug]/page.tsx`

High-level render stack:

1. **Route fetch + guard**
   - Fetches one article by slug.
   - Returns "Article not found" fallback when null.
2. **Hero media layer (full-bleed)**
   - Full-width image band rendered outside the centered content column.
   - Contains floating `Home` link in top-left.
3. **Article metadata/content column**
   - Title, dek, byline avatar/name, date.
   - PortableText body with custom block renderers.

## 2) Data Query and Object Shape

Article route query:

- `ENTRY_QUERY` in `nextjs-breaking-ground/src/app/[slug]/page.tsx`
- Source type: `_type == "article"`

Selected objects:

- Core article fields:
  - `_type`, `title`, `dek`, `publishedAt`, `category`, `readingTime`, `featured`
- Image fields:
  - `headerImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot}`
  - `heroImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot}`
- Author:
  - `author->{name, image}`
- Series fallback:
  - `series->{title, slug, seriesImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot}}`
- Body:
  - `body[]{..., mapFile{asset->{url}}, dataFile{asset->{url}}}`

## 3) Hero Image Resolution Chain

The route resolves a single hero image with this fallback order:

1. `article.headerImage`
2. `article.heroImage` (legacy)
3. `article.series.seriesImage` (series default)

Then URL resolution prefers:

1. Sanity builder URL from `_ref` (`urlFor(...).width(1100).height(620)`)
2. Raw asset URL (`asset.url`)

If no resolved image exists:

- Hero media band is skipped.
- Back link appears in normal flow.

## 4) Layout Objects and "Layer" Breakdown

### 4.1 Outer page container

- `main` with white background and left-aligned content mode.
- Includes all article layers.

### 4.2 Full-bleed hero band

- Uses inline style to break out of content width:
  - `marginLeft: 'calc(50% - 50vw)'`
  - `width: '100vw'`
- Hero `<img>` uses:
  - `width: 100%`
  - `height: 60vh`
  - `objectFit: cover`

### 4.3 Overlay controls

- `Home` link is absolutely positioned over hero (`top-4 left-4`).

### 4.4 Centered article column

- `max-w-3xl` with left offset (`ml-[10vw]`).
- Contains title/dek/byline/date and body rendering.

## 5) Nested Component Tree (Article-Only Path)

From `page.tsx`, imported components used in article rendering:

- `ChartFromRefClient`
- `MapEmbedClient`

`ChartFromRefClient` fans out into:

- `AnimatedBarClient`
- `AnimatedPieClient`
- `AnimatedLineClient`

`MapEmbedClient` uses:

- `mapbox-gl`
- `@deck.gl/mapbox`
- `@deck.gl/layers` (`ColumnLayer`)

## 6) PortableText Block Wiring

PortableText custom mapping in `page.tsx`:

- `inlineChart` -> resolves ref ID -> `<ChartFromRefClient id={...} />`
- `chartFigure` -> resolves nested `chart` ref + layout opts -> `<ChartFromRefClient ... />` + caption
- `inlineImage` -> direct image with `alignment` and `size` mapping
- `figure` -> object image with `alignment` and `size` mapping
- `mapEmbed` -> `<MapEmbedClient ... />` + optional caption

If required IDs/assets are missing in any renderer:

- Renderer returns `null` and silently skips the block.

## 7) Chart Data Path (Article Body -> API -> Renderer)

Flow:

1. PortableText chart block carries reference ID.
2. `ChartFromRefClient` fetches `/api/chart/[id]`.
3. API route:
   - Loads `_type == "chartData"`.
   - Reads `dataFile.asset.url`.
   - Fetches CSV and parses rows server-side.
   - Returns chart config + `csvData`.
4. `ChartFromRefClient` picks renderer by `chartType`:
   - `bar`, `pie`, `line` supported.
   - Others show "not implemented".

Important note:

- API returns raw row objects.
- Series/group transforms are handled inside chart components, not API.

## 8) Map Data Path

Flow:

1. `mapEmbed` block provides `dataFile.asset.url` and display options.
2. `MapEmbedClient` fetches data:
   - Via `/api/geojson?u=...` when source is Sanity CDN.
   - Directly otherwise.
3. Client initializes Mapbox map and Deck overlay.
4. Columns are generated from configured `valueProperty/valueProperties`.

## 9) Schema Objects That Feed Article Layout

Relevant Studio schemas:

- `studio-breaking-ground/schemaTypes/article.ts`
- `studio-breaking-ground/schemaTypes/baseArticle.js`
- `studio-breaking-ground/schemaTypes/series.ts`
- `studio-breaking-ground/schemaTypes/blockContent.ts`
- `studio-breaking-ground/schemaTypes/chartData.ts`
- `studio-breaking-ground/schemaTypes/mapEmbed.tsx`

Key article content contracts:

- `slug.current` is required for route resolution.
- `body` drives all rich blocks/charts/maps.
- `series.seriesImage` now provides visual fallback when article image is missing.

## 10) Current Risk/Complexity Hotspots

1. **Multiple image fallbacks**
   - `headerImage` + `heroImage` + `seriesImage` means more conditional paths to test.
2. **Silent null renderers**
   - Missing refs/assets fail quietly; content can disappear without obvious UI errors.
3. **Mixed inline style + utility classes**
   - Full-bleed hero relies on inline width/margin math, which is harder to standardize.
4. **Client-heavy embed blocks**
   - Charts and maps depend on runtime fetches and browser APIs; failures happen post-render.
5. **PortableText block shape assumptions**
   - Renderers expect specific nested structures (`chart._ref`, image assets, etc.).

## 11) Quick "Where to Edit What"

- Hero image/fallback behavior:
  - `nextjs-breaking-ground/src/app/[slug]/page.tsx`
- Article typography and column spacing:
  - `nextjs-breaking-ground/src/app/[slug]/page.tsx`
- Chart fetching/parsing:
  - `nextjs-breaking-ground/src/app/api/chart/[id]/route.ts`
- Chart render behavior:
  - `nextjs-breaking-ground/src/components/ChartFromRefClient.tsx`
  - `nextjs-breaking-ground/src/components/*Chart*.tsx`
- Map rendering:
  - `nextjs-breaking-ground/src/components/MapEmbedClient.tsx`
- Block type availability/shape:
  - `studio-breaking-ground/schemaTypes/blockContent.ts`
