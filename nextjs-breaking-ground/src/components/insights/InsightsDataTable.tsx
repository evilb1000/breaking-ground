import { Fragment } from "react";
import type { ReactNode } from "react";
import type { SparklineSeries } from "@/data/sparkline_types";
import InsightsAdUnit from "./InsightsAdUnit";
import { selectAdForPlacement, type AdCreative } from "@/lib/ads";

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
  className = "",
}: {
  points: [number, number][];
  isUp: boolean;
  className?: string;
}) {
  const pointsStr = points.map(([x, y]) => `${x},${y}`).join(" ");
  const color = isUp ? "#ff611d" : "#113251";
  return (
    <svg
      width="100"
      height="24"
      viewBox="0 0 100 24"
      preserveAspectRatio="none"
      className={className}
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

function MobileMetric({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-[4px] bg-white px-[10px] py-[8px]">
      <p className="bg-font-roboto text-[10px] font-bold uppercase leading-[14px] tracking-[0.08em] text-[#312e28]/50">
        {label}
      </p>
      <div className="mt-[2px] bg-font-roboto text-[13px] leading-[18px] text-[#312e28]">
        {children}
      </div>
    </div>
  );
}

function MobileSeriesCard({ s }: { s: SparklineSeries }) {
  const latestPeriod = fmtPeriod(s.sparkline_24m.periods[s.sparkline_24m.periods.length - 1]);

  return (
    <article className="border-b border-[#e1e1e1] bg-[#f5f3f0] p-[14px]">
      <div className="flex flex-col gap-[10px]">
        <div>
          <h3 className="bg-font-roboto-condensed text-[17px] font-medium leading-[22px] text-[#312e28]">
            {s.material_name}
          </h3>
          <p className="mt-[2px] bg-font-roboto text-[11px] leading-[16px] text-[#312e28]/55">
            Latest observation: {latestPeriod}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-[8px]">
          <MobileMetric label="Latest">
            <span className="tabular-nums">{fmtLarge(s.latest_value)}</span>
          </MobileMetric>
          <MobileMetric label="MoM">
            <ChangeCell value={s.MoM_Change} />
          </MobileMetric>
          <MobileMetric label="YoY">
            <ChangeCell value={s.YoY_Change} />
          </MobileMetric>
          <MobileMetric label="Since Mar 2020">
            <ChangeCell value={s.change_since_mar2020} />
          </MobileMetric>
        </div>

        <div className="rounded-[4px] bg-white px-[10px] py-[8px]">
          <div className="flex items-center justify-between gap-[12px]">
            <p className="bg-font-roboto text-[10px] font-bold uppercase leading-[14px] tracking-[0.08em] text-[#312e28]/50">
              24M Trend
            </p>
            <p className="bg-font-roboto text-[10px] leading-[14px] text-[#312e28]/45">
              {s.sparkline_24m.is_up_from_start ? "Up" : "Down"} over window
            </p>
          </div>
          <div className="mt-[8px] h-[38px] w-full overflow-hidden">
            <Sparkline
              points={s.sparkline_24m.points}
              isUp={s.sparkline_24m.is_up_from_start}
              className="h-full w-full"
            />
          </div>
        </div>
      </div>
    </article>
  );
}

function MobileClusterCards({ cluster, series }: { cluster: string; series: SparklineSeries[] }) {
  const sorted = [...series].sort((a, b) => a.rank_in_cluster - b.rank_in_cluster);
  return (
    <section className="mb-[28px] overflow-hidden rounded-[4px] border border-[#d8d8d8] md:hidden">
      <div className="bg-[#113251] px-[14px] py-[10px]">
        <h2 className="bg-type-nav text-white">{cluster}</h2>
      </div>
      <div>
        {sorted.map((s) => (
          <MobileSeriesCard key={s.series_id} s={s} />
        ))}
      </div>
    </section>
  );
}

function ClusterTable({ cluster, series }: { cluster: string; series: SparklineSeries[] }) {
  const sorted = [...series].sort((a, b) => a.rank_in_cluster - b.rank_in_cluster);
  return (
    <div className="mb-[40px] hidden md:block">
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
            <th className="px-[16px] py-[10px] text-right bg-type-nav text-[#312e28]">Since Mar 2020</th>
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


export default function InsightsDataTable({
  series,
  ads,
}: {
  series: SparklineSeries[];
  ads?: AdCreative[];
}) {
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
    <div className="w-full">
      {allClusters.map((cluster, i) => (
        <Fragment key={cluster}>
          <MobileClusterCards cluster={cluster} series={byCluster[cluster]} />
          <ClusterTable cluster={cluster} series={byCluster[cluster]} />
          {/* Ad after table 1 (index 0), then every other: index 0, 2, 4, 6 */}
          {i % 2 === 0 && i < allClusters.length - 1 ? (
            <InsightsAdUnit ad={selectAdForPlacement(ads, "data", i)} />
          ) : null}
        </Fragment>
      ))}
    </div>
  );
}
