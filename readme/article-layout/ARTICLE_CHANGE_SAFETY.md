# Article Change Safety Map

This document is a fast-reference safety matrix for editing the article system in:

- `nextjs-breaking-ground/src/app/[slug]/page.tsx`
- related chart/map components and schemas

Use it before making changes so we avoid regressions.

## 1) Safe vs Risky by Change Type

### Safe (low risk, visual-only or guarded paths)

- Typography classes on title/dek/body wrappers in `page.tsx`
- Spacing/margins/padding for article column wrappers
- Non-structural hero image class tweaks (`object-*`, rounded corners, shadows)
- Caption/byline styling only (no field/path changes)
- PortableText prose class tuning (`prose-*`) without removing block renderers
- Map/chart container cosmetics (border radius, shadows, spacing)

### Medium risk (requires quick QA pass)

- Hero height changes (`vh`) and full-bleed width math
- Image fallback ordering (`headerImage` vs `heroImage` vs `seriesImage`)
- PortableText alignment/size class mapping for `inlineImage` / `figure`
- Chart renderer selection logic in `ChartFromRefClient`
- API response shape additions in `/api/chart/[id]/route.ts`

### High risk (schema/query contract sensitive)

- Changing `ENTRY_QUERY` field names or removing fields used in JSX
- Changing slug routing assumptions (`slug.current`)
- Renaming block `_type` names (`inlineChart`, `chartFigure`, `mapEmbed`, etc.)
- Removing chart/map reference dereferencing logic
- Modifying chart API `_type` filter or CSV parsing format
- Changing schema field names without synchronized frontend updates

## 2) Critical Contracts (Do Not Break)

1. `slug.current` must exist for article routing.
2. At least one of these should resolve for hero image fallback:
   - `headerImage`
   - `heroImage`
   - `series.seriesImage`
3. PortableText chart blocks must resolve an ID:
   - `inlineChart`: `_ref` or `_id`
   - `chartFigure`: `chart._ref` or `chart._id`
4. Chart API must return:
   - config fields (`chartType`, `xField`, `yFields`, etc.)
   - `csvData` array of row objects
5. `mapEmbed.dataFile.asset.url` must be present for map render.

## 3) File-Level Risk Map

- **`src/app/[slug]/page.tsx`**
  - **Safe:** classes/layout polish
  - **Risky:** query shape, image fallback logic, block renderer mapping

- **`src/app/api/chart/[id]/route.ts`**
  - **Safe:** error message text
  - **Risky:** data parsing, returned field names, `_type` filter

- **`src/components/ChartFromRefClient.tsx`**
  - **Safe:** wrapper spacing/align class cosmetics
  - **Risky:** chart type switching and prop mapping

- **`src/components/MapEmbedClient.tsx`**
  - **Safe:** visual map container style changes
  - **Risky:** data URL/proxy logic and column generation math

- **`studio-breaking-ground/schemaTypes/blockContent.ts`**
  - **Safe:** descriptions/help text
  - **Risky:** block names, reference targets, required fields

- **`studio-breaking-ground/schemaTypes/chartData.ts` / `mapEmbed.tsx` / `series.ts`**
  - **Safe:** non-breaking descriptions/defaults
  - **Risky:** field renames/removals and type changes

## 4) Pre-Change Checklist

Before editing:

1. Identify affected contract:
   - route query
   - block type
   - API response shape
   - schema field name/type
2. Confirm where that contract is consumed (search all references).
3. Prefer additive changes over renames/deletes.

## 5) Post-Change Verification Checklist

After editing:

1. Open an article with:
   - article image present
   - only series image fallback
   - multiple PortableText block types
2. Confirm:
   - hero image renders
   - title/dek/byline/date render
   - inline chart renders
   - chart figure renders with caption
   - map block renders
3. Confirm console has no chart/map fetch errors.
4. Run lints/type checks for touched files.

## 6) Quick Rollback Strategy

If article view breaks:

1. First revert query shape changes in `ENTRY_QUERY`.
2. Then revert block renderer mapping changes.
3. Then revert chart API response changes.
4. Re-test with one known-good article slug.

This order restores core route rendering fastest.
