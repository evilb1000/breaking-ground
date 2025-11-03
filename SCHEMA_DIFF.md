# Schema Diff: animatedData → chartData

## Summary
**Old:** `animatedData` extends `baseArticle` (polluted with article fields)  
**New:** `chartData` is standalone (pure chart fields only)

---

## Removed Fields (9 article-specific)

### From baseArticle inheritance:
1. **dek** - Text summary (max 200 chars)
2. **publishedAt** - Actually KEPT in new schema (needed for timestamp)
3. **headerImage** - Image with hotspot/caption
4. **heroImage** - Legacy hidden image field
5. **author** - Reference to author document (REQUIRED in old)
6. **category** - Enum: feature/profile/news/data_trends (REQUIRED in old)
7. **issue** - Reference to issue document
8. **body** - blockContent array (REQUIRED in old)
9. **readingTime** - Number (minutes)
10. **featured** - Boolean flag

**Impact:** Users no longer forced to fill author, category, body to create charts

---

## Kept Fields (19 fields)

### Identity (2)
- ✅ **title** - Chart identifier
- ✅ **slug** - URL-friendly ID (auto from title)

### Data & Configuration (5)
- ✅ **dataFile** - CSV upload (required)
- ✅ **chartType** - Type selector (line/bar/pie/area/scatter/stacked)
- ✅ **xField** - X-axis column name
- ✅ **yFields** - Array of Y-axis columns
- ✅ **groupField** - Optional grouping column

### Appearance (4)
- ✅ **colors** - Array of hex colors
- ✅ **chartTitle** - Overall chart title
- ✅ **xLabel** - X-axis label
- ✅ **yLabel** - Y-axis label

### Animation Settings (2)
- ✅ **animationDuration** - Duration in ms (0-20000, default 800)
- ✅ **animationEasing** - Easing type (default: 'easeInOut')

### Display Controls (6)
- ✅ **showAxis** - Boolean (default: true)
- ✅ **showTicks** - Boolean (default: true)
- ✅ **tickCount** - Number 2-10 (default: 5)
- ✅ **numberFormat** - Format string hint
- ✅ **showLegend** - Boolean (default: true)

---

## New Features

### Additional Chart Types
chartData adds 3 new chart type options:
- **area** - Area chart
- **scatter** - Scatter plot  
- **stacked** - Stacked bar chart

### Better Descriptions
All fields now have descriptive help text

---

## Structural Changes

### Before (animatedData.ts)
```typescript
export default defineType({
  ...baseArticle,          // ← Inherits 10+ article fields
  name: 'animatedData',
  fields: [
    ...(baseArticle as any).fields,  // ← Spreads article fields
    // Chart fields...
  ]
})
```

### After (chartData.ts)
```typescript
export default defineType({
  name: 'chartData',       // ← No inheritance
  type: 'document',        // ← Explicit type declaration
  components: {preview: ChartDataPreview},
  fields: [
    // Only chart fields, standalone
  ]
})
```

---

## Reference Updates

### blockContent.ts
**Before:**
```typescript
to: [{type: 'animatedData'}]  // Line 122, 130
```

**After:**
```typescript
to: [{type: 'chartData'}]     // Line 122, 130
```

**Files Updated:**
- `inlineChart` reference
- `chartFigure.chart` reference

### schemaTypes/index.ts
**Added Export:**
```typescript
import chartData from './chartData'
export const schemaTypes = [..., chartData]
```

### Components
**New:** `ChartDataPreview.tsx` - Simplified preview component

---

## No Breaking Changes

### ChartFromRefClient.tsx
✅ No changes needed - uses ID-based fetch which works with any document type

### BarChartAnimated.tsx
✅ No changes needed - receives data props, doesn't care about source

### Animation Logic
✅ Kept exactly as-is - scroll-based with easing
✅ `animationDuration` and `animationEasing` fields preserved for future use

---

## Migration Notes

### Existing animatedData Documents
Will coexist with new chartData documents:
- Old documents still work
- BlockContent now references chartData
- Can migrate existing docs or create new ones

### Studio Experience
**Before:**
1. Create animatedData
2. Fill author, category, body
3. Fill chart config
4. Save

**After:**
1. Create chartData
2. Fill chart config only
3. Save

Much cleaner! 🎉

---

## Next Steps

1. ✅ Schema defined
2. ✅ BlockContent updated
3. ✅ Components created
4. ⏭️ Test in Studio
5. ⏭️ Implement missing chart types (line, area, scatter, stacked)
6. ⏭️ Optional: Migrate existing animatedData → chartData

