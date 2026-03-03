## CONTRACTS

This document describes the contracts between Sanity schemas, PortableText blocks, frontend components, and API routes. All shapes are taken directly from the code and schemas.

---

### 1. Sanity Schemas ↔ Frontend Rendering

#### 1.1 `article` documents

- **Schema**
  - `studio-breaking-ground/schemaTypes/article.ts` (extends `baseArticle`).
  - Inherited/imported from `studio-breaking-ground/schemaTypes/baseArticle.js`.
- **Fields used by the frontend**
  - Home page (`nextjs-breaking-ground/src/app/page.tsx`):
    - `_id` – used as React key and to distinguish featured from list.
    - `title` – displayed.
    - `dek` – optional; displayed if present.
    - `slug.current` – required; used for links `href="/{slug.current}"`.
    - `publishedAt` – optional; formatted into a date string.
    - `category` – optional; displayed in “More Stories” cards.
    - `headerImage` (object):
      - `asset.{url,_ref,_type}` – used with `@sanity/image-url` to build URLs.
      - `alt`, `caption`, `crop`, `hotspot` – alt text and future cropping support.
    - `author` (reference expanded):
      - `name`, `image`.
  - Article page (`nextjs-breaking-ground/src/app/[slug]/page.tsx`):
    - Same as above, plus:
      - `issue.title` – optional; not rendered currently.
      - `body[]` – PortableText content (see block contract below).
      - `readingTime` – not used directly in the page component.
      - `featured` – not used on this page.
- **Contract**
  - `slug.current` **must** be defined for any article that should be routable.
  - `title` is assumed to exist; the UI does not guard against `undefined` titles.
  - `body` is allowed to be empty; page will render with no body if `article.body` is falsy.

#### 1.2 `animatedData` documents (legacy)

- **Schema**
  - `studio-breaking-ground/schemaTypes/animatedData.ts`.
  - Extends `baseArticle` and adds chart fields.
- **Fields used by the frontend**
  - Same article fields as above (title, dek, slug, header image, author, etc.) when `_type === "animatedData"`:
    - Home and article pages treat `animatedData` documents like articles for listing and layout.
  - Additional chart fields used when `_type === "animatedData"`:
    - Article page (`[slug]/page.tsx`):
      - `chartType`, `xField`, `yFields`, `groupField`, `colors`,
      - `animationDuration`, `animationEasing`,
      - `showAxis`, `showTicks`, `tickCount`,
      - `chartTitle`, `xLabel`, `yLabel`, `showLegend`,
      - `dataFile.asset.url`.
    - Legacy data page (`data/[slug]/page.tsx`):
      - `title`, `slug`, `chartType`, `xField`, `yFields`, `groupField`, `colors`,
      - `animationDuration`, `animationEasing`,
      - `showAxis`, `showLegend`,
      - `dataFile.asset.url`.
- **Contract**
  - For `_type === "animatedData"`:
    - `slug.current` is required to make the document routable.
    - `dataFile.asset.url` must be set to generate charts; otherwise, the page falls back to “No CSV uploaded.” or a “renderer coming soon” message.
  - `animationDuration` and `animationEasing` exist in the schema but are **not honored** by the current chart components; scroll‑based animation logic is fixed in code.

#### 1.3 `chartData` documents (new chart schema)

- **Schema**
  - `studio-breaking-ground/schemaTypes/chartData.ts`.
- **Core fields**
  - Identity:
    - `title: string` (required).
    - `slug: slug` (required; auto from `title`).
  - Data/config:
    - `dataFile: file` (CSV; required).
    - `chartType: string` (one of `"line" | "bar" | "pie" | "area" | "scatter" | "stacked"`; required).
    - `xField: string` (required).
    - `yFields: string[]` (min length 1; required).
    - `groupField?: string`.
  - Appearance:
    - `colors?: string[]`.
    - `chartTitle?: string`.
    - `xLabel?: string`.
    - `yLabel?: string`.
  - Animation:
    - `animationDuration?: number` (0–20000, default 800).
    - `animationEasing?: string` (one of `easeInOut`, `easeOut`, `easeIn`, `linear`; default `easeInOut`).
  - Display controls:
    - `showAxis?: boolean` (default `true`).
    - `showTicks?: boolean` (default `true`).
    - `tickCount?: number` (default `5`).
    - `numberFormat?: string`.
    - `showLegend?: boolean` (default `true`).
- **Fields used by the frontend**
  - API route `/api/chart/[id]`:
    - Reads `chartType`, `xField`, `yFields`, `colors`,
      `animationDuration`, `chartTitle`, `xLabel`, `yLabel`,
      `showAxis`, `showTicks`, `tickCount`, `showLegend`,
      `dataFile.asset.url`.
  - `ChartFromRefClient`:
    - Receives everything above from the API.
    - Uses `chartType`, `xField`, `yFields[0]`, `colors`,
      `animationDuration`, `chartTitle`, `xLabel`, `yLabel`,
      `showAxis`, `showTicks`, `tickCount`, `showLegend`,
      `csvData`.
- **Contract**
  - A `chartData` document must have:
    - `dataFile.asset.url` (CSV).
    - `chartType` set to one of the implemented chart types:
      - `"bar"`, `"pie"`, `"line"` are currently implemented.
      - `"area"`, `"scatter"`, `"stacked"` are not yet rendered (API will still return config, but `ChartFromRefClient` will show a fallback message).
    - `xField` and at least one `yFields` entry.
  - The chart renderers assume that:
    - `xField` and `yFields[0]` correspond to valid column names in the CSV header.
    - CSV values for `yFields[0]` can be parsed as numbers.

---

### 2. PortableText Blocks ↔ Components

#### 2.1 Block type: `inlineImage`

- **Schema**
  - `blockContent` entry in `studio-breaking-ground/schemaTypes/blockContent.ts` with `name: 'inlineImage', type: 'image'`.
  - Fields:
    - `alt?: string`
    - `caption?: string`
    - `alignment?: 'left' | 'right' | 'center'`
    - `size?: 'small' | 'medium' | 'large' | 'full'`
- **Renderer**
  - `[slug]/page.tsx` → `components.types.inlineImage`.
  - Props/shape expected:
    - `value.asset._ref` or `value.asset.url` must exist; otherwise, returns `null`.
    - `value.size` optional; mapped to Tailwind `max-w-*` classes.
    - `value.alignment` optional; determines float vs centered layout.

#### 2.2 Block type: `figure`

- **Schema**
  - `blockContent` entry with `name: 'figure', type: 'object'`.
  - Fields:
    - `image` (required; `image` type).
    - `alt?: string`
    - `caption?: string`
    - `alignment?: 'left' | 'right' | 'center'` (default `center`).
    - `size?: 'small' | 'medium' | 'large' | 'full'`
- **Renderer**
  - `[slug]/page.tsx` → `components.types.figure`.
  - Shape expected:
    - `value.image.asset._ref` or `value.image.asset.url` must exist.
    - Alignment and size fields are optional; defaults to center/full when missing.

#### 2.3 Block type: `inlineChart`

- **Schema**
  - `blockContent` entry with:
    - `name: 'inlineChart'`
    - `type: 'reference'`
    - `to: [{type: 'chartData'}]`.
- **Renderer**
  - `[slug]/page.tsx` → `components.types.inlineChart`.
  - Implementation:
    - Reads `value._ref` or `value._id`:
      - If neither exists, returns `null`.
      - Else renders `<ChartFromRefClient id={refId} />`.
- **Contract**
  - PortableText value must be a valid reference to a `chartData` document.
  - `value._ref` is the primary identifier used for API calls.

#### 2.4 Block type: `chartFigure`

- **Schema**
  - `blockContent` entry with:
    - `name: 'chartFigure'`
    - `type: 'object'`
    - Fields:
      - `chart`: `reference` to `chartData` (required).
      - `caption?: string`.
      - `alignment?: 'left' | 'right' | 'center'` (default `center`).
      - `size?: 'small' | 'medium' | 'large' | 'full'` (default `full`).
- **Renderer**
  - `[slug]/page.tsx` → `components.types.chartFigure`.
  - Implementation:
    - Derives `refId` from `value.chart._ref` or `value.chart._id`.
    - Derives `align` and `size` with defaults as described.
    - Renders:
      - `<ChartFromRefClient id={refId} align={align} size={size} />`.
      - Optional `<figcaption>` with `value.caption`.
- **Contract**
  - `chart` reference is required in schema; renderer returns `null` if `refId` cannot be derived.

#### 2.5 Block type: `mapEmbed`

- **Schema**
  - `blockContent` entry with `name: 'mapEmbed', type: 'mapEmbed'`.
  - `mapEmbed` defined in `studio-breaking-ground/schemaTypes/mapEmbed.tsx`:
    - `title?: string`
    - `dataFile` – GeoJSON file (required).
    - `valueProperty?: string`
    - `valueProperties?: string[]`
    - `heightScale?: number` (default 1).
    - `columnRadius?: number` (default 80).
    - `columnSpacing?: number` (default 90).
    - `colors?: string[]`
    - `caption?: string`
- **Renderer**
  - `[slug]/page.tsx` → `components.types.mapEmbed`.
  - Implementation:
    - Reads `dataUrl = value.dataFile.asset.url`; if missing, returns `null`.
    - Passes:
      - `dataUrl`
      - `valueProperty`
      - `valueProperties`
      - `heightScale ?? 1`
      - `columnRadius ?? 80`
      - `columnSpacing ?? 90`
      - `colors`
    - Renders optional caption below the map.
- **Contract**
  - `dataFile.asset.url` must be set; otherwise, the map block does not render.
  - Other fields are optional and defaulted in the component.

---

### 3. API Routes ↔ Components

#### 3.1 `/api/chart/[id]` ↔ `ChartFromRefClient` and chart components

- **Route file**
  - `nextjs-breaking-ground/src/app/api/chart/[id]/route.ts`
- **Handler signature**
  - `export async function GET(request: Request, {params}: {params: Promise<{id: string}>})`
- **Request contract**
  - `params.id` must be provided:
    - If missing, returns: `status 400`, JSON `{ error: 'Missing chart ID' }`.
- **Sanity query**
  - GROQ:
    ```groq
    *[_id == $id && _type in ["chartData", "animatedData"]][0]{
      chartType, xField, yFields, colors,
      animationDuration, chartTitle, xLabel, yLabel,
      showAxis, showTicks, tickCount, showLegend,
      dataFile{asset->{url}}
    }
    ```
  - If no document is found:
    - Returns `status 404`, JSON `{ error: 'Chart not found' }`.
- **CSV fetch and parsing**
  - If `doc.dataFile.asset.url` is present:
    - Performs `fetch(url)` (no explicit cache directive).
    - On success:
      - Splits `csvText` into lines.
      - First line → `headers: string[]`.
      - Remaining lines → `csvData: Array<Record<string, string>>`, mapping each header to the trimmed column value.
    - On error:
      - Logs to console: `Error fetching CSV: ...`.
      - Leaves `csvData` as empty array.
- **Response shape (success)**
  - HTTP 200, JSON:
    ```ts
    {
      chartType: string
      xField: string
      yFields?: string[]
      colors?: string[]
      animationDuration?: number
      chartTitle?: string
      xLabel?: string
      yLabel?: string
      showAxis?: boolean
      showTicks?: boolean
      tickCount?: number
      showLegend?: boolean
      dataFile?: { asset?: { url?: string } }
      csvData: Array<Record<string, string>>
    }
    ```
- **Component usage: `ChartFromRefClient`**
  - File: `nextjs-breaking-ground/src/components/ChartFromRefClient.tsx`.
  - On mount:
    - Calls `fetch('/api/chart/${id}')`.
    - If `!res.ok`:
      - Logs to console and returns; component renders `null`.
    - On success:
      - Expects `d.csvData` (optional).
      - Saves `d` to `doc` and `d.csvData` to `rows`.
  - Rendering:
    - If `!doc`, returns `null`.
    - Derives `yField = (doc.yFields?.[0] as string) || ''`.
    - For `doc.chartType`:
      - `"bar"` → `AnimatedBarClient` with:
        - `data={rows}`
        - `xField={doc.xField}`
        - `yField={yField}`
        - `colors={doc.colors}`
        - `duration={doc.animationDuration ?? 1200}`
        - `chartTitle={doc.chartTitle}`
        - `xLabel={doc.xLabel}`
        - `yLabel={doc.yLabel}`
        - `showAxis={doc.showAxis ?? true}`
        - `showTicks={doc.showTicks ?? true}`
        - `tickCount={doc.tickCount ?? 5}`
      - `"pie"` → `AnimatedPieClient` with:
        - `data={rows}`
        - `xField={doc.xField}`
        - `yField={yField}`
        - `colors={doc.colors}`
        - `duration={doc.animationDuration ?? 1200}`
        - `chartTitle={doc.chartTitle}`
        - `showLegend={doc.showLegend ?? true}`
      - `"line"` → `AnimatedLineClient` with similar props.
      - Any other `chartType`:
        - Renders `<p>Chart type "{doc.chartType}" not implemented.</p>`.
- **Contract summary**
  - API guarantees:
    - 400 on missing `id`.
    - 404 on missing document.
    - 500 on general failure.
    - 200 with chart config and `csvData` for valid IDs.
  - Components expect:
    - A `csvData` array; if empty, charts render but show no bars/segments/points.
    - `xField` and `yFields[0]` to align with CSV headers.
    - `chartType` to be one of `"bar" | "line" | "pie"` for full support; other values result in a user‑visible fallback message.

#### 3.2 `/api/geojson` ↔ `MapEmbedClient`

- **Route file**
  - `nextjs-breaking-ground/src/app/api/geojson/route.ts`
- **Handler signature**
  - `export async function GET(req: NextRequest)`
- **Request contract**
  - Query parameter `u` is required:
    - If missing: returns `status 400`, JSON `{ error: 'Missing u param' }`.
  - If present:
    - Performs `fetch(url, { cache: 'no-store' })`.
    - If upstream `res.ok` is `false`:
      - Returns `status 502`, JSON `{ error: 'Upstream <status>' }`.
    - On success:
      - Parses `res.json()` into `json`.
      - Returns 200, JSON `json` with `Cache-Control: no-store`.
    - On fetch error:
      - Returns `status 500`, JSON `{ error: e.message || 'Fetch failed' }`.
- **Component usage: `MapEmbedClient`**
  - File: `nextjs-breaking-ground/src/components/MapEmbedClient.tsx`.
  - Input prop: `dataUrl: string`.
  - Behavior:
    - If `dataUrl` starts with `https://cdn.sanity.io/`:
      - Builds `proxied = '/api/geojson?u=' + encodeURIComponent(dataUrl)`.
      - Fetches `proxied`.
    - Else:
      - Fetches `dataUrl` directly.
    - Expects to receive a GeoJSON object (`FeatureCollection` or `Feature`).
  - Failure mode:
    - If fetch fails or JSON is malformed, map creation may error; current code wraps some operations in `try/catch` but does not report to the user.
- **Contract summary**
  - API guarantees:
    - 400 for missing `u`.
    - 502 for upstream non‑OK responses.
    - 500 for network/parse errors.
    - 200 with arbitrary GeoJSON for valid upstream JSON.
  - Component expects:
    - Well‑formed GeoJSON with `type: 'Feature' | 'FeatureCollection'` and polygon/point geometry.
    - Numeric properties in `properties` to use for column heights (`valueProperties` or `valueProperty`).

---

### 4. Unused or Experimental Contracts

- **Vite SPA ↔ Sanity `"post"`**
  - `frontend/src/App.tsx` queries:
    - `*[_type == "post"] | order(publishedAt desc)`.
  - No `post` schema exists in `studio-breaking-ground/schemaTypes`.
  - Result:
    - This contract does not currently resolve to any defined schema and is effectively **unused** in the live content model.

