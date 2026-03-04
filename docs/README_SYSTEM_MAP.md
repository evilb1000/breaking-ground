## SYSTEM MAP

This document maps the current production flow for Breaking Ground.

---

### 1. User Interfaces

- **Next.js site (primary)**  
  - `nextjs-breaking-ground/src/app/page.tsx` (homepage)  
  - `nextjs-breaking-ground/src/app/[slug]/page.tsx` (article page)

- **Sanity Studio**  
  - `studio-breaking-ground/sanity.config.ts`  
  - `studio-breaking-ground/schemaTypes/index.ts`

- **Vite frontend (legacy/experimental)**  
  - `frontend/src/main.tsx`  
  - `frontend/src/App.tsx`

---

### 2. Content Model

- **Article documents**  
  - Schema: `studio-breaking-ground/schemaTypes/article.ts`  
  - Base fields: `studio-breaking-ground/schemaTypes/baseArticle.js`

- **Chart documents**  
  - Schema: `studio-breaking-ground/schemaTypes/chartData.ts`

- **PortableText chart blocks**  
  - `studio-breaking-ground/schemaTypes/blockContent.ts`  
  - `inlineChart` and `chartFigure` reference `chartData`

---

### 3. Next.js Data Flows

- **Homepage (`/`)**  
  - Queries only `article` documents for featured/latest cards.  
  - Renders carousel cards and feature blocks from article references.

- **Article page (`/[slug]`)**  
  - Queries only `article` by `slug.current`.  
  - Renders PortableText blocks, including inline chart and map blocks.

- **Chart API (`/api/chart/[id]`)**  
  - Fetches only `_type == "chartData"`.  
  - Reads `dataFile.asset.url`, parses CSV rows, returns chart config + `csvData`.

---

### 4. Chart Rendering Path

1. Editor inserts `inlineChart`/`chartFigure` block in article body.
2. Block stores a reference to a `chartData` document.
3. `ChartFromRefClient` calls `/api/chart/[id]`.
4. API returns chart config + parsed CSV rows.
5. Client renders `AnimatedBarClient`, `AnimatedLineClient`, or `AnimatedPieClient`.

---

### 5. Key Files

- `nextjs-breaking-ground/src/app/[slug]/page.tsx`
- `nextjs-breaking-ground/src/components/ChartFromRefClient.tsx`
- `nextjs-breaking-ground/src/app/api/chart/[id]/route.ts`
- `studio-breaking-ground/schemaTypes/chartData.ts`
- `studio-breaking-ground/schemaTypes/blockContent.ts`
