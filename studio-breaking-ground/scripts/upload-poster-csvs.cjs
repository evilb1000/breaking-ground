const {createReadStream} = require("node:fs")
const {getCliClient} = require("sanity/cli")

const client = getCliClient({apiVersion: "2024-01-01"}).withConfig({useCdn: false})

const posters = [
  {
    _id: "chart-pittsburgh-price-per-unit-3yr",
    title: "Pittsburgh submarket price per unit (3yr)",
    slug: "pittsburgh-submarket-price-per-unit-3yr",
    posterTheme: "cool-midnight",
    chartTitle: "What a Pittsburgh multifamily unit actually trades for",
    xLabel: "Every submarket. Weighted by units sold. Disclosed transactions only.",
    yLabel: "Annual windows",
    file: "/Users/ben/Coding Projects/BG_WEBSITE/data_posters/ingested/heatmap-range/2026-09-02_145151_pittsburgh-submarket-price-per-unit-3yr/mapped.csv",
    filename: "pittsburgh_submarket_price_per_unit_3yr.mapped.csv",
  },
  {
    _id: "chart-pittsburgh-sales-count-3yr",
    title: "Pittsburgh submarket sales count (3yr)",
    slug: "pittsburgh-submarket-sales-count-3yr",
    posterTheme: "signal-cyan",
    chartTitle: "Where Pittsburgh multifamily actually trades",
    xLabel: "Every submarket. Every reported sale. Twelve complete quarters.",
    yLabel: "Three-year total · by window",
    file: "/Users/ben/Coding Projects/BG_WEBSITE/data_posters/ingested/heatmap-range/2026-09-02_145904_pittsburgh-submarket-sales-count-3yr/mapped.csv",
    filename: "pittsburgh_submarket_sales_count_3yr.mapped.csv",
  },
]

async function main() {
  const existing = await client.fetch(`*[_type == "chartData" && _id in $ids]{_id, title}`, {
    ids: posters.map((poster) => poster._id),
  })
  console.log(`Existing matches: ${existing.length}`)

  for (const poster of posters) {
    const asset = await client.assets.upload("file", createReadStream(poster.file), {
      filename: poster.filename,
      contentType: "text/csv",
    })
    await client.createOrReplace({
      _id: poster._id,
      _type: "chartData",
      title: poster.title,
      slug: {_type: "slug", current: poster.slug},
      dataFile: {
        _type: "file",
        asset: {_type: "reference", _ref: asset._id},
      },
      chartType: "heatmapRange",
      posterTheme: poster.posterTheme,
      xField: "submarket",
      chartTitle: poster.chartTitle,
      xLabel: poster.xLabel,
      yLabel: poster.yLabel,
      animationDuration: 2200,
      showLegend: true,
    })
    console.log(`Published ${poster.title} (${poster._id})`)
  }
}

main().catch((error) => {
  console.error(error.message || error)
  process.exit(1)
})
