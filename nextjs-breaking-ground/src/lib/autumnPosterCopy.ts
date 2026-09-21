export type AutumnPosterCopy = {
  chartTitle: string
  yLabel: string
  xLabel: string
  caption: string
}

const COPY: Record<string, AutumnPosterCopy> = {
  washington_county_population_1950_2020: {
    chartTitle: "WASHINGTON COUNTY NEVER CLEARED ITS 1960 HIGH",
    yLabel: "WASHINGTON COUNTY",
    xLabel: "Decennial Census resident population · 1950–2020 · counts, not percent",
    caption:
      "Source: U.S. Census Bureau, decennial Census, April 1. Not ACS population estimates. Axis is cropped to the series range so decade-to-decade movement is readable.",
  },
  washington_county_township_growth_over_5pct: {
    chartTitle: "FIFTEEN WASHINGTON COUNTY MUNICIPALITIES GREW BY MORE THAN 5%",
    yLabel: "WASHINGTON COUNTY",
    xLabel: "Decennial Census resident population · townships · 1970–2020 · up more than 5%",
    caption:
      "Source: U.S. Census Bureau, decennial Census, April 1. Townships only. Threshold is 1970–2020 change of more than 5 percent. Cities and boroughs omitted.",
  },
  washington_county_oldest_municipalities: {
    chartTitle: "WASHINGTON COUNTY'S OLDEST MUNICIPALITIES",
    yLabel: "WASHINGTON COUNTY",
    xLabel: "Share of residents age 65 or older · 2020 Census · places with 1,000 or more residents",
    caption:
      "Tick on each bar is the county share (21.6%). Ranked by percent, not headcount. Places with fewer than 1,000 residents omitted.\nSource: IPUMS NHGIS B57 · decennial Census, April 1, 2020 · Washington County FIPS 42125.",
  },
  washington_county_employment_industries: {
    chartTitle: "HEALTHCARE EMPLOYS THE MOST",
    yLabel: "WASHINGTON COUNTY",
    xLabel: "Private jobs and pay by industry · 2023",
    caption:
      "Bar length is jobs. Color and figures are annual pay per job. Private employers only. Not occupation. Not government.\nSource: Census County Business Patterns 2023 · FIPS 42125. Pay is annual payroll ÷ March employment.",
  },
  western_pa_township_growth: {
    chartTitle: "WESTERN PENNSYLVANIA'S FASTEST GROWING TOWNSHIPS SINCE 1970",
    yLabel: "WESTERN PENNSYLVANIA",
    xLabel: "Eight-county Western Pennsylvania · townships with 4,500 or more residents in 1970 · ranked by 1970–2020 change",
    caption:
      "Cell = percent change from the prior Census. Right-hand figure is the unweighted mean of the five decade rates. Color is capped at ±31 percentage points.\nSource: U.S. Census Bureau decennial counts · Allegheny, Armstrong, Beaver, Butler, Fayette, Lawrence, Washington, Westmoreland.",
  },
}

export function getAutumnPosterCopy(rootName?: string | null): AutumnPosterCopy | null {
  if (!rootName) return null
  return COPY[rootName] || null
}
