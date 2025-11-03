# Breaking Ground

A modern magazine website built with Next.js, Sanity CMS, and animated data visualizations.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **CMS:** Sanity Studio
- **Charts:** Custom SVG-based animated charts (bar, line, pie)
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 24+ (managed via nvm)
- npm 11+
- Sanity account
- Git

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/evilb1000/breaking-ground.git
   cd breaking-ground
   ```

2. **Install dependencies for all packages:**
   ```bash
   # Frontend (React + Vite)
   cd frontend && npm install && cd ..

   # Next.js app
   cd nextjs-breaking-ground && npm install && cd ..

   # Sanity Studio
   cd studio-breaking-ground && npm install && cd ..
   ```

3. **Configure Sanity:**
   - Project ID: `y9xwdi89`
   - Dataset: `production`
   - These are already configured in the codebase

4. **Start development servers:**
   
   **Sanity Studio** (port 3333):
   ```bash
   cd studio-breaking-ground
   npm run dev
   ```
   Visit http://localhost:3333 to manage content.

   **Next.js app** (port 3000):
   ```bash
   cd nextjs-breaking-ground
   npm run dev
   ```
   Visit http://localhost:3000 to view the site.

   **Frontend** (port 5173):
   ```bash
   cd frontend
   npm run dev
   ```

## Creating Charts

### Step 1: Create Chart Data

1. Go to Sanity Studio (http://localhost:3333)
2. Click **"Chart Data"** in the sidebar
3. Click **"Create"**
4. Fill in:
   - **Title:** Name your chart
   - **CSV Data:** Upload your CSV file
   - **Chart Type:** Select bar, line, or pie
   - **X Field:** Column name for X-axis (e.g., "year", "category")
   - **Y Field(s):** Column name for Y-axis values (e.g., "applesSold")
   - **Colors:** (Optional) Add hex color codes for bars/slices
   - **Chart Title, Labels:** Customize as needed
5. Click **"Publish"**

### Step 2: Add Chart to Article

1. Open an **Article** in Sanity Studio
2. Scroll to the **Body** field
3. Click **"+"** to add content
4. Select **"Inline Chart"** or **"Chart Figure"**
5. Click **"Create"** or select an existing chart
6. For Chart Figure, you can also set:
   - **Caption**
   - **Alignment** (left, center, right)
   - **Size** (small, medium, large, full)
7. Click **"Publish"**

## Chart Types

### Bar Chart
- X-axis: Category labels (e.g., years)
- Y-axis: Numerical values
- Supports multiple colors (cycles through color array)
- Scroll-animated bars

### Line Chart
- X-axis: Category labels (e.g., years)
- Y-axis: Numerical values
- Animated line drawing on scroll
- Shows data points as circles

### Pie Chart
- X-field: Category labels (e.g., apple varieties)
- Y-field: Numerical values
- Percentage labels on slices
- Legend on the right
- Supports multiple colors

## CSV Format

Charts require CSV files with headers:

```csv
year,applesSold
2020,1240
2021,1395
2022,1510
```

- First row must be headers (column names)
- Subsequent rows are data
- Column names must match your X Field and Y Field settings

## Schema Architecture

### chartData
Standalone schema for charts (no article fields):
- `title`, `slug`
- `dataFile` (CSV upload)
- `chartType` (bar/line/pie/area/scatter/stacked)
- `xField`, `yFields[]`
- `colors[]`
- Animation and display settings

### article
Article schema with `body` field that supports:
- Regular text blocks
- **inlineChart** (reference to chartData)
- **chartFigure** (reference with alignment/size/caption)

## Deployment & CORS Fix

### The Problem

When deploying to Vercel, we encountered CORS errors:
- Client-side `@sanity/client` calls from `breaking-ground.vercel.app` were blocked
- Sanity CDN CSV files were also blocked by CORS

**Error messages:**
```
Origin https://breaking-ground.vercel.app is not allowed by Access-Control-Allow-Origin
```

### The Solution

We created **server-side API routes** to proxy all Sanity requests:

#### `/api/chart/[id]/route.ts`
- Fetches chart configuration from Sanity (server-side, no CORS)
- Fetches CSV file from Sanity CDN (server-side, no CORS)
- Parses CSV server-side
- Returns both chart config and parsed data to client

#### Benefits:
✅ No CORS issues (all requests server-side)  
✅ More secure (Sanity tokens stay server-side)  
✅ Better performance (can add caching later)  
✅ Single API endpoint for all chart data

### Key Lesson

**Always use API routes for external data fetching in Next.js when:**
- External APIs don't allow your domain in CORS
- You need to keep API tokens secret
- You want to process/transform data server-side

**Before (broken):**
```typescript
// Client component - direct Sanity call
const client = createClient({...})
const doc = await client.fetch(...) // ❌ CORS error on Vercel
const csv = await fetch(sanityCdnUrl) // ❌ CORS error
```

**After (fixed):**
```typescript
// Client component - call our API
const res = await fetch(`/api/chart/${id}`) // ✅ No CORS

// API route - server-side Sanity calls
const doc = await client.fetch(...) // ✅ Server-side, no CORS
const csv = await fetch(sanityCdnUrl) // ✅ Server-side, no CORS
```

## Project Structure

```
breaking-ground/
├── frontend/                 # React + Vite frontend (legacy)
├── nextjs-breaking-ground/  # Next.js main app
│   ├── src/
│   │   ├── app/
│   │   │   ├── [slug]/      # Article pages
│   │   │   └── api/
│   │   │       └── chart/   # Chart API route (CORS fix)
│   │   ├── components/
│   │   │   ├── BarChartAnimated.tsx
│   │   │   ├── LineChartAnimated.tsx
│   │   │   ├── PieChartAnimated.tsx
│   │   │   └── ChartFromRefClient.tsx
│   │   └── sanity/
│   │       └── client.ts
├── studio-breaking-ground/  # Sanity Studio
│   ├── schemaTypes/
│   │   ├── chartData.ts     # Chart schema (standalone)
│   │   ├── article.ts       # Article schema
│   │   └── blockContent.ts # Body content types
└── README.md
```

## Troubleshooting

### Charts not appearing?
1. Check browser console for errors
2. Verify chartData document is published in Sanity
3. Check API route is deployed: `/api/chart/[id]`
4. Verify CSV is uploaded and accessible

### CORS errors?
- Make sure you're using the API route (`/api/chart/[id]`)
- Don't call Sanity directly from client components
- All Sanity requests should go through API routes

### Chart data missing?
- Check CSV format (headers required)
- Verify X Field and Y Field match CSV column names
- Check Sanity Studio preview for uploaded CSV

## Development Notes

- Charts use scroll-based animations (not time-based)
- All chart types share the same scroll progress logic
- Colors array cycles through for multiple bars/slices
- Animation duration/easing fields exist but aren't used yet (future feature)

## License

Private project - All rights reserved

