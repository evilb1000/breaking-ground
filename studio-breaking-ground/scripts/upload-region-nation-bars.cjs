const {createReadStream, existsSync} = require("node:fs")
const {getCliClient} = require("sanity/cli")

const client = getCliClient({apiVersion: "2024-01-01"}).withConfig({useCdn: false})

const poster = {
  _id: "chart-us-multifamily-sales-regions-vs-nation",
  title: "U.S. multifamily sales — regions vs. the nation",
  slug: "us-multifamily-sales-regions-vs-nation",
  posterTheme: "cool-midnight",
  chartTitle: "U.S. multifamily sales — regions vs. the nation",
  xLabel: "Annual sales transactions. Regions stack to the U.S. total.",
  file: "/Users/ben/Coding Projects/BG_WEBSITE/data_posters/ingested/region-nation-bars/2026-09-02_211816_regional-national-annual-trends/mapped.csv",
  filename: "regional_national_annual_trends.mapped.csv",
}

async function main() {
  if (!existsSync(poster.file)) {
    throw new Error(`Mapped CSV not found: ${poster.file}`)
  }
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
    chartType: "regionNationBars",
    posterTheme: poster.posterTheme,
    xField: "year",
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
