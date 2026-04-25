import type { SparklineSeries } from "@/data/sparkline_types";

const CLUSTER_ORDER = [
  "Overhead Economic Indicators",
  "Construction Indexes and Inputs",
  "Construction Types",
  "Contractors/Services",
  "Metals",
  "Concrete",
  "Asphalts",
  "General",
];

function fmt(value: number, decimals = 1): string {
  return value.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function fmtPeriod(yyyyMm: string): string {
  const [year, month] = yyyyMm.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

function fmtLarge(value: number): string {
  if (Math.abs(value) >= 1_000_000) return (value / 1_000_000).toFixed(2) + "M";
  if (Math.abs(value) >= 1_000) return (value / 1_000).toFixed(1) + "K";
  return value.toLocaleString("en-US", { maximumFractionDigits: 1 });
}

function ChangeCell({ value }: { value: number }) {
  const isUp = value >= 0;
  const color = isUp ? "text-[#1a7a4a]" : "text-[#c85006]";
  const arrow = isUp ? "▲" : "▼";
  return (
    <span className={`inline-flex items-center gap-[3px] font-medium tabular-nums ${color}`}>
      <span className="text-[10px] leading-none">{arrow}</span>
      {fmt(Math.abs(value))}%
    </span>
  );
}

function Sparkline({
  points,
  isUp,
}: {
  points: [number, number][];
  isUp: boolean;
}) {
  const pointsStr = points.map(([x, y]) => `${x},${y}`).join(" ");
  const color = isUp ? "#ff611d" : "#113251";
  return (
    <svg
      width="100"
      height="24"
      viewBox="0 0 100 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <polyline
        points={pointsStr}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClusterTable({ cluster, series }: { cluster: string; series: SparklineSeries[] }) {
  const sorted = [...series].sort((a, b) => a.rank_in_cluster - b.rank_in_cluster);
  return (
    <div className="mb-[40px]">
      <div className="bg-[#113251] px-[16px] py-[10px]">
        <span className="bg-type-nav text-white">{cluster}</span>
      </div>
      <table className="w-full border-collapse table-fixed">
        <colgroup>
          <col className="w-[40%]" />
          <col className="w-[10%]" />
          <col className="w-[10%]" />
          <col className="w-[10%]" />
          <col className="w-[14%]" />
          <col className="w-[16%]" />
        </colgroup>
        <thead>
          <tr className="border-b border-[#d8d8d8] bg-[#f5f3f0]">
            <th className="px-[16px] py-[10px] text-left bg-type-nav text-[#312e28]">Indicator</th>
            <th className="px-[16px] py-[10px] text-right bg-type-nav text-[#312e28]">Latest</th>
            <th className="px-[16px] py-[10px] text-right bg-type-nav text-[#312e28]">MoM</th>
            <th className="px-[16px] py-[10px] text-right bg-type-nav text-[#312e28]">YoY</th>
            <th className="px-[16px] py-[10px] text-right bg-type-nav text-[#312e28]">Since Mar '20</th>
            <th className="px-[16px] py-[10px] text-center bg-type-nav text-[#312e28]">24M Trend</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((s, i) => (
            <tr
              key={s.series_id}
              className={`border-b border-[#ebebeb] ${i % 2 === 0 ? "bg-white" : "bg-[#f2f2f2]"}`}
            >
              <td className="px-[16px] py-[10px] bg-font-roboto text-[13px] text-[#312e28] truncate">
                {s.material_name}
              </td>
              <td className="px-[16px] py-[10px] text-right bg-font-roboto text-[13px] tabular-nums text-[#312e28]">
                <span className="block">{fmtLarge(s.latest_value)}</span>
                <span className="block text-[11px] text-[#312e28]/50 leading-none mt-[2px]">
                  {fmtPeriod(s.sparkline_24m.periods[s.sparkline_24m.periods.length - 1])}
                </span>
              </td>
              <td className="px-[16px] py-[10px] text-right bg-font-roboto text-[13px]">
                <ChangeCell value={s.MoM_Change} />
              </td>
              <td className="px-[16px] py-[10px] text-right bg-font-roboto text-[13px]">
                <ChangeCell value={s.YoY_Change} />
              </td>
              <td className="px-[16px] py-[10px] text-right bg-font-roboto text-[13px]">
                <ChangeCell value={s.change_since_mar2020} />
              </td>
              <td className="px-[16px] py-[10px] text-center">
                <div className="inline-block">
                  <Sparkline
                    points={s.sparkline_24m.points}
                    isUp={s.sparkline_24m.is_up_from_start}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function InsightsDataTable({ series }: { series: SparklineSeries[] }) {
  const byCluster = CLUSTER_ORDER.reduce<Record<string, SparklineSeries[]>>((acc, cluster) => {
    acc[cluster] = series.filter((s) => s.cluster === cluster);
    return acc;
  }, {});

  // catch any clusters not in CLUSTER_ORDER
  const extraClusters = [...new Set(series.map((s) => s.cluster))].filter(
    (c) => !CLUSTER_ORDER.includes(c)
  );
  extraClusters.forEach((c) => {
    byCluster[c] = series.filter((s) => s.cluster === c);
  });

  const allClusters = [...CLUSTER_ORDER, ...extraClusters].filter(
    (c) => byCluster[c]?.length > 0
  );

  return (
    <div className="w-full overflow-x-auto">
      {allClusters.map((cluster) => (
        <ClusterTable key={cluster} cluster={cluster} series={byCluster[cluster]} />
      ))}
    </div>
  );
}
