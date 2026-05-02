import Link from "next/link";
import HomepageTopRibbon from "@/components/homepage/HomepageTopRibbon";
import HomepageEventBanner from "@/components/homepage/HomepageEventBanner";
import { client } from "@/sanity/client";

export const revalidate = 0;

const SPONSORS_QUERY = `*[_type == "sponsor" && active == true] | order(name asc) {
  _id,
  name,
  websiteUrl,
  "logoUrl": logo.asset->url,
  "logoAlt": logo.alt
}`;

type Sponsor = {
  _id: string;
  name?: string;
  websiteUrl?: string;
  logoUrl?: string;
  logoAlt?: string;
};

const options = { next: { revalidate: 0 } };

function SponsorCard({ sponsor }: { sponsor: Sponsor }) {
  const card = (
    <article className="flex min-h-[220px] flex-col justify-between border border-[#312e28]/20 bg-[#f5f3f0] p-[20px] transition-colors hover:border-[#113251]/50">
      <div>
        <h2 className="bg-font-roboto-condensed text-[24px] leading-[30px] font-medium text-[#312e28]">
          {sponsor.name || "Untitled Sponsor"}
        </h2>
      </div>

      <div className="mt-[28px] flex h-[96px] items-center justify-center bg-white p-[16px]">
        {sponsor.logoUrl ? (
          <img
            src={sponsor.logoUrl}
            alt={sponsor.logoAlt || sponsor.name || ""}
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <p className="bg-font-roboto text-[13px] font-semibold tracking-[0.08em] text-[#adadad] uppercase">
            None available
          </p>
        )}
      </div>
    </article>
  );

  if (!sponsor.websiteUrl) return card;

  return (
    <a href={sponsor.websiteUrl} target="_blank" rel="noopener noreferrer" className="block">
      {card}
    </a>
  );
}

export default async function SponsorsPage() {
  const sponsors = await client.fetch<Sponsor[]>(SPONSORS_QUERY, {}, options);

  return (
    <main className="min-h-screen bg-white text-[#312e28]">
      <HomepageTopRibbon />

      <section className="relative border-b border-[#2d567b] bg-[#285a8a]">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.15),rgba(0,0,0,0.2))]" />
        <div className="relative mx-auto flex h-[96px] w-full max-w-[1440px] items-end px-[20px] pb-[18px] text-white lg:h-[148px] lg:px-6 lg:pb-6">
          <div className="mx-auto w-full max-w-[922px] text-left lg:text-right">
            <p className="bg-font-roboto text-[14px] leading-[18px]">
              <Link href="/" className="underline">
                Home
              </Link>{" "}
              / <span className="text-white/70">Sponsors</span>
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[922px] px-[20px] pb-[72px] pt-[40px] lg:px-0">
        <h1 className="bg-type-h1 text-[#312e28]">Our Sponsors</h1>
        <p className="bg-type-body mt-[20px] max-w-[640px] text-[#312e28]">
          Breaking Ground is supported by companies investing in the construction and development community across Western Pennsylvania.
        </p>

        {sponsors.length > 0 ? (
          <div className="mt-[40px] grid grid-cols-1 gap-[20px] sm:grid-cols-2 lg:grid-cols-3">
            {sponsors.map((sponsor) => (
              <SponsorCard key={sponsor._id} sponsor={sponsor} />
            ))}
          </div>
        ) : (
          <p className="bg-type-body mt-[40px] text-[#adadad]">None available</p>
        )}
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
