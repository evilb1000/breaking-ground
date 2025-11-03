# Sanity Chart Implementation Audit

## Schema Architecture

### Current Schema Inheritance Chain
```
article extends baseArticle
animatedData extends baseArticle
```

### Fields Inherited from baseArticle (10 fields)
**KEEP (4):**
- `title` (string, required) - Chart name/identifier
- `slug` (slug, required, auto) - URL-friendly identifier
- `publishedAt` (datetime, required) - Publication timestamp

**REMOVE (6):**
- `dek` (text) - Summary/description (article-specific)
- `headerImage` (image) - Hero image (article-specific)
- `heroImage` (hidden legacy) - Legacy image field
- `author` (reference) - Author (article-specific)
- `category` (enum) - Content categorization (article-specific)
- `issue` (reference) - Magazine issue (article-specific)
- `body` (blockContent) - Article body content (article-specific)
- `readingTime` (number) - Estimated read time (article-specific)
- `featured` (boolean) - Homepage feature flag (article-specific)

### Chart-Specific Fields (16 fields)
**Data & Configuration:**
1. `dataFile` - CSV file upload (required)
2. `chartType` - Type: line, bar, pie (required)
3. `xField` - X-axis column name (required)
4. `yFields` - Array of Y-axis columns (required)
5. `groupField` - Optional grouping column
6. `colors` - Array of hex colors for series

**Labels & Display:**
7. `chartTitle` - Overall chart title (optional)
8. `xLabel` - X-axis label (optional)
9. `yLabel` - Y-axis label (optional)

**Animation Settings:**
10. `animationDuration` - Duration in ms (0-20000, default 800) - **NOT USED IN CURRENT IMPL**
11. `animationEasing` - Easing type (default: 'easeInOut') - **NOT USED IN CURRENT IMPL**

**Display Toggles:**
12. `showAxis` - Boolean (default true)
13. `showTicks` - Boolean (default true)
14. `tickCount` - Number 2-10 (default 5)
15. `numberFormat` - String format hint (e.g., "0,0")
16. `showLegend` - Boolean (default true)

## Animation Implementation

### Current Animation Model
- **Trigger:** Scroll position (viewport-based)
- **Progress Range:** 0-1 based on element position
- **Easing:** easeOutCubic interpolation
- **Smoothing:** Linear interpolation with 0.15 factor
- **Critical Discovery:** `animationDuration` and `animationEasing` fields in schema are NOT used in frontend code

### Where Animation Lives
**Frontend:** `BarChartAnimated.tsx`
- `useScrollProgress()` hook - scroll listener
- `t` state - smoothed progress value (0-1)
- `eased` calculation - `1 - Math.pow(1 - t, 3)` (easeOutCubic)
- Applied to bar height rendering

**Schema:** `animatedData.ts`
- Fields defined but **not consumed** by frontend

## Reference Flow

### 1. Sanity Studio (Content Creation)
```
Article Document
  └─ body field (blockContent array)
      ├─ inlineChart reference → animatedData document
      └─ chartFigure object
          └─ chart reference → animatedData document
```

### 2. Frontend (Content Rendering)
```
page.tsx (PostPage)
  └─ ENTRY_QUERY fetches article OR animatedData by slug
  └─ PortableText renderer with custom components
      ├─ inlineChart → ChartFromRefClient(id)
      └─ chartFigure → ChartFromRefClient(id, align, size)

ChartFromRefClient
  └─ Fetches animatedData by id
  └─ Extracts CSV URL from dataFile.asset.url
  └─ Parses CSV into rows
  └─ Routes to chart renderer based on chartType
      └─ BarChartAnimated (implements scroll animation)
```

### 3. Data Fetching Queries

**Article Query** (`page.tsx` line 9-37):
```groq
*[_type in ["article","animatedData"] && slug.current == $slug][0]{
  _type, title, dek, publishedAt, headerImage, author, category, issue, body,
  readingTime, featured,
  // animatedData-only fields
  chartType, xField, yFields, groupField, colors, animationDuration,
  animationEasing, showAxis, showTicks, tickCount, chartTitle, xLabel,
  yLabel, showLegend, dataFile
}
```

**Chart Query** (`ChartFromRefClient.tsx` line 30-35):
```groq
*[_id == $id][0]{
  chartType, xField, yFields, colors, animationDuration, chartTitle,
  xLabel, yLabel, showAxis, showTicks, tickCount,
  dataFile{asset->{url}}
}
```

## Problems Identified

### 1. Schema Pollution
- `animatedData` inherits 9 article-specific fields it doesn't need
- Users forced to fill author, category, etc. to create a chart
- Creates confusion about whether chart IS an article or CONTAINS article reference

### 2. Animation Fields Not Used
- Schema defines `animationDuration` and `animationEasing`
- Frontend implements scroll-based, fixed easing
- Fields exist but have no effect

### 3. Document Type Confusion
- Single document type serves dual purpose (article + chart)
- Query returns `_type in ["article","animatedData"]` suggesting overlap
- Can't distinguish chart-only documents from article-with-chart

### 4. Missing Features
- No ability to create multiple charts in one article easily
- Each chart requires full document creation
- No chart templates or presets

## Recommendations

### Option A: Clean Separation
Create new `chartData` schema without baseArticle inheritance:
- Keep: title, slug, publishedAt, all 16 chart fields
- Remove: all 9 article-specific fields
- Update: blockContent references to point at `chartData`
- Migration: Convert existing animatedData docs to chartData

### Option B: Hybrid Approach
Keep animatedData but make article fields optional:
- Make author, category, body optional or hidden for chart-only use
- Add flag "isChartOnly" to control field visibility
- More complex but less breaking

### Option C: Nested Charts
Add charts array to articles:
- Remove chart document type entirely
- Embed chart config directly in article body
- Simpler for users, less flexible

**Recommended:** Option A for clean architecture and future flexibility.

