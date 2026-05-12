import { PortableText } from "next-sanity";
import Link from "next/link";
import HomepageTopRibbon from "@/components/homepage/HomepageTopRibbon";
import HomepageEventBanner from "@/components/homepage/HomepageEventBanner";
import ProfileAdUnit from "@/components/ads/ProfileAdUnit";
import { threeAdChunks } from "@/lib/chunkBody";
import { articleUrl } from "@/lib/urls";
import { adSurfaceForArticleSection, getAdsForSurface, profileAdPlacementForSlot, selectAdForPlacement } from "@/lib/ads";
import { getHomepageEventBannerProps } from "@/lib/homepageEvent";
import {
  articleComponents,
  formatMetaDate,
  imageSrc,
  hotspotPosition,
  relatedSlug,
  relatedTitle,
  sectionHref,
  sectionLabel,
  type FigmaArticleDoc,
  type RelatedRef,
  type NextRef,
} from "@/components/FigmaArticlePage";

/* ------------------------------------------------------------------ */
/*  Static assets (local copies of the Figma-hosted files)             */
/* ------------------------------------------------------------------ */

const HERO_MAP_TEXTURE = "/figma-assets/hero-map-texture.png";
const CLOCK_ICON = "/figma-assets/clock-dark.svg";
const FB_ICON = "/figma-assets/facebook-white.svg";
const LI_ICON = "/figma-assets/linkedin-white.svg";
const IG_ICON = "/figma-assets/instagram-white.svg";
const YT_ICON = "/figma-assets/youtube-white.svg";
const ARROW_FORWARD_DARK = "/figma-assets/arrow-forward-white.svg"; // reused; tinted via mix-blend/filter

/* ------------------------------------------------------------------ */
/*  Sidebar sub-components                                             */
/* ------------------------------------------------------------------ */

function MetaInfo({ publishedAt, readingTime }: { publishedAt?: string; readingTime?: number }) {
  const date = formatMetaDate(publishedAt) || "APRIL 15, 2026";
  const read = typeof readingTime === "number" ? `${readingTime} MIN READ` : "3 MIN READ";
  return (
    <div className="flex flex-wrap items-center gap-x-[12px] gap-y-[4px]">
      <p className="bg-font-roboto text-[10px] leading-[24px] font-normal text-[#312e28] whitespace-nowrap">
        {date}
      </p>
      <div className="flex items-center gap-[4px]">
        <img src={CLOCK_ICON} alt="" aria-hidden="true" className="h-[12px] w-[12px]" />
        <p className="bg-font-roboto text-[10px] leading-[24px] font-normal text-[#312e28] whitespace-nowrap">
          {read}
        </p>
      </div>
    </div>
  );
}

function AuthorBlock({
  author,
  coAuthors,
  authorBio,
}: {
  author?: FigmaArticleDoc["author"];
  coAuthors?: FigmaArticleDoc["coAuthors"];
  authorBio?: string;
}) {
  const authors = [author, ...(coAuthors || [])].filter((item) => item?.name);
  if (authors.length === 0 && !authorBio) return null;
  const hasAuthorBio = authors.some((item) => item?.bio);

  return (
    <div className="flex flex-col gap-[8px]">
      {authors.map((item, index) => {
        const avatar = item?.image ? imageSrc(item.image, 80) : null;
        const bio = item?.bio;

        return (
          <div key={`${item?.name}-${index}`} className="flex flex-col gap-[6px]">
            <div className="flex items-center gap-[4px]">
              {avatar ? (
                <img
                  src={avatar}
                  alt={item?.name || "Author"}
                  className="h-[17px] w-[19px] rounded-full object-cover"
                />
              ) : (
                <div className="h-[17px] w-[19px] rounded-full bg-[#d9d9d9]" aria-hidden="true" />
              )}
              <p className="bg-font-roboto text-[10px] leading-[16px] font-normal text-[#312e28] whitespace-nowrap">
                By {item?.name}
              </p>
            </div>
            {bio ? (
              <p className="bg-font-roboto text-[10px] leading-[16px] font-normal text-[#312e28]">
                {bio}
              </p>
            ) : null}
          </div>
        );
      })}
      {authorBio && !hasAuthorBio ? (
        <p className="bg-font-roboto text-[10px] leading-[16px] font-normal text-[#312e28]">
          {authorBio}
        </p>
      ) : null}
    </div>
  );
}

function SocialRow({ shareUrl, headline }: { shareUrl: string; headline: string }) {
  const url = encodeURIComponent(shareUrl);
  const title = encodeURIComponent(headline);
  const items = [
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      icon: FB_ICON,
    },
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      icon: LI_ICON,
    },
    {
      label: "X / Twitter",
      href: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
      icon: YT_ICON, // placeholder until a dedicated Twitter/X white asset is added
    },
    { label: "Instagram", href: `https://www.instagram.com/`, icon: IG_ICON },
  ];
  // Figma shows ~18px square dark-filled circles. We reuse the white social
  // assets and mask them to a dark bubble so we don't need a new asset set.
  return (
    <ul className="flex items-start gap-[8px]">
      {items.map((item) => (
        <li key={item.label}>
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Share on ${item.label}`}
            className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#312e28]"
          >
            <img src={item.icon} alt="" aria-hidden="true" className="h-[10px] w-[10px]" />
          </a>
        </li>
      ))}
    </ul>
  );
}

function Sidebar({
  publishedAt,
  readingTime,
  author,
  coAuthors,
  authorBio,
  relatedArticles,
  shareUrl,
  headline,
}: {
  publishedAt?: string;
  readingTime?: number;
  author?: FigmaArticleDoc["author"];
  coAuthors?: FigmaArticleDoc["coAuthors"];
  authorBio?: string;
  relatedArticles?: RelatedRef[];
  shareUrl: string;
  headline: string;
}) {
  const hasRelated = Array.isArray(relatedArticles) && relatedArticles.length > 0;
  return (
    <aside className="flex w-full flex-col gap-[28px] border-t border-[#d9d9d9] pt-[24px] lg:w-[206px] lg:border-t-0 lg:pt-0">
      <div className="flex w-full flex-col gap-[8px] border-b border-solid border-[#d9d9d9] pb-[28px] lg:w-[192px] lg:pb-[36px]">
        <MetaInfo publishedAt={publishedAt} readingTime={readingTime} />
        <AuthorBlock author={author} coAuthors={coAuthors} authorBio={authorBio} />
        <SocialRow shareUrl={shareUrl} headline={headline} />
      </div>

      {hasRelated ? (
        <div className="flex flex-col gap-[14px] text-[#312e28]">
          <p className="bg-font-roboto-condensed text-[20px] leading-[26px] font-medium">
            Related articles
          </p>
          <ul className="flex flex-col gap-[14px]">
            {relatedArticles!.slice(0, 3).map((rel) => {
              const img = imageSrc(
                rel.homepageImage || rel.headerImage || rel.heroImage || rel.introImage,
                220
              );

              return (
                <li key={rel._id}>
                  <Link
                    href={relatedSlug(rel)}
                    className="group flex flex-col gap-[8px] bg-font-roboto text-[14px] leading-[22px] font-normal text-[#312e28]"
                  >
                    {img ? (
                      <div className="h-[120px] w-full overflow-hidden rounded-[2px] bg-[#f5f3f0]">
                        <img
                          src={img}
                          alt={relatedTitle(rel)}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                      </div>
                    ) : null}
                    <span className="group-hover:underline">{relatedTitle(rel)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero with title overlay on dark panel                               */
/* ------------------------------------------------------------------ */

function ProfileHero({ headline, image }: { headline: string; image?: SanityImageLike }) {
  const src = image ? imageSrc(image, 1600) : null;
  const objectPosition = hotspotPosition(image);
  // Figma absolute page coordinates (node 241:2974). The Figma top ribbon is
  // pt-[36px] + 65px logo + pb-[28px] = 129px, so we subtract 129 from every
  // Figma Y to get the coordinate inside this hero <section> which mounts
  // immediately below the ribbon. Horizontal values are kept as raw Figma
  // numbers inside a centered 1440px container.
  //
  //   Figma Y → hero-relative Y
  //   ---------------------------
  //   Hero image visible top  298 →  169  (922 x 447)
  //   Dark rectangle top      465 →  336  (727 x 157,  left 356)
  //   Headline top            498 →  369  (w 686,      left 377)
  return (
    <section className="relative w-full">
      <div className="relative h-[354px] lg:hidden">
        <div className="h-[260px] w-full overflow-hidden bg-[#d9d9d9]">
          {src ? (
            <img
              src={src}
              alt={image?.alt || headline}
              className="h-full w-full object-cover"
              style={{ objectPosition }}
            />
          ) : null}
        </div>
        <div className="absolute left-[20px] right-[20px] top-[164px] flex h-[190px] items-center justify-center overflow-hidden rounded-[4px] bg-[#373632] px-[20px] text-center">
          <img
            src={HERO_MAP_TEXTURE}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-50 mix-blend-multiply"
          />
          <h1
            className="relative bg-font-roboto-flex text-[30px] leading-[36px] text-white"
            style={{
              fontVariationSettings:
                "'GRAD' 0, 'XOPQ' 96, 'XTRA' 468, 'YOPQ' 79, 'YTAS' 750, 'YTDE' -203, 'YTFI' 738, 'YTLC' 514, 'YTUC' 712, 'wdth' 100",
              fontWeight: 838,
            }}
          >
            {headline}
          </h1>
        </div>
      </div>

      <div className="relative mx-auto hidden h-[515px] w-full max-w-[1440px] lg:block">
        {/* Hero image — visible content 922 x 447, left 259 / top 20 (Figma y=149) */}
        <div className="absolute left-[259px] top-[20px] h-[447px] w-[922px] overflow-hidden rounded-[4px] bg-[#d9d9d9]">
          {src ? (
            <img
              src={src}
              alt={image?.alt || headline}
              className="h-full w-full object-cover"
              style={{ objectPosition }}
            />
          ) : null}
        </div>

        {/* Dark rectangle 25 with centered headline overlay — Figma y=465 → 336 */}
        <div className="absolute left-[356px] top-[336px] flex h-[157px] w-[727px] items-center justify-center overflow-hidden rounded-[4px] bg-[#373632]">
          <img
            src={HERO_MAP_TEXTURE}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-50 mix-blend-multiply"
          />
          <h1
            className="relative w-[686px] bg-font-roboto-flex text-center text-[36px] leading-[44px] text-white"
            style={{
              fontVariationSettings:
                "'GRAD' 0, 'XOPQ' 96, 'XTRA' 468, 'YOPQ' 79, 'YTAS' 750, 'YTDE' -203, 'YTFI' 738, 'YTLC' 514, 'YTUC' 712, 'wdth' 100",
              fontWeight: 838,
            }}
          >
            {headline}
          </h1>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Next article CTA                                                   */
/* ------------------------------------------------------------------ */

function NextArticleCTA({ next }: { next?: NextRef }) {
  if (!next?.slug) return null;
  return (
    <Link
      href={relatedSlug(next)}
      className="group mt-[25px] inline-flex items-center gap-[5px] bg-font-helvetica text-[14px] text-[#1e1e1e]"
    >
      <span>Next article</span>
      <img
        src={ARROW_FORWARD_DARK}
        alt=""
        aria-hidden="true"
        className="h-[24px] w-[24px] [filter:brightness(0)] transition-transform group-hover:translate-x-1"
      />
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Breadcrumb                                                         */
/* ------------------------------------------------------------------ */

function ProfileBreadcrumb({ section }: { section?: string }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-[4px] bg-font-roboto text-[14px] leading-[18px] font-normal"
    >
      <Link href="/" className="text-[#312e28] underline">
        Home
      </Link>
      <span aria-hidden="true" className="text-[#312e28]">
        /
      </span>
      <Link
        href={sectionHref(section)}
        className="text-[color:rgba(55,54,50,0.65)] hover:underline"
      >
        {sectionLabel(section)}
      </Link>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/*  Type alias for clarity                                             */
/* ------------------------------------------------------------------ */

type SanityImageLike = {
  asset?: { _ref?: string; url?: string };
  assetUrl?: string;
  alt?: string;
  caption?: string;
  hotspot?: { x: number; y: number };
};

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default async function FigmaProfileArticlePage({ article }: { article: FigmaArticleDoc }) {
  const headline = article.headline || "Untitled";
  const section = article.section;
  const [ads, eventBanner] = await Promise.all([
    getAdsForSurface(adSurfaceForArticleSection(section)),
    getHomepageEventBannerProps(),
  ]);
  const heroImg =
    article.heroImage || article.introImage || article.headerImage || undefined;
  const slugValue =
    typeof article.slug === "string" ? article.slug : article.slug?.current || "";
  const adContextKey = slugValue || headline;
  const shareUrl = articleUrl(slugValue);

  return (
    <>
      <HomepageTopRibbon />

      <main className="bg-white text-[color:var(--bg-on-surface)]">
        <ProfileHero headline={headline} image={heroImg} />

        <div className="mx-auto w-full max-w-[1440px] px-[20px] lg:px-0">
          {/* Breadcrumb — horizontally centered directly under the rectangle
              (rectangle: left-[356px] w-[727px]). */}
          <div className="pt-[24px] lg:pt-0">
            <div className="flex w-full justify-start lg:ml-[356px] lg:w-[727px] lg:justify-center">
              <ProfileBreadcrumb section={section} />
            </div>
          </div>

          {/* Two-column body — sidebar (col 2) + main content (col 4). */}
          <div
            className="flex flex-col gap-[32px] pb-[56px] pt-[24px] lg:grid lg:gap-x-[28px] lg:pb-[80px] lg:pt-[20px]"
            style={{ gridTemplateColumns: "143px 206px 28px 686px 1fr" }}
          >
            <div className="order-2 lg:order-none lg:col-start-2 lg:col-end-3">
              <Sidebar
                publishedAt={article.publishedAt}
                readingTime={article.readingTime}
                author={article.author}
                coAuthors={article.coAuthors}
                authorBio={article.authorBio}
                relatedArticles={article.relatedArticles}
                shareUrl={shareUrl}
                headline={headline}
              />
            </div>

            <article className="flex w-full flex-col gap-[32px] lg:col-start-4 lg:col-end-5 lg:w-auto lg:gap-[43px]">
              {article.dek ? (
                <p className="bg-font-roboto-condensed text-[18px] leading-[24px] font-medium text-[#312e28] lg:text-[20px] lg:leading-[26px]">
                  {article.dek}
                </p>
              ) : null}

              {Array.isArray(article.body) ? (() => {
                // < 5 blocks → 1 ad at the end only.
                // ≥ 5 blocks → 3 ads: after block 3, at midpoint, at the end.
                const chunks = threeAdChunks(article.body);
                return (
                  <>
                    {chunks.map((chunk, i) => (
                      <div key={i} className="bg-article-body">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        <PortableText value={chunk as any} components={articleComponents as any} />
                        <ProfileAdUnit ad={selectAdForPlacement(ads, profileAdPlacementForSlot(i), i, adContextKey)} />
                      </div>
                    ))}
                  </>
                );
              })() : null}

              <NextArticleCTA next={article.nextArticle} />
            </article>
          </div>

          {/* Event banner */}
          <div className="px-0 pb-[56px] lg:px-[24px] lg:pb-[80px]">
            <HomepageEventBanner {...eventBanner} />
          </div>
        </div>
      </main>
    </>
  );
}
