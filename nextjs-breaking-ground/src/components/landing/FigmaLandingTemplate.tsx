import Link from "next/link";
import type { ReactNode } from "react";
import HomepageTopRibbon from "@/components/homepage/HomepageTopRibbon";
import HomepageEventBanner from "@/components/homepage/HomepageEventBanner";

const FALLBACK_TILE_IMAGE = "/figma-assets/landing-asset-1.png";
const FILTER_ICON = "/figma-assets/landing-asset-2.svg";

export type LandingItem = {
  id: string;
  title: string;
  summary?: string;
  sourceLabel?: string;
  href: string;
  imageSrc?: string | null;
  imageAlt?: string;
  dateLabel?: string;
  readTimeLabel?: string;
  external?: boolean;
};

type FigmaLandingTemplateProps = {
  pageTitle: string;
  breadcrumbCurrent: string;
  featuredItem?: LandingItem;
  tiles: LandingItem[];
  currentListLabel?: string;
  showFilter?: boolean;
  loadMoreHref?: string;
  loadMoreLabel?: string;
  loadMoreExternal?: boolean;
  variant?: "default" | "newsFeed";
  pagination?: {
    currentPage: number;
    totalPages: number;
    buildHref: (page: number) => string;
  };
};

function ItemLink({
  href,
  external,
  className,
  children,
}: {
  href: string;
  external?: boolean;
  className?: string;
  children: ReactNode;
}) {
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

function TileCard({ item }: { item: LandingItem }) {
  return (
    <ItemLink href={item.href} external={item.external} className="group block w-[292px]">
      <div className="h-[190px] w-[292px] overflow-hidden rounded-[4px] bg-gray-100">
        <img
          src={item.imageSrc || FALLBACK_TILE_IMAGE}
          alt={item.imageAlt || item.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
      </div>
      <div className="mt-[16px] flex flex-col gap-[5px]">
        <div className="flex items-center gap-[12px]">
          <p className="bg-type-meta text-[#312e28]">{item.dateLabel || "APRIL 15, 2026"}</p>
          <div className="flex items-center gap-[4px]">
            <span className="inline-block h-[12px] w-[12px] rounded-full border border-[#312e28]/70" />
            <p className="bg-type-meta text-[#312e28]">{item.readTimeLabel || "3 MIN READ"}</p>
          </div>
        </div>
        <p className="bg-type-h3 text-[#312e28] group-hover:underline">{item.title}</p>
        {item.summary ? <p className="bg-type-body text-[#312e28]">{item.summary}</p> : null}
      </div>
    </ItemLink>
  );
}

export default function FigmaLandingTemplate({
  pageTitle,
  breadcrumbCurrent,
  featuredItem,
  tiles,
  currentListLabel = "Current news",
  showFilter = true,
  loadMoreHref,
  loadMoreLabel = "Load more",
  loadMoreExternal = false,
  variant = "default",
  pagination,
}: FigmaLandingTemplateProps) {
  return (
    <main className="min-h-screen bg-white text-[#312e28]">
      <HomepageTopRibbon />

      <section className="relative border-b border-[#2d567b] bg-[#285a8a]">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.15),rgba(0,0,0,0.2))]" />
        <div className="relative mx-auto flex h-[148px] w-full max-w-[1440px] items-end px-6 pb-6 text-white">
          <div className="mx-auto w-[922px] text-right">
            {variant === "default" ? (
              <p className="bg-font-roboto text-[14px] leading-[18px]">
                <Link href="/" className="underline">
                  Home
                </Link>{" "}
                / <span className="text-white/70">{breadcrumbCurrent}</span>
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[922px] px-4 pb-[72px] pt-[40px] md:px-0">
        {pageTitle ? <h1 className="bg-type-h1 text-[#312e28]">{pageTitle}</h1> : null}

        {variant === "default" && featuredItem ? (
          <ItemLink
            href={featuredItem.href}
            external={featuredItem.external}
            className="mt-[48px] grid grid-cols-[476px_1fr] gap-[20px] group"
          >
            <div className="h-[297px] overflow-hidden rounded-[4px] bg-gray-100">
              <img
                src={featuredItem.imageSrc || FALLBACK_TILE_IMAGE}
                alt={featuredItem.imageAlt || featuredItem.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
            </div>
            <div className="flex h-[298px] flex-col justify-center bg-[#f5f3f0] px-[24px] pb-[42px] pt-[20px]">
              <p className="bg-type-tag text-[#ff611d]">ARTICLE TAG</p>
              <p className="bg-type-h2 mt-[12px] text-[#312e28]">{featuredItem.title}</p>
              <div className="mt-[12px] flex items-center gap-[12px]">
                <p className="bg-type-meta text-[#312e28]">{featuredItem.dateLabel || "APRIL 15, 2026"}</p>
                <p className="bg-type-meta text-[#312e28]">{featuredItem.readTimeLabel || "3 MIN READ"}</p>
              </div>
              {featuredItem.summary ? <p className="bg-type-body mt-[20px] text-[#312e28]">{featuredItem.summary}</p> : null}
              <span className="mt-[20px] inline-flex w-[156px] items-center justify-center rounded-[4px] bg-[#113251] p-[12px] bg-font-roboto text-[12px] font-bold text-white">
                Read more
              </span>
            </div>
          </ItemLink>
        ) : null}

        <div className="mt-[48px]">
          <div className="flex items-end justify-between">
            <h2 className="bg-type-h2 text-[#312e28]">{currentListLabel}</h2>
            {variant === "default" && showFilter ? (
              <button type="button" className="inline-flex items-center gap-[4px] bg-font-roboto text-[16px] text-[#312e28]">
                <span>Filter</span>
                <img src={FILTER_ICON} alt="" className="h-[20px] w-[20px]" />
              </button>
            ) : null}
          </div>

          {variant === "newsFeed" ? (
            <>
              <div className="mt-[24px] flex flex-col divide-y divide-[#312e28]/25 border-y-2 border-[#312e28]/25">
                {tiles.map((item) => (
                  <article key={item.id} className="py-[34px]">
                    <ItemLink
                      href={item.href}
                      external={item.external}
                      className="group inline-block"
                    >
                      <h3 className="bg-font-roboto-condensed text-[30px] leading-[36px] font-medium text-[#113251] no-underline group-hover:underline underline-offset-[8px] decoration-[#113251] transition-colors">
                        {item.title}
                      </h3>
                    </ItemLink>
                    <p className="mt-[14px] bg-font-roboto text-[20px] leading-[28px] font-semibold text-[#312e28]">
                      {item.sourceLabel ? `${item.sourceLabel} • ` : ""}
                      {item.dateLabel || "APRIL 15, 2026"}
                    </p>
                    {item.summary ? (
                      <p className="mt-[16px] bg-font-crimson text-[18px] leading-[28px] text-[#312e28]">
                        {item.summary}
                      </p>
                    ) : null}
                  </article>
                ))}
              </div>
              {pagination && pagination.totalPages > 1 ? (
                <nav className="mt-[28px] flex flex-wrap items-center gap-[10px]" aria-label="News pages">
                  {Array.from({ length: pagination.totalPages }, (_, idx) => idx + 1).map((pageNum) => {
                    const isCurrent = pageNum === pagination.currentPage;
                    return (
                      <Link
                        key={pageNum}
                        href={pagination.buildHref(pageNum)}
                        aria-current={isCurrent ? "page" : undefined}
                        className={`inline-flex min-w-[36px] items-center justify-center rounded-[4px] border px-[10px] py-[6px] bg-font-roboto text-[14px] leading-[18px] ${
                          isCurrent
                            ? "border-[#113251] bg-[#113251] font-bold text-white"
                            : "border-[#113251]/30 text-[#113251] hover:border-[#113251]"
                        }`}
                      >
                        {pageNum}
                      </Link>
                    );
                  })}
                </nav>
              ) : null}
            </>
          ) : (
            <div className="mt-[31px] grid grid-cols-3 gap-x-[23px] gap-y-[25px]">
              {tiles.slice(0, 6).map((item) => (
                <TileCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {loadMoreHref && variant === "default" ? (
          <div className="mt-[48px] flex justify-center">
            <ItemLink
              href={loadMoreHref}
              external={loadMoreExternal}
              className="inline-flex items-center gap-[5px] bg-font-helvetica text-[14px] text-[#1e1e1e]"
            >
              <span>{loadMoreLabel}</span>
              <span className="text-[20px] leading-none">⌄</span>
            </ItemLink>
          </div>
        ) : null}
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
