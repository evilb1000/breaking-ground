import { headers } from "next/headers";
import Link from "next/link";
import HomepageTopRibbon from "@/components/homepage/HomepageTopRibbon";
import HomepageEventBanner from "@/components/homepage/HomepageEventBanner";
import InsightsDataTable from "@/components/insights/InsightsDataTable";
import type { SparklineJson } from "@/data/sparkline_types";

export const revalidate = 3600; // re-fetch at most once per hour

export const metadata = {
  title: "Data Insights | Breaking Ground",
  description: "Construction industry economic indicators and market data.",
};

async function getInsightsData(): Promise<SparklineJson> {
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const res = await fetch(`${protocol}://${host}/data/sparkline_test.json`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`Failed to load insights data: ${res.status}`);
  return res.json() as Promise<SparklineJson>;
}

export default async function DataInsightsPage() {
  const data = await getInsightsData();
  const latestPeriod = new Date(data.latest_period + "-01").toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <main className="min-h-screen bg-white text-[#312e28]">
      <HomepageTopRibbon />

      {/* Page banner */}
      <section className="relative border-b border-[#2d567b] bg-[#285a8a]">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.15),rgba(0,0,0,0.2))]" />
        <div className="relative mx-auto flex h-[148px] w-full max-w-[1440px] items-end px-6 pb-6 text-white">
          <div className="mx-auto w-[922px] text-right">
            <p className="bg-font-roboto text-[14px] leading-[18px]">
              <Link href="/" className="underline">
                Home
              </Link>{" "}
              / <span className="text-white/70">Data Insights</span>
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto w-full max-w-[1200px] px-4 pb-[72px] pt-[40px] md:px-[26px]">
        <div className="mb-[32px] flex flex-col gap-[8px] md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="bg-type-h1 text-[#312e28]">Data Insights</h1>
            <p className="bg-font-roboto mt-[8px] text-[14px] text-[#312e28]/70">
              Construction industry indicators · Latest period: {latestPeriod} ·{" "}
              {data.series.length} series tracked
            </p>
          </div>
          <div className="flex items-center gap-[16px] bg-font-roboto text-[12px] text-[#312e28]/60">
            <span className="inline-flex items-center gap-[4px]">
              <span className="text-[10px] text-[#1a7a4a]">▲</span> Increase
            </span>
            <span className="inline-flex items-center gap-[4px]">
              <span className="text-[10px] text-[#c85006]">▼</span> Decrease
            </span>
            <span className="inline-flex items-center gap-[4px]">
              <svg width="24" height="10" viewBox="0 0 24 10" fill="none" aria-hidden="true">
                <polyline points="0,8 6,4 12,6 18,2 24,4" stroke="#ff611d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Up trend
            </span>
            <span className="inline-flex items-center gap-[4px]">
              <svg width="24" height="10" viewBox="0 0 24 10" fill="none" aria-hidden="true">
                <polyline points="0,2 6,4 12,3 18,7 24,8" stroke="#113251" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Down trend
            </span>
          </div>
        </div>

        <InsightsDataTable series={data.series} />
      </section>

      <div className="mx-auto w-full max-w-[1440px] px-4 md:px-[26px]">
        <HomepageEventBanner
          title="Come Join Us At the 2025 Evening of Excellence"
          subtitle="Event starts 8:00 pm on 04.13.2026"
          body="Join us for an unforgettable evening of celebration, inspiration, and impact."
          ctaLabel="Register here"
          ctaHref="https://www.mbawpa.org/events/mba-young-constructors-leadership-development-seminar/"
        />
      </div>
    </main>
  );
}
