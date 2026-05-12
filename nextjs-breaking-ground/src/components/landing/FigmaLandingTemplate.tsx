import Link from "next/link";
import { Fragment } from "react";
import type { ReactNode } from "react";
import HomepageTopRibbon from "@/components/homepage/HomepageTopRibbon";
import HomepageEventBanner, {
  type HomepageEventBannerProps,
} from "@/components/homepage/HomepageEventBanner";
import InsightsAdUnit from "@/components/insights/InsightsAdUnit";
import { adPlacementForSurface, getAdsForSurface, selectAdForPlacement, type AdSurface } from "@/lib/ads";
import { getHomepageEventBannerProps } from "@/lib/homepageEvent";

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
  tagLabel?: string;
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
  adSurface?: AdSurface;
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
    <ItemLink href={item.href} external={item.external} className="group block w-full lg:w-[292px]">
      <div className="h-[190px] w-full overflow-hidden rounded-[4px] bg-gray-100 lg:w-[292px]">
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
        <p className="bg-font-roboto-condensed text-[16px] font-medium leading-[22px] text-[#312e28] group-hover:underline lg:text-[20px] lg:leading-[26px]">{item.title}</p>
        {item.summary ? <p className="bg-font-crimson text-[14px] leading-[20px] text-[#312e28] lg:text-[16px] lg:leading-[22px]">{item.summary}</p> : null}
      </div>
    </ItemLink>
  );
}

export default async function FigmaLandingTemplate({
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
  adSurface,
  pagination,
}: FigmaLandingTemplateProps) {
  const resolvedAdSurface = adSurface || (variant === "newsFeed" ? "news" : "articles");
  const adPlacement = adPlacementForSurface(resolvedAdSurface);
  const [eventBanner, ads] = await Promise.all([
    getHomepageEventBannerProps(),
    getAdsForSurface(resolvedAdSurface),
  ]);

  return (
    <main className="min-h-screen bg-white text-[#312e28]">
      <HomepageTopRibbon />

      <section className="relative border-b border-[#2d567b] bg-[#285a8a]">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.15),rgba(0,0,0,0.2))]" />
        <div className="relative mx-auto flex h-[96px] w-full max-w-[1440px] items-end px-[20px] pb-[18px] text-white lg:h-[148px] lg:px-6 lg:pb-6">
          <div className="mx-auto w-full max-w-[922px] text-left lg:text-right">
            {breadcrumbCurrent ? (
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

      <section className="mx-auto w-full max-w-[922px] px-[20px] pb-[56px] pt-[32px] lg:px-0 lg:pb-[72px] lg:pt-[40px]">
        {pageTitle ? (
          <h1
            className="bg-font-roboto-flex text-[28px] leading-[34px] text-[#312e28] lg:text-[36px] lg:leading-[44px]"
            style={{
              fontVariationSettings:
                "'GRAD' 0, 'XOPQ' 96, 'XTRA' 468, 'YOPQ' 79, 'YTAS' 750, 'YTDE' -203, 'YTFI' 738, 'YTLC' 514, 'YTUC' 712, 'wdth' 100",
              fontWeight: 838,
            }}
          >
            {pageTitle}
          </h1>
        ) : null}

        {variant === "default" && featuredItem ? (
          <ItemLink
            href={featuredItem.href}
            external={featuredItem.external}
            className="group mt-[32px] flex flex-col gap-0 lg:mt-[48px] lg:grid lg:grid-cols-[476px_1fr] lg:gap-[20px]"
          >
            <div className="h-[214px] overflow-hidden rounded-t-[4px] bg-gray-100 lg:h-[297px] lg:rounded-[4px]">
              <img
                src={featuredItem.imageSrc || FALLBACK_TILE_IMAGE}
                alt={featuredItem.imageAlt || featuredItem.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
            </div>
            <div className="flex flex-col justify-center rounded-b-[4px] bg-[#f5f3f0] px-[20px] py-[24px] lg:h-[298px] lg:rounded-none lg:px-[24px] lg:pb-[42px] lg:pt-[20px]">
              {featuredItem.tagLabel ? (
                <p className="bg-type-tag text-[#ff611d]">{featuredItem.tagLabel.toUpperCase()}</p>
              ) : null}
              <p
                className="mt-[12px] bg-font-roboto-flex text-[22px] leading-[26px] text-[#312e28] lg:text-[28px] lg:leading-[34px]"
                style={{
                  fontVariationSettings:
                    "'GRAD' 0, 'XOPQ' 96, 'XTRA' 468, 'YOPQ' 79, 'YTAS' 750, 'YTDE' -203, 'YTFI' 738, 'YTLC' 514, 'YTUC' 712, 'wdth' 100",
                  fontWeight: 838,
                }}
              >
                {featuredItem.title}
              </p>
              <div className="mt-[12px] flex items-center gap-[12px]">
                <p className="bg-type-meta text-[#312e28]">{featuredItem.dateLabel || "APRIL 15, 2026"}</p>
                <p className="bg-type-meta text-[#312e28]">{featuredItem.readTimeLabel || "3 MIN READ"}</p>
              </div>
              {featuredItem.summary ? (
                <p className="mt-[20px] bg-font-crimson text-[14px] leading-[20px] text-[#312e28] lg:text-[16px] lg:leading-[22px]">
                  {featuredItem.summary}
                </p>
              ) : null}
              <span className="mt-[20px] inline-flex w-full items-center justify-center rounded-[4px] bg-[#113251] p-[12px] bg-font-roboto text-[12px] font-bold text-white lg:w-[156px]">
                Read more
              </span>
            </div>
          </ItemLink>
        ) : null}

        <div className="mt-[40px] lg:mt-[48px]">
          <div className="flex items-end justify-between gap-[16px]">
            <h2
              className="bg-font-roboto-flex text-[22px] leading-[26px] text-[#312e28] lg:text-[28px] lg:leading-[34px]"
              style={{
                fontVariationSettings:
                  "'GRAD' 0, 'XOPQ' 96, 'XTRA' 468, 'YOPQ' 79, 'YTAS' 750, 'YTDE' -203, 'YTFI' 738, 'YTLC' 514, 'YTUC' 712, 'wdth' 100",
                fontWeight: 838,
              }}
            >
              {currentListLabel}
            </h2>
            {variant === "default" && showFilter ? (
              <button type="button" className="inline-flex shrink-0 items-center gap-[4px] bg-font-roboto text-[14px] text-[#312e28] lg:text-[16px]">
                <span>Filter</span>
                <img src={FILTER_ICON} alt="" className="h-[20px] w-[20px]" />
              </button>
            ) : null}
          </div>

          {variant === "newsFeed" ? (
            <>
              <div className="mt-[24px] flex flex-col divide-y divide-[#312e28]/25 border-y-2 border-[#312e28]/25">
                {tiles.map((item, i) => (
                  <Fragment key={item.id}>
                    <article className="py-[26px] lg:py-[34px]">
                      <ItemLink
                        href={item.href}
                        external={item.external}
                        className="group inline-block"
                      >
                        <h3 className="bg-font-roboto-condensed text-[22px] leading-[28px] font-medium text-[#113251] no-underline group-hover:underline underline-offset-[8px] decoration-[#113251] transition-colors lg:text-[30px] lg:leading-[36px]">
                          {item.title}
                        </h3>
                      </ItemLink>
                      <p className="mt-[12px] bg-font-roboto text-[14px] leading-[22px] font-semibold text-[#312e28] lg:mt-[14px] lg:text-[20px] lg:leading-[28px]">
                        {item.sourceLabel ? `${item.sourceLabel} • ` : ""}
                        {item.dateLabel || "APRIL 15, 2026"}
                      </p>
                      {item.summary ? (
                        <p className="mt-[12px] bg-font-crimson text-[16px] leading-[24px] text-[#312e28] lg:mt-[16px] lg:text-[18px] lg:leading-[28px]">
                          {item.summary}
                        </p>
                      ) : null}
                    </article>
                    {/* Ad after article 1 (index 0), then every other: 0, 2, 4, 6... */}
                    {i % 2 === 0 ? (
                      <div className="py-[8px] lg:py-0">
                        <InsightsAdUnit ad={selectAdForPlacement(ads, adPlacement, i)} />
                      </div>
                    ) : null}
                  </Fragment>
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
            <div className="mt-[24px] grid grid-cols-1 gap-y-[32px] sm:grid-cols-2 sm:gap-x-[20px] lg:mt-[31px] lg:grid-cols-3 lg:gap-x-[23px] lg:gap-y-[25px]">
              {tiles.slice(0, 6).map((item) => (
                <TileCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {loadMoreHref && variant === "default" ? (
          <div className="mt-[40px] flex justify-center lg:mt-[48px]">
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
        <HomepageEventBanner {...eventBanner} />
      </div>
    </main>
  );
}
