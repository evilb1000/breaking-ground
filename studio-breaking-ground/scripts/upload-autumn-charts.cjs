const {createReadStream, existsSync} = require("node:fs")
const {getWriteClient} = require("./sanity-client.cjs")

const client = getWriteClient()
const ROOT = "/Users/ben/Coding Projects/BG_WEBSITE/data_posters/ingested"

const posters = [
  {
    _id: "chart-washington-county-population-1950-2020",
    title: "Washington County never cleared its 1960 high",
    slug: "washington-county-population-1950-2020",
    rootName: "washington_county_population_1950_2020",
    chartType: "decadeLines",
    posterTheme: "autumn-editorial",
    xField: "year",
    chartTitle: "WASHINGTON COUNTY NEVER CLEARED ITS 1960 HIGH",
    yLabel: "WASHINGTON COUNTY",
    xLabel: "Decennial Census resident population · 1950–2020 · counts, not percent",
    caption:
      "Source: U.S. Census Bureau, decennial Census, April 1. Not ACS population estimates. Axis is cropped to the series range so decade-to-decade movement is readable.",
    file: `${ROOT}/decade-lines/2026-09-21_141359_washington-county-population-1950-2020/mapped.csv`,
    filename: "washington_county_population_1950_2020.mapped.csv",
  },
  {
    _id: "chart-washington-county-township-growth-over-5pct",
    title: "Fifteen Washington County municipalities grew by more than 5%",
    slug: "washington-county-township-growth-over-5pct",
    rootName: "washington_county_township_growth_over_5pct",
    chartType: "decadeLines",
    posterTheme: "autumn-editorial",
    xField: "year",
    chartTitle: "FIFTEEN WASHINGTON COUNTY MUNICIPALITIES GREW BY MORE THAN 5%",
    yLabel: "WASHINGTON COUNTY",
    xLabel: "Decennial Census resident population · townships · 1970–2020 · up more than 5%",
    caption:
      "Source: U.S. Census Bureau, decennial Census, April 1. Townships only. Threshold is 1970–2020 change of more than 5 percent. Cities and boroughs omitted.",
    file: `${ROOT}/decade-lines/2026-09-21_141359_washington-county-township-growth-over-5pct/mapped.csv`,
    filename: "washington_county_township_growth_over_5pct.mapped.csv",
  },
  {
    _id: "chart-washington-county-oldest-municipalities",
    title: "Washington County's oldest municipalities",
    slug: "washington-county-oldest-municipalities",
    rootName: "washington_county_oldest_municipalities",
    chartType: "rankedBars",
    posterTheme: "autumn-editorial",
    xField: "label",
    chartTitle: "WASHINGTON COUNTY'S OLDEST MUNICIPALITIES",
    yLabel: "WASHINGTON COUNTY",
    xLabel: "Share of residents age 65 or older · 2020 Census · places with 1,000 or more residents",
    caption:
      "Tick on each bar is the county share (21.6%). Ranked by percent, not headcount. Places with fewer than 1,000 residents omitted.\nSource: IPUMS NHGIS B57 · decennial Census, April 1, 2020 · Washington County FIPS 42125.",
    file: `${ROOT}/ranked-bars/2026-09-21_141359_washington-county-oldest-municipalities/mapped.csv`,
    filename: "washington_county_oldest_municipalities.mapped.csv",
  },
  {
    _id: "chart-washington-county-employment-industries",
    title: "Healthcare employs the most",
    slug: "washington-county-employment-industries",
    rootName: "washington_county_employment_industries",
    chartType: "rankedBars",
    posterTheme: "autumn-editorial",
    xField: "label",
    chartTitle: "HEALTHCARE EMPLOYS THE MOST",
    yLabel: "WASHINGTON COUNTY",
    xLabel: "Private jobs and pay by industry · 2023",
    caption:
      "Bar length is jobs. Color and figures are annual pay per job. Private employers only. Not occupation. Not government.\nSource: Census County Business Patterns 2023 · FIPS 42125. Pay is annual payroll ÷ March employment.",
    file: `${ROOT}/ranked-bars/2026-09-21_141359_washington-county-employment-industries/mapped.csv`,
    filename: "washington_county_employment_industries.mapped.csv",
  },
  {
    _id: "chart-western-pa-township-growth",
    title: "Western Pennsylvania's fastest growing townships since 1970",
    slug: "western-pa-township-growth",
    rootName: "western_pa_township_growth",
    chartType: "decadeHeatmap",
    posterTheme: "autumn-editorial",
    xField: "label",
    chartTitle: "WESTERN PENNSYLVANIA'S FASTEST GROWING TOWNSHIPS SINCE 1970",
    yLabel: "WESTERN PENNSYLVANIA",
    xLabel: "Eight-county Western Pennsylvania · townships with 4,500 or more residents in 1970 · ranked by 1970–2020 change",
    caption:
      "Cell = percent change from the prior Census. Right-hand figure is the unweighted mean of the five decade rates. Color is capped at ±31 percentage points.\nSource: U.S. Census Bureau decennial counts · Allegheny, Armstrong, Beaver, Butler, Fayette, Lawrence, Washington, Westmoreland.",
    file: `${ROOT}/decade-heatmap/2026-09-21_141359_western-pa-township-growth/mapped.csv`,
    filename: "western_pa_township_growth.mapped.csv",
  },
]

async function uploadPoster(poster) {
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
    rootName: poster.rootName,
    chartType: poster.chartType,
    posterTheme: poster.posterTheme,
    xField: poster.xField,
    chartTitle: poster.chartTitle,
    yLabel: poster.yLabel,
    xLabel: poster.xLabel,
    caption: poster.caption,
    dataFile: {
      _type: "file",
      asset: {_type: "reference", _ref: asset._id},
    },
  })
  return {_id: poster._id, rootName: poster.rootName, chartType: poster.chartType}
}

async function main() {
  const results = []
  for (const poster of posters) results.push(await uploadPoster(poster))
  console.log(JSON.stringify(results, null, 2))
}

main().catch((error) => {
  console.error(error.message || error)
  process.exit(1)
})
