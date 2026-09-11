export type RollingAverageCopy = {
  chartTitle: string
  yLabel: string
  xLabel: string
}

const COPY: Record<string, RollingAverageCopy> = {
  national_construction_starts_rolling_12_month_average_through_2026_q1: {
    chartTitle: "CONSTRUCTION STARTS RESET",
    yLabel: "NATIONAL INDUSTRIAL SUPPLY",
    xLabel: "Rolling 12-month average · quarterly construction starts",
  },
  national_net_absorption_rolling_12_month_average_through_2026_q1: {
    chartTitle: "NET ABSORPTION FINDS ITS FLOOR",
    yLabel: "NATIONAL INDUSTRIAL DEMAND",
    xLabel: "Rolling 12-month average · quarterly net absorption",
  },
}

export function getRollingAverageCopy(rootName?: string | null): RollingAverageCopy | null {
  if (!rootName) return null
  return COPY[rootName] || null
}
