# Article Chart Data Guide

This note explains how the article chart system works in Sanity and how CSV files need to be structured for charts to render correctly on the site.

## Where This Lives

Sanity schema:

- `studio-breaking-ground/schemaTypes/chartData.ts`
- `studio-breaking-ground/schemaTypes/blockContent.ts`

Frontend rendering:

- `nextjs-breaking-ground/src/components/ChartFromRefClient.tsx`
- `nextjs-breaking-ground/src/components/AnimatedBarClient.tsx`
- `nextjs-breaking-ground/src/components/AnimatedLineClient.tsx`
- `nextjs-breaking-ground/src/components/AnimatedPieClient.tsx`
- `nextjs-breaking-ground/src/components/AnimatedDonutClient.tsx`
- `nextjs-breaking-ground/src/components/AnimatedComboClient.tsx`
- `nextjs-breaking-ground/src/components/AnimatedHeatmapRangeClient.tsx`
- `nextjs-breaking-ground/src/app/api/chart/[id]/route.ts`

Article placement:

- Add a `Chart Data` document in Sanity.
- Upload a CSV file to that document.
- Insert it into an article body using either `Inline Chart` or `Chart Figure`.

## Important Current Limitation

The Sanity schema currently lists these chart type options:

- `line`
- `bar`
- `pie`
- `donut`
- `combo`
- `heatmapRange`
- `area`
- `scatter`
- `stacked`

Only these are currently implemented on the frontend:

- `line`
- `bar`
- `pie`
- `donut`
- `combo`
- `heatmapRange`

If an editor selects `area`, `scatter`, or `stacked`, the site will not render a real chart yet. It will show a fallback message like:

```text
Chart type "area" not implemented.
```

## CSV Rules

The CSV parser is intentionally simple right now.

Rules:

- The first row must be column headers.
- Header names must exactly match the `X Field` and `Y Field(s)` values entered in Sanity.
- Numeric chart values must be plain numbers.
- Avoid commas inside cells.
- Avoid quoted CSV complexity if possible.
- Avoid currency symbols, percent signs, or units inside numeric cells.
- Use one row per data point or category.

Good numeric values:

```csv
month,value
2025-01,120
2025-02,135
2025-03,142
```

Risky values:

```csv
month,value
2025-01,"1,200"
2025-02,$135
2025-03,142%
```

The current parser splits lines on commas, so values like `"1,200"` may break.

## Shared Sanity Fields

Every `Chart Data` document uses these key fields:

- `Title`: internal chart name.
- `Slug`: generated from title.
- `CSV Data`: uploaded `.csv` file.
- `Chart Type`: `line`, `bar`, `pie`, `donut`, or `combo` for now.
- `X Field`: the CSV column used for labels, categories, or x-axis values.
- `Y Field(s)`: the CSV column used for numeric values. Line charts can use multiple y-fields. Bar, pie, and donut charts use the first selected y-field.
- `Series Configuration`: combo charts only. Defines which CSV fields render as bars or lines and which y-axis each series uses.
- `Colors`: optional hex colors, used in series/category order.
- `Chart Title`: optional visible title above chart.
- `X Axis Title`: optional label for line/bar x-axis.
- `Y Axis Title`: optional label for line/bar y-axis.
- `Animation Duration`: field exists, but the current charts are mainly scroll-progress driven.
- `Show Axes`: line/bar only.
- `Show Tick Labels`: line/bar only.
- `Y Tick Count`: line/bar only.
- `Show Legend`: pie and donut only.

## Line Chart

Use a line chart for a value over time or over an ordered sequence.

Sanity setup:

- `Chart Type`: `Line`
- `X Field`: the label/time column
- `Y Field(s)`: one numeric value column

CSV structure:

```csv
month,cost_index
2025-01,101
2025-02,104
2025-03,108
2025-04,106
```

Sanity fields:

```text
X Field: month
Y Field(s): cost_index
```

How it renders:

- The frontend reads each row in order.
- The x-axis is based on row order and labels from `X Field`.
- The y-axis is scaled from the numeric values in the first selected y-field.
- The line animates in as the user scrolls.

Best practices:

- Sort rows in the desired display order before upload.
- Use dates like `2025-01` or short labels like `Q1 2025`.
- Keep labels short, because x-axis labels are sampled when there are many rows.

## Bar Chart

Use a bar chart for comparing categories or showing values over time as discrete bars.

Sanity setup:

- `Chart Type`: `Bar`
- `X Field`: category/label column
- `Y Field(s)`: one numeric value column

CSV structure:

```csv
category,value
Labor,42
Materials,63
Equipment,28
Overhead,19
```

Sanity fields:

```text
X Field: category
Y Field(s): value
```

How it renders:

- One bar per CSV row.
- The bar label comes from `X Field`.
- The bar height comes from the first selected y-field.
- Bars animate upward as the user scrolls.

Best practices:

- Keep category names short.
- Avoid too many rows; the current SVG is fixed-width and can get crowded.
- Use positive values. Negative bar handling is not built out.

## Pie Chart

Use a pie chart for showing parts of a whole.

Sanity setup:

- `Chart Type`: `Pie`
- `X Field`: slice/category label
- `Y Field(s)`: one numeric value column
- `Show Legend`: on or off

CSV structure:

```csv
segment,share
Public,45
Private,35
Institutional,20
```

Sanity fields:

```text
X Field: segment
Y Field(s): share
```

How it renders:

- One slice per CSV row.
- Slice labels come from `X Field`.
- Slice sizes come from the first selected y-field.
- Percent labels appear on slices above 5%.
- The pie animates open as the user scrolls.

Best practices:

- Values do not need to add to 100; the chart calculates percentages from the total.
- Keep slice count small, ideally 3-7 slices.
- Add colors in the same order as CSV rows if specific brand/category colors matter.

## Donut Chart

Use a donut chart for showing parts of a whole with a center total.

Sanity setup:

- `Chart Type`: `Donut`
- `X Field`: slice/category label
- `Y Field(s)`: one numeric value column
- `Show Legend`: on or off

CSV structure:

```csv
segment,share
Public,45
Private,35
Institutional,20
```

Sanity fields:

```text
X Field: segment
Y Field(s): share
```

How it renders:

- One ring segment per CSV row.
- Segment labels come from `X Field`.
- Segment sizes come from the first selected y-field.
- Percent labels appear on segments above 5%.
- The center shows the numeric total.
- The donut animates open as the user scrolls.

Best practices:

- Values do not need to add to 100; the chart calculates percentages from the total.
- Keep segment count small, ideally 3-7 segments.
- Add colors in the same order as CSV rows if specific brand/category colors matter.

## Combo Bar + Line Chart

Use a combo chart when two related measures share the same categories but need different visual forms or scales, such as project count as bars and total project value as a line.

Sanity setup:

- `Chart Type`: `Combo Bar + Line`
- `X Field`: shared category/time column
- `Y Field(s)`: add the same numeric fields used in the series configuration. If no series configuration is set, the first y-field renders as a bar on the left axis and the second y-field renders as a line on the right axis.
- `Series Configuration`: configure each numeric CSV field.

CSV structure:

```csv
Year,Project Count,Total Value
2022,42,180000000
2023,58,245000000
2024,63,310000000
```

Sanity fields:

```text
X Field: Year
Y Field(s): Project Count, Total Value
```

Series configuration:

```text
Field: Project Count
Display Label: Project Count
Render As: Bar
Axis: Left

Field: Total Value
Display Label: Total Value
Render As: Line
Axis: Right
```

How it renders:

- Bars and lines share the same x-axis labels from `X Field`.
- Bar and line series can use independent left/right y-axis scales.
- The left axis label uses `Y Axis Title`.
- The right axis label uses the first right-axis series label.
- Bars grow upward and lines draw in as the user scrolls.
- A centered legend shows whether each series is a bar or line.

Best practices:

- Use the left axis for the bar series and the right axis for the line series when values are on very different scales.
- Keep labels short because the SVG has fixed dimensions.
- Use plain numbers only. For large dollar values, omit `$` and commas from the CSV values.

## Heatmap + Range

Dark two-panel article module: submarket × quarter heatmap on the left, annual-window dots + 3-year avg on the right. Sits in the 686px article column. Full notes: `BGWebbuild/Heatmap + Range Chart - Article Poster Module.md`.

Sanity setup:

- `Chart Type`: Heatmap + Range
- `X Field`: `submarket`
- `Y Field(s)`: optional. Two or more quarter columns sets display order; otherwise `Q3 23`-style headers are auto-detected.

CSV structure (wide; empty cells = no sale):

```csv
submarket,Q3 23,Q4 23,Q1 24,Q2 24,Q3 24,Q4 24,Q1 25,Q2 25,Q3 25,Q4 25,Q1 26,Q2 26,year1,year2,year3,avg_3yr,sales
Downtown Pittsburgh,152000,,176400,178600,201800,206000,222200,231400,249600,266800,268000,285200,169000,215350,267400,221636,22
```

Reserved extra columns: `year1`, `year2`, `year3`, `avg_3yr`, `sales`. Values are raw dollars (no `$` or commas). Test file: `charts_for_build/pittsburgh_submarket_price_per_unit_3yr.csv`.

How it renders:

- Magma color scale, capped at the 95th percentile.
- KPIs are computed from `avg_3yr`, last four quarters, and `sales`.
- Animation is scroll-triggered (`is-in`): KPI count-up, cells stagger by column then row, dots slide after ~550ms.

## Unsupported Chart Types

These options exist in Sanity but are not implemented on the frontend yet:

### Area

Potential future CSV structure:

```csv
month,value
2025-01,101
2025-02,104
2025-03,108
```

Current status: not rendered.

### Scatter

Potential future CSV structure:

```csv
x_value,y_value
10,25
15,32
20,38
```

Current status: not rendered.

### Stacked Bar

Potential future CSV structure:

```csv
category,labor,materials,equipment
Project A,40,35,25
Project B,30,50,20
Project C,45,30,25
```

Current status: not rendered. Also note that the frontend currently only uses the first selected y-field, so multi-y-field stacked behavior would need code changes.

## Inline Chart vs Chart Figure

Articles can insert charts two ways.

### Inline Chart

Use this for a simple chart reference in the body.

Schema block:

```text
Inline Chart
```

It references a `Chart Data` document directly.

### Chart Figure

Use this when the chart needs layout controls or a caption.

Schema block:

```text
Chart Figure
```

Fields:

- `Chart`: reference to `Chart Data`
- `Caption`: optional
- `Alignment`: left, right, center
- `Size`: small, medium, large, full

## Quick Checklist For Editors

Before publishing:

- Chart type is `Line`, `Bar`, `Pie`, `Donut`, `Combo Bar + Line`, or `Heatmap + Range`.
- CSV first row contains headers.
- `X Field` exactly matches one CSV header.
- `Y Field(s)` values exactly match numeric CSV headers.
- Combo charts have `Series Configuration` fields that exactly match numeric CSV headers.
- Numeric values contain numbers only.
- CSV does not use commas inside cell values.
- Chart is inserted into the article body as `Inline Chart` or `Chart Figure`.

## Example Full Workflow

1. Create a new `Chart Data` document.
2. Give it a clear title, like `Regional Construction Cost Index`.
3. Upload a CSV:

```csv
month,index
2025-01,100
2025-02,103
2025-03,106
```

4. Set:

```text
Chart Type: Line
X Field: month
Y Field(s): index
Chart Title: Regional Construction Cost Index
X Axis Title: Month
Y Axis Title: Index
```

5. Open the article.
6. In the body, insert `Chart Figure`.
7. Select the chart document.
8. Add an optional caption.
9. Publish.

