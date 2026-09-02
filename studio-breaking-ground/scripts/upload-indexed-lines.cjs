const {createReadStream} = require("node:fs")
const {getCliClient} = require("sanity/cli")

const client = getCliClient({apiVersion: "2024-01-01"}).withConfig({useCdn: false})

const poster = {
  _id: "chart-allegheny-yoy-rent-growth",
  title: "Allegheny County YoY Rent Growth by Submarket",
  slug: "allegheny-county-yoy-rent-growth-by-submarket",
  posterTheme: "night-circuit",
  chartTitle: "Allegheny County YoY Rent Growth by Submarket",
  xLabel: "Daily asking rent per SF indexed to 0% on July 1, 2025",
  file: "/Users/ben/Coding Projects/BG_WEBSITE/data_posters/ingested/indexed-lines/2026-09-02_194021_allegheny-submarket-daily-rent-growth/mapped.csv",
  filename: "allegheny_submarket_daily_rent_growth.mapped.csv",
}

async function main() {
  const {existsSync} = require("node:fs")
  if (!existsSync(poster.file)) {
    throw new Error(`Mapped CSV not found: ${poster.file}`)
  }
  const file = poster.file
  const asset = await client.assets.upload("file", createReadStream(file), {
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
    chartType: "indexedLines",
    posterTheme: poster.posterTheme,
    xField: "day",
    chartTitle: poster.chartTitle,
    xLabel: poster.xLabel,
    animationDuration: 1800,
    showLegend: true,
  })
  console.log(`Published ${poster.title} (${poster._id})`)
}

main().catch((error) => {
  console.error(error.message || error)
  process.exit(1)
})
