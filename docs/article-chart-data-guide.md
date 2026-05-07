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
- `area`
- `scatter`
- `stacked`

Only these are currently implemented on the frontend:

- `line`
- `bar`
- `pie`

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
- `Chart Type`: `line`, `bar`, or `pie` for now.
- `X Field`: the CSV column used for labels, categories, or x-axis values.
- `Y Field(s)`: the CSV column used for numeric values. The frontend currently uses the first selected y-field.
- `Colors`: optional hex colors, used in series/category order.
- `Chart Title`: optional visible title above chart.
- `X Axis Title`: optional label for line/bar x-axis.
- `Y Axis Title`: optional label for line/bar y-axis.
- `Animation Duration`: field exists, but the current charts are mainly scroll-progress driven.
- `Show Axes`: line/bar only.
- `Show Tick Labels`: line/bar only.
- `Y Tick Count`: line/bar only.
- `Show Legend`: pie only.

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

- Chart type is `Line`, `Bar`, or `Pie`.
- CSV first row contains headers.
- `X Field` exactly matches one CSV header.
- First `Y Field(s)` value exactly matches one numeric CSV header.
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

