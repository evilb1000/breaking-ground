import Link from "next/link";
import HomepageTopRibbon from "@/components/homepage/HomepageTopRibbon";
import HomepageEventBanner from "@/components/homepage/HomepageEventBanner";
import { getHomepageEventBannerProps } from "@/lib/homepageEvent";

export default async function AboutPage() {
  const eventBanner = await getHomepageEventBannerProps();

  return (
    <main className="min-h-screen bg-white text-[#312e28]">
      <HomepageTopRibbon />

      <section className="relative border-b border-[#2d567b] bg-[#285a8a]">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.15),rgba(0,0,0,0.2))]" />
        <div className="relative mx-auto flex h-[148px] w-full max-w-[1440px] items-end px-6 pb-6 text-white">
          <div className="mx-auto w-[922px] text-right">
            <p className="bg-font-roboto text-[14px] leading-[18px]">
              <Link href="/" className="underline">
                Home
              </Link>{" "}
              / <span className="text-white/70">About</span>
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[922px] px-4 pb-[72px] pt-[40px] md:px-0">
        <h1 className="bg-type-h1 text-[#312e28]">About Breaking Ground</h1>

        <div className="mt-[32px] flex flex-col gap-[20px]">
          <p className="bg-type-body text-[#312e28]">
            BreakingGround is the premiere source for construction and development
            news in Pittsburgh and Western Pennsylvania. Operated by the Master
            Builders&rsquo; Association of Western Pennsylvania, we provide
            reporting, market insight, and economic data for professionals across
            the construction and real estate industries.
          </p>
          <p className="bg-type-body text-[#312e28]">
            The platform covers major projects, infrastructure investment,
            development activity, and economic trends shaping Western
            Pennsylvania. Our readers include developers, architects, engineers,
            contractors, suppliers, and public officials involved in all facets of
            building.
          </p>
        </div>

        <div className="mt-[40px] flex flex-col gap-[18px] border-t border-[#d8d1c6] pt-[28px]">
          <p className="bg-type-body text-[#312e28]">
            Breaking Ground is a publication of the Master Builders&rsquo; Association
            of Western Pennsylvania. The content presented on this website and in
            associated digital publications is intended for informational,
            editorial, and industry discussion purposes only. Opinions expressed
            in articles, interviews, guest contributions, and commentary are those
            of the respective authors and do not necessarily reflect the views of
            the Master Builders&rsquo; Association, its leadership, members, sponsors,
            or affiliates.
          </p>
          <p className="bg-type-body text-[#312e28]">
            While reasonable efforts are made to ensure accuracy, Breaking Ground
            does not guarantee the completeness, reliability, or timeliness of
            information contained within the publication. Market data, economic
            commentary, project information, forecasts, and industry analysis are
            subject to change and should not be relied upon as legal, financial,
            engineering, construction, or professional advice. Readers should
            consult qualified professionals regarding specific situations or
            decisions.
          </p>
          <p className="bg-type-body text-[#312e28]">
            References to companies, products, projects, organizations, or
            services do not constitute endorsement unless explicitly stated.
            Sponsored content, advertisements, and partner materials may appear
            throughout the publication and are identified separately from
            editorial content where applicable.
          </p>
          <p className="bg-type-body text-[#312e28]">
            All content, unless otherwise noted, is the property of Breaking
            Ground and/or its respective contributors and may not be reproduced
            without permission.
          </p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-[1440px] px-4 md:px-[26px]">
        <HomepageEventBanner {...eventBanner} />
      </div>
    </main>
  );
}
