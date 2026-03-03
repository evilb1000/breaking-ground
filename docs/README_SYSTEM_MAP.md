## SYSTEM MAP

This document maps the system from UI down through routes, components, API routes, Sanity schemas, and data files. All paths are repo‑accurate as of this commit.

---

### 1. User Interfaces

- **Next.js main site (App Router)**
  - **Entry**: `nextjs-breaking-ground/src/app/page.tsx`
  - **Article page**: `nextjs-breaking-ground/src/app/[slug]/page.tsx`
  - **Animated data page (legacy/experimental)**: `nextjs-breaking-ground/src/app/data/[slug]/page.tsx`

- **Sanity Studio**
  - **Config**: `studio-breaking-ground/sanity.config.ts`
  - **Schemas root**: `studio-breaking-ground/schemaTypes/index.ts`

- **Vite SPA (legacy/experimental)**
  - **Entry**: `frontend/src/main.tsx`
  - **Root component**: `frontend/src/App.tsx`

---

### 2. Next.js App – Flows and Dependencies

#### 2.1 Home page (`/`)

- **UI file**: `nextjs-breaking-ground/src/app/page.tsx`
- **What it does**
  - Fetches a single featured or latest story.
  - Fetches a list of recent stories.
  - Renders a masthead plus a featured story and “More Stories” grid.
- **Sanity dependencies**
  - Uses `client` from `nextjs-breaking-ground/src/sanity/client.ts`:
    - `projectId: "y9xwdi89"`, `dataset: "production"`, `apiVersion: "2024-01-01"`, `useCdn: false`.
  - GROQ queries:
    - `FEATURED_QUERY`
      - `*[_type in ["article","animatedData"] && featured == true && defined(slug.current)] | order(_updatedAt desc)[0]{ ... }`
    - `FALLBACK_LATEST_QUERY`
      - Same shape, ordered by `publishedAt desc`, used if no `featured` story.
    - `MORE_STORIES_QUERY`
      - `*[_type in ["article","animatedData"] && defined(slug.current)] | order(publishedAt desc)[0...7]{ ... }`
  - Fields required from Sanity:
    - `_id`, `title`, `dek`, `slug.current`, `publishedAt`, `category`,
    - `headerImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot}`,
    - `author->{name, image}`.
- **Other dependencies**
  - `@sanity/image-url` for images.
  - `next/link` for navigation.

#### 2.2 Article page (`/[slug]`)

- **UI file**: `nextjs-breaking-ground/src/app/[slug]/page.tsx`
- **What it does**
  - Fetches a single document whose `_type` is either `"article"` or `"animatedData"` with the given slug.
  - Renders:
    - Hero image, title, dek, byline, date.
    - Rich body via `PortableText`.
    - Inline charts (via references to `chartData`).
    - Map embeds (via `mapEmbed` objects).
    - For legacy `animatedData` documents without chart blocks, a fallback animated bar chart driven by CSV.
- **Sanity dependencies**
  - GROQ query `ENTRY_QUERY`:
    - `*[_type in ["article","animatedData"] && slug.current == $slug][0]{ ... }`
    - Fields fetched:
      - Common/article fields:
        - `_type`, `title`, `dek`, `publishedAt`,
        - `headerImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot}`,
        - `author->{name, image}`, `category`, `issue->{title}`,
        - `body[]{ ..., mapFile{asset->{url}}, dataFile{asset->{url}} }`,
        - `readingTime`, `featured`.
      - Animated chart fields (for `_type === "animatedData"`):
        - `chartType`, `xField`, `yFields`, `groupField`, `colors`,
        - `animationDuration`, `animationEasing`,
        - `showAxis`, `showTicks`, `tickCount`,
        - `chartTitle`, `xLabel`, `yLabel`, `showLegend`,
        - `dataFile{asset->{url}}`.
  - Uses `client` from `nextjs-breaking-ground/src/sanity/client.ts`.
- **PortableText mapping**
  - Uses `PortableText` from `next-sanity` with custom `components`:
    - `types.inlineChart` → `ChartFromRefClient` (see below).
    - `types.chartFigure` → `ChartFromRefClient` (wrapped in `<figure>` with caption).
    - `types.inlineImage` → `<figure>` with aligned, sized inline images.
    - `types.figure` → `<figure>` for block figures with alignment/size.
    - `types.mapEmbed` → `MapEmbedClient` with props from the Sanity object.
- **Component dependencies**
  - `ChartFromRefClient` from `nextjs-breaking-ground/src/components/ChartFromRefClient.tsx`.
  - `AnimatedBarClient` from `nextjs-breaking-ground/src/components/AnimatedBarClient.tsx` (legacy fallback).
  - `MapEmbedClient` from `nextjs-breaking-ground/src/components/MapEmbedClient.tsx`.
  - `next/link`, `@sanity/image-url`.
- **Data files**
  - For legacy `animatedData`:
    - Uses `article.dataFile.asset.url` (CSV from Sanity file) via direct `fetch` in the page.

#### 2.3 Animated Data page (`/data/[slug]`) – legacy/experimental

- **UI file**: `nextjs-breaking-ground/src/app/data/[slug]/page.tsx`
- **What it does**
  - Fetches an `animatedData` document by slug and renders a non‑article page that focuses solely on a chart.
  - Parses the CSV and renders a bar chart or a “renderer coming soon” message for non‑bar chart types.
- **Sanity dependencies**
  - `fetchDoc(slug)` uses GROQ:
    - `*[_type == "animatedData" && slug.current == $slug][0]{ title, slug, chartType, xField, yFields, groupField, colors, animationDuration, animationEasing, showAxis, showLegend, dataFile{asset->{url}} }`
  - Uses `client` from `nextjs-breaking-ground/src/sanity/client.ts`.
- **Component dependencies**
  - Local `BarChart` function inside the page module (simple static SVG, no scroll animation).
- **Data files**
  - Directly fetches CSV from `doc.dataFile.asset.url`.

---

### 3. Chart Components and API Routes

#### 3.1 ChartFromRefClient (client-side chart loader)

- **File**: `nextjs-breaking-ground/src/components/ChartFromRefClient.tsx`
- **What it does**
  - Client component that:
    - Accepts `id`, optional `align`, optional `size`.
    - Calls the API route `GET /api/chart/[id]`.
    - Stores the returned document and `csvData` rows in local state.
    - Chooses the correct chart renderer based on `doc.chartType`.
- **Dependencies**
  - Uses `fetch('/api/chart/${id}')`.
  - Renders:
    - `AnimatedBarClient` from `nextjs-breaking-ground/src/components/AnimatedBarClient.tsx`.
    - `AnimatedPieClient` from `nextjs-breaking-ground/src/components/AnimatedPieClient.tsx`.
    - `AnimatedLineClient` from `nextjs-breaking-ground/src/components/AnimatedLineClient.tsx`.
  - Expects API to return an object with:
    - `chartType`, `xField`, `yFields`, `colors`,
    - `animationDuration`, `chartTitle`, `xLabel`, `yLabel`,
    - `showAxis`, `showTicks`, `tickCount`, `showLegend`,
    - `csvData` (array of row objects).

#### 3.2 AnimatedBarClient / BarChartAnimated

- **Files**
  - Wrapper: `nextjs-breaking-ground/src/components/AnimatedBarClient.tsx`
  - Core chart: `nextjs-breaking-ground/src/components/BarChartAnimated.tsx`
- **What they do**
  - `AnimatedBarClient` is a thin client wrapper that passes through props to `BarChartAnimated`.
  - `BarChartAnimated`:
    - Implements scroll‑based animation of bar heights.
    - Draws axes, tick labels, axis labels, and title.
    - Supports multi‑color bars.
- **Inputs (props)**
  - `data: Record<string,string>[]` – required, parsed CSV rows.
  - `xField: string` – required, CSV key for x labels.
  - `yField: string` – required, CSV key for y values.
  - `colors?: string[]`
  - `duration?: number`
  - `chartTitle?: string`
  - `xLabel?: string`
  - `yLabel?: string`
  - `showAxis?: boolean`
  - `showTicks?: boolean`
  - `tickCount?: number`

#### 3.3 AnimatedLineClient / LineChartAnimated

- **Files**
  - Client wrapper: `nextjs-breaking-ground/src/components/AnimatedLineClient.tsx`
  - Core chart: `nextjs-breaking-ground/src/components/LineChartAnimated.tsx`
- **What they do**
  - Line chart with scroll‑based drawing animation and point markers.
  - Very similar contract to bar chart; uses the same `data` shape and control props.

#### 3.4 AnimatedPieClient / PieChartAnimated

- **Files**
  - Client wrapper: `nextjs-breaking-ground/src/components/AnimatedPieClient.tsx`
  - Core chart: `nextjs-breaking-ground/src/components/PieChartAnimated.tsx`
- **What they do**
  - Pie chart with scroll‑driven reveal of segments and percentage labels.
  - Optional legend listing segment labels and colors.
- **Inputs (props)**
  - `data: Record<string,string>[]`
  - `xField: string` – category label column.
  - `yField: string` – numeric value column.
  - `colors?: string[]`
  - `duration?: number`
  - `chartTitle?: string`
  - `showLegend?: boolean`

#### 3.5 Chart API route (`/api/chart/[id]`)

- **File**: `nextjs-breaking-ground/src/app/api/chart/[id]/route.ts`
- **What it does**
  - Handles `GET /api/chart/:id` requests.
  - Fetches a Sanity document whose `_id` matches `id` and whose `_type` is either `"chartData"` or `"animatedData"`.
  - Fetches and parses the CSV from the referenced `dataFile.asset.url`.
  - Returns a JSON object that merges chart configuration fields and a `csvData` array of parsed rows.
- **Sanity dependencies**
  - GROQ query:
    - `*[_id == $id && _type in ["chartData", "animatedData"]][0]{ chartType, xField, yFields, colors, animationDuration, chartTitle, xLabel, yLabel, showAxis, showTicks, tickCount, showLegend, dataFile{asset->{url}} }`
  - Uses `client` from `nextjs-breaking-ground/src/sanity/client.ts`.
- **Data dependencies**
  - CSV file from `doc.dataFile.asset.url`.
  - Parses first line as comma‑separated headers, remaining lines as rows.

#### 3.6 GeoJSON API route (`/api/geojson`)

- **File**: `nextjs-breaking-ground/src/app/api/geojson/route.ts`
- **What it does**
  - Handles `GET /api/geojson?u=<url>` requests.
  - Fetches JSON from the `u` URL, with `cache: 'no-store'`.
  - Forwards the JSON response with `Cache-Control: no-store`.
  - Used by `MapEmbedClient` to proxy GeoJSON (especially from Sanity).

---

### 4. Map Embeds

#### 4.1 MapEmbedClient

- **File**: `nextjs-breaking-ground/src/components/MapEmbedClient.tsx`
- **What it does**
  - Client‑side Mapbox + Deck.gl map renderer for extruded column charts over GeoJSON features.
  - Fetches GeoJSON:
    - If `dataUrl` starts with `https://cdn.sanity.io/`, rewrites to `/api/geojson?u=...`.
    - Otherwise fetches `dataUrl` directly.
  - Creates a Mapbox GL map and a Deck.gl `ColumnLayer` overlay.
  - Computes feature centroids and positions grouped columns using `valueProperties`.
- **Inputs (props)**
  - `dataUrl: string` – required; usually a Sanity file URL for `.geojson`.
  - `valueProperty?: string`
  - `valueProperties?: string[]`
  - `heightScale?: number` (default 1).
  - `columnRadius?: number` (meters; default 80).
  - `columnSpacing?: number` (meters; default 90).
  - `colors?: string[]` (hex).
- **External dependencies**
  - `mapbox-gl`, `@deck.gl/mapbox`, `@deck.gl/layers`.
  - Requires `process.env.NEXT_PUBLIC_MAPBOX_TOKEN`.
- **Data files**
  - Example GeoJSON in repo: `pittsburgh_precincts.geojson` at repo root.
  - Typically uploaded to Sanity and referenced by `mapEmbed.dataFile`.

---

### 5. Sanity Studio – Schemas and Content Model

#### 5.1 Schema registration

- **File**: `studio-breaking-ground/schemaTypes/index.ts`
- **Exports**:
  - `blockContent` – `blockContent.ts`
  - `author` – `author.ts`
  - `issue` – `issue.ts`
  - `postType` – `postType.ts`
  - `article` – `article.ts`
  - `animatedData` – `animatedData.ts`
  - `chartData` – `chartData.ts`
  - `mapEmbed` – `mapEmbed.tsx`
- All are wired into `sanity.config.ts` via `schema.types = schemaTypes`.

#### 5.2 Article (`article`)

- **Schema file**: `studio-breaking-ground/schemaTypes/article.ts`
- **Definition**
  - Extends `baseArticle` (from `studio-breaking-ground/schemaTypes/baseArticle.js`).
  - Keeps article‑oriented fields such as `title`, `slug`, `dek`, `headerImage`, `author`, `category`, `issue`, `body`, `readingTime`, `featured`.
- **Use in frontend**
  - Queried by:
    - Home page (`page.tsx`) via `FEATURED_QUERY`, `FALLBACK_LATEST_QUERY`, `MORE_STORIES_QUERY`.
    - Article page (`[slug]/page.tsx`) via `ENTRY_QUERY`.

#### 5.3 Legacy animatedData (`animatedData`)

- **Schema file**: `studio-breaking-ground/schemaTypes/animatedData.ts`
- **Definition**
  - Extends `baseArticle` but adds chart‑specific fields:
    - `dataFile`, `chartType`, `xField`, `yFields`, `groupField`,
    - `colors`, `chartTitle`, `xLabel`, `yLabel`,
    - `animationDuration`, `animationEasing`,
    - `showAxis`, `showTicks`, `tickCount`,
    - `numberFormat`, `showLegend`.
- **Use in frontend**
  - Still referenced by:
    - Home page and article page queries (`_type in ["article","animatedData"]`).
    - Legacy `/data/[slug]` route.
    - Chart API route (`/api/chart/[id]`) which allows `_type` in `["chartData","animatedData"]`.
  - Considered transitional; see `readme/AUDIT.md` and `readme/SCHEMA_DIFF.md`.

#### 5.4 chartData (new chart schema)

- **Schema file**: `studio-breaking-ground/schemaTypes/chartData.ts`
- **Definition**
  - Standalone `document` (no article inheritance).
  - Fields:
    - Identity: `title`, `slug`.
    - Data/config: `dataFile`, `chartType`, `xField`, `yFields`, `groupField`.
    - Appearance: `colors`, `chartTitle`, `xLabel`, `yLabel`.
    - Animation: `animationDuration`, `animationEasing`.
    - Display controls: `showAxis`, `showTicks`, `tickCount`, `numberFormat`, `showLegend`.
- **Use in frontend**
  - Referenced by:
    - `blockContent.inlineChart` (`reference` to `chartData`).
    - `blockContent.chartFigure.chart` (`reference` to `chartData`).
  - Loaded by:
    - Chart API route (`/api/chart/[id]`).
    - `ChartFromRefClient` (via API).

#### 5.5 blockContent (PortableText)

- **Schema file**: `studio-breaking-ground/schemaTypes/blockContent.ts`
- **Definition**
  - `blockContent` is an array of:
    - Rich text `block`.
    - `inlineImage` (image + metadata).
    - `figure` (object with `image`, `alt`, `caption`, `alignment`, `size`).
    - `inlineChart` (`reference` to `chartData`).
    - `chartFigure` (object referencing `chartData` plus caption, alignment, size).
    - `mapEmbed` (type `mapEmbed`).
- **Use in frontend**
  - Rendered in `[slug]/page.tsx` via `PortableText` with a custom `components.types` mapping that covers:
    - `inlineChart`, `chartFigure`, `inlineImage`, `figure`, `mapEmbed`.

#### 5.6 mapEmbed

- **Schema file**: `studio-breaking-ground/schemaTypes/mapEmbed.tsx`
- **Definition**
  - Object type with fields:
    - `title`, `dataFile` (GeoJSON file; required),
    - `valueProperty`, `valueProperties[]`,
    - `heightScale`, `columnRadius`, `columnSpacing`,
    - `colors[]`, `caption`.
- **Use in frontend**
  - In `blockContent`, as type `mapEmbed`.
  - Rendered in `[slug]/page.tsx` via `components.types.mapEmbed`, which passes values to `MapEmbedClient`.

---

### 6. Data Files and Local Assets

- **CSV data**
  - `data/apples_2020_2025.csv`
  - `data/apple_types_sold.csv`
  - These are example/chart data files referenced in documentation, not wired directly in code (Sanity CSV files are uploaded via Studio).

- **GeoJSON**
  - `pittsburgh_precincts.geojson` (root)
  - Example file for map embeds; typically uploaded into Sanity and referenced via `mapEmbed.dataFile`.

- **Static assets**
  - `nextjs-breaking-ground/public/*.svg` – icons and placeholders used by the Next app.

---

### 7. Vite SPA (legacy/experimental)

- **Entry**: `frontend/src/main.tsx`
- **Root component**: `frontend/src/App.tsx`
- **Sanity client**: `frontend/src/lib/sanity.ts`
  - `projectId: 'y9xwdi89'`, `dataset: 'production'`, `useCdn: true`, `apiVersion: '2024-10-28'`.
- **What it does**
  - Fetches documents of type `"post"` (GROQ: `*[_type == "post"] | order(publishedAt desc)`).
  - Renders a grid of cards linking to `/post/{slug.current}`.
- **Status**
  - The `"post"` schema does not exist in `studio-breaking-ground/schemaTypes`.
  - This app is best treated as **legacy/experimental** and not part of the main production flow.

