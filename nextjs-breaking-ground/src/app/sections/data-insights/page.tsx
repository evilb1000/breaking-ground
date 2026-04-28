import { headers } from "next/headers";
import Link from "next/link";
import HomepageTopRibbon from "@/components/homepage/HomepageTopRibbon";
import HomepageEventBanner from "@/components/homepage/HomepageEventBanner";
import InsightsDataTable from "@/components/insights/InsightsDataTable";
import type { SparklineJson } from "@/data/sparkline_types";

export const revalidate = 3600; // re-fetch at most once per hour

export const metadata = {
  title: "Pricing Insights | Breaking Ground",
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

  return (
    <main className="min-h-screen bg-white text-[#312e28]">
      <HomepageTopRibbon />

      {/* Page banner */}
      <section className="relative border-b border-[#2d567b] bg-[#285a8a]">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.15),rgba(0,0,0,0.2))]" />
        <div className="relative mx-auto flex h-[96px] w-full max-w-[1440px] items-end px-[20px] pb-[18px] text-white lg:h-[148px] lg:px-6 lg:pb-6">
          <div className="mx-auto w-full max-w-[922px] text-left lg:text-right">
            <p className="bg-font-roboto text-[14px] leading-[18px]">
              <Link href="/" className="underline">
                Home
              </Link>{" "}
              / <span className="text-white/70">Pricing Insights</span>
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto w-full max-w-[1200px] px-[16px] pb-[56px] pt-[32px] md:px-[26px] md:pb-[72px] md:pt-[40px]">
        <div className="mb-[24px] flex flex-col gap-[14px] md:mb-[32px] md:flex-row md:items-end md:justify-between">
          <div>
            <h1
              className="bg-font-roboto-flex text-[28px] leading-[34px] text-[#312e28] md:bg-type-h1"
              style={{
                fontVariationSettings:
                  "'GRAD' 0, 'XOPQ' 96, 'XTRA' 468, 'YOPQ' 79, 'YTAS' 750, 'YTDE' -203, 'YTFI' 738, 'YTLC' 514, 'YTUC' 712, 'wdth' 100",
                fontWeight: 838,
              }}
            >
              Pricing Insights
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-x-[14px] gap-y-[8px] bg-font-roboto text-[12px] text-[#312e28]/60">
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

      <div className="mx-auto w-full max-w-[1440px] px-[16px] md:px-[26px]">
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
