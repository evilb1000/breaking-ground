import Link from "next/link";
import fs from "node:fs/promises";
import path from "node:path";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { client } from "@/sanity/client";
import HomepageTabbedPanel, {
  type TabItem,
} from "@/components/homepage/HomepageTabbedPanel";
import HomepageTopRibbon from "@/components/homepage/HomepageTopRibbon";
import { articleHref } from "@/lib/urls";
import { getAdsForSurface, selectAd, type AdCreative } from "@/lib/ads";

// Figma-sourced assets. Downloaded from the Figma MCP asset CDN (which expires
// after 7 days) and committed locally at public/figma-assets/ for permanence.
const imgIcon2 = "/figma-assets/clock-dark.svg";
const imgReply = "/figma-assets/reply-dark.svg";
const imgRectangle15 = "/figma-assets/event-banner-bg.png";
const imgScreenshot20260402At34113Pm1 = "/figma-assets/sponsor-1.png";
const imgScreenshot20260402At34116Pm1 = "/figma-assets/sponsor-2.png";
const imgScreenshot20260402At34125Pm1 = "/figma-assets/sponsor-3.png";
const imgScreenshot20260402At34147Pm1 = "/figma-assets/sponsor-4.png";
const imgScreenshot20260402At34120Pm1 = "/figma-assets/sponsor-5.png";
const imgScreenshot20260402At34131Pm1 = "/figma-assets/sponsor-6.png";
const imgScreenshot20260319At103148Am2 = "/figma-assets/hero-placeholder.png";
const imgEventRegistration = "/figma-assets/event-registration-icon.svg";
const imgCoffee = "/figma-assets/coffee-icon.svg";
const imgHeroMapTexture = "/figma-assets/hero-map-texture.png";
const imgHeroBadgeDefaultIcon = "/figma-assets/hero-badge-default-icon.svg";
const imgClockWhite = "/figma-assets/clock-white.svg";
const imgReplyWhite = "/figma-assets/reply-white.svg";
const imgArrowForwardWhite = "/figma-assets/arrow-forward-white.svg";

// Projection used for every dereferenced homepage entry.
// Normalizes figmaArticle field names into the shape expected by the
// homepage render code:
//   title    <- headline OR title
//   category <- category OR articleTag OR section
const ENTRY_PROJECTION = `
  _id,
  _type,
  "title": coalesce(title, headline),
  homepageHeadline,
  dek,
  slug,
  publishedAt,
  readingTime,
  "category": coalesce(category, articleTag, section),
  section,
  headerImage{asset->{_ref,url},alt},
  heroImage{asset->{_ref,url},alt},
  homepageImage{asset->{_ref,url},alt},
  introImage{asset->{_ref,url},alt}
`;

const HOMEPAGE_QUERY = `*[_type == "updatedHomepage"] | order(_updatedAt desc)[0]{
  heroArticle->{${ENTRY_PROJECTION}},
  heroBadgeLabel,
  heroBadgeIcon{asset->{_ref,url},alt},
  secondaryFeature->{${ENTRY_PROJECTION}},
  tertiaryFeature->{${ENTRY_PROJECTION}},
  issueHighlight->{${ENTRY_PROJECTION}},
  gridTwo[]->{${ENTRY_PROJECTION}},
  gridThree[]->{${ENTRY_PROJECTION}},
  announcementMessage,
  announcementLinkLabel,
  announcementLinkUrl
}`;

type HomepageEntry = {
  _id: string;
  _type: string;
  title?: string;
  homepageHeadline?: string;
  dek?: string;
  slug?: { current?: string };
  publishedAt?: string;
  readingTime?: number;
  category?: string;
  section?: string;
  headerImage?: SanityImageLike;
  heroImage?: SanityImageLike;
  homepageImage?: SanityImageLike;
  introImage?: SanityImageLike;
};

type HomepageDoc = {
  heroArticle?: HomepageEntry | null;
  heroBadgeLabel?: string;
  heroBadgeIcon?: SanityImageLike;
  secondaryFeature?: HomepageEntry | null;
  tertiaryFeature?: HomepageEntry | null;
  issueHighlight?: HomepageEntry | null;
  gridTwo?: HomepageEntry[];
  gridThree?: HomepageEntry[];
  announcementMessage?: string;
  announcementLinkLabel?: string;
  announcementLinkUrl?: string;
} | null;

type NewsFeedItem = {
  link?: string;
  title?: string;
  headline?: string;
  pubDate?: string;
  publicationAddedAt?: string;
};

type NewsFeedManifest = {
  summaries?: NewsFeedItem[];
};

export const revalidate = 0;
const options = { next: { revalidate: 0 } };

// Feeds the homepage Profiles/Perspectives tabbed panel. Profiles pulls both
// project and member profile sections so members surface alongside project
// write-ups as a single "Profiles" tab.
const TAB_PROJECTION = `{
  _id,
  _type,
  "title": coalesce(headline, title),
  "slug": slug,
  publishedAt,
  readingTime,
  section,
  homepageImage,
  headerImage,
  heroImage,
  introImage
}`;

const PROFILES_TAB_QUERY = `*[_type == "figmaArticle" && section in ["project-profiles", "member-profiles"]] | order(coalesce(publishedAt, _createdAt) desc)[0...6]${TAB_PROJECTION}`;

const PERSPECTIVES_TAB_QUERY = `*[_type == "figmaArticle" && section == "perspectives"] | order(coalesce(publishedAt, _createdAt) desc)[0...10]${TAB_PROJECTION}`;

const PERSPECTIVES_ROTATION_SIZE = 3;
const PERSPECTIVES_ROTATION_INTERVAL_MS = 24 * 60 * 60 * 1000;

type SanityImageLike = {
  asset?: {
    _ref?: string;
    url?: string;
  };
  alt?: string;
};

const urlFor = (source: SanityImageSource) => {
  const { projectId, dataset } = client.config();
  return projectId && dataset ? imageUrlBuilder({ projectId, dataset }).image(source) : null;
};

const hasAsset = (img?: SanityImageLike | null) => Boolean(img?.asset?._ref || img?.asset?.url);
const pickImage = (entry?: HomepageEntry | null) =>
  hasAsset(entry?.homepageImage)
    ? entry?.homepageImage
    : hasAsset(entry?.headerImage)
    ? entry?.headerImage
    : hasAsset(entry?.heroImage)
    ? entry?.heroImage
    : hasAsset(entry?.introImage)
    ? entry?.introImage
    : null;

const entryImageUrl = (entry?: HomepageEntry | null, width = 1200, height = 800) => {
  const image = pickImage(entry);
  if (!image) return null;
  if (image?.asset?._ref) return urlFor(image as SanityImageSource)?.width(width).height(height).fit("crop").url() ?? null;
  return image?.asset?.url ?? null;
};

const sanityImageUrl = (image?: SanityImageLike | null, width?: number, height?: number) => {
  if (!hasAsset(image)) return null;
  if (image?.asset?._ref) {
    let b = urlFor(image as SanityImageSource);
    if (!b) return null;
    if (width) b = b.width(width);
    if (height) b = b.height(height);
    return b.fit("max").url() ?? null;
  }
  return image?.asset?.url ?? null;
};

const entryHref = (entry?: HomepageEntry | null) => articleHref(entry?.slug?.current);

const displayDate = (date?: string) => {
  if (!date) return "APRIL 15, 2026";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "APRIL 15, 2026";
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).toUpperCase();
};

// Maps a figmaArticle section slug to display nouns and an index URL.
// Used by the homepage hero to render section-aware CTAs like
// "Read full <singular>" / "View all <plural>".
const sectionLabels = (section?: string): { singular: string; plural: string; indexHref: string } => {
  switch (section) {
    case "features":
      return { singular: "feature", plural: "features", indexHref: "/sections/features" };
    case "project-profiles":
      return { singular: "profile", plural: "profiles", indexHref: "/sections/project-profiles" };
    case "member-profiles":
      return { singular: "profile", plural: "profiles", indexHref: "/sections/member-profiles" };
    case "news":
      return { singular: "story", plural: "news", indexHref: "/news" };
    case "perspectives":
      return { singular: "perspective", plural: "perspectives", indexHref: "/sections/perspectives" };
    case "opinion":
      return { singular: "opinion", plural: "opinions", indexHref: "/sections/opinion" };
    default:
      return { singular: "article", plural: "articles", indexHref: "/sections/features" };
  }
};

function newsItemDateValue(item: NewsFeedItem): number {
  const raw = item.pubDate || item.publicationAddedAt;
  if (!raw) return 0;
  const ts = new Date(raw).getTime();
  return Number.isNaN(ts) ? 0 : ts;
}

function selectRotatingRecentItems<T>(
  items: T[],
  count: number,
  intervalMs: number,
  now = Date.now()
): T[] {
  if (items.length <= count) return items;

  const windowIndex = Math.floor(now / intervalMs);
  const start = (windowIndex * count) % items.length;

  return Array.from({ length: count }, (_, i) => items[(start + i) % items.length]);
}

async function loadLatestNewsItems(): Promise<NewsFeedItem[]> {
  try {
    const ingestDir = path.join(process.cwd(), "..", "data", "news-feed-ingest");
    const entries = await fs.readdir(ingestDir, { withFileTypes: true });
    const jsonNames = entries
      .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".json"))
      .map((entry) => entry.name);

    if (!jsonNames.length) return [];

    const latestJsonName = (
      await Promise.all(
        jsonNames.map(async (name) => {
          const fullPath = path.join(ingestDir, name);
          const stats = await fs.stat(fullPath);
          return { name, mtimeMs: stats.mtimeMs };
        }),
      )
    )
      .sort((a, b) => b.mtimeMs - a.mtimeMs)[0]
      .name;

    const manifestPath = path.join(ingestDir, latestJsonName);
    const raw = await fs.readFile(manifestPath, "utf8");
    const manifest = JSON.parse(raw) as NewsFeedManifest;

    return [...(manifest.summaries || [])]
      .filter((item) => item.link && (item.headline || item.title))
      .sort((a, b) => newsItemDateValue(b) - newsItemDateValue(a));
  } catch {
    return [];
  }
}

function LatestNews({ news }: { news: NewsFeedItem[] }) {
  // Figma frame 211:2251 — 4 plain-text tiles stacked vertically, subtle beige panel.
  // Title on top (Roboto Condensed 20/26, up to 2 lines), meta below. No per-item borders.
  const cards = news.length > 0 ? news.slice(0, 4) : [];
  const fallback: NewsFeedItem[] = [{}, {}, {}, {}];
  const items = cards.length ? cards : fallback;
  return (
    <div className="absolute left-[965px] top-[652px] h-[634px] w-[451px] border-l border-[#ebebeb] px-[24px] pt-[23px]">
      <div className="flex items-center gap-[8px]">
        <div className="relative h-[20px] w-[20px] overflow-hidden">
          <div className="absolute inset-[4.17%_4.17%_12.5%_8.33%]">
            <div className="absolute inset-[-6%_-5.71%]">
              <img src={imgCoffee} alt="" className="block h-full w-full" />
            </div>
          </div>
        </div>
        <h2 className="bg-type-h2 text-[#312e28]">News Feed</h2>
      </div>
      <div className="mt-[28px] flex flex-col gap-[28px]">
        {items.map((entry, i) => (
          <a
            key={`${entry.link || "latest"}-${i}`}
            href={entry.link || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="group block"
          >
            <h3 className="bg-font-roboto-condensed text-[20px] leading-[26px] font-medium text-[#312e28] group-hover:underline line-clamp-2">
              {entry?.headline || entry?.title || "Iran Conflict Fuels Economic Concerns: Key Indicators to Watch This Week"}
            </h3>
            <div className="mt-[5px] flex items-center gap-[12px]">
              <p className="bg-font-roboto text-[10px] leading-[24px] font-normal text-[#312e28]">
                {displayDate(entry?.pubDate || entry?.publicationAddedAt)}
              </p>
              <div className="flex items-center gap-[4px]">
                <img src={imgIcon2} alt="" className="h-[12px] w-[12px]" />
                <p className="bg-font-roboto text-[10px] leading-[24px] font-normal text-[#312e28]">3 MIN READ</p>
              </div>
              <img src={imgReply} alt="" className="h-[14px] w-[14px]" />
            </div>
          </a>
        ))}
      </div>
      <Link href="/news" className="mt-[28px] inline-flex rounded-[4px] bg-[#113251] px-[12px] py-[12px] bg-font-roboto text-[12px] font-bold text-white">
        View all news
      </Link>
    </div>
  );
}

function HeroFeature({
  entry,
  badgeLabel,
  badgeIcon,
}: {
  entry?: HomepageEntry | null;
  badgeLabel?: string;
  badgeIcon?: SanityImageLike;
}) {
  // Figma node 253:3207 — "Desktop Hero" (updated from 211:1218)
  // 1390×475 at (25, 153). Image left (568×475) + dark textured panel right (822×475).
  // Content overlay is right-aligned on the dark side: headline (white, 56/48 Roboto Flex),
  // meta row, "Read full profile" CTA (white bg, dark-blue text), and "View all profiles →" link.
  const heroImage = entryImageUrl(entry, 1800, 950) || imgScreenshot20260319At103148Am2;
  // Prefer the article's optional homepage-only headline; fall back to the
  // standard article headline (which the GROQ projection already coalesces
  // into `title`) so older articles render exactly as they do today.
  const heroTitle =
    entry?.homepageHeadline?.trim() ||
    entry?.title ||
    "Profile article hero headline text styling area placeholder";
  const badgeText = badgeLabel?.trim();
  const badgeIconUrl = sanityImageUrl(badgeIcon, 28, 28);
  const { singular, plural, indexHref } = sectionLabels(entry?.section);
  return (
    <div className="absolute left-[25px] top-[153px] h-[475px] w-[1390px]">
      <div className="absolute inset-0 flex overflow-hidden rounded-[4px]">
        <img src={heroImage} alt={heroTitle} className="h-[475px] w-[568px] shrink-0 object-cover" />
        <div className="relative h-[475px] w-[822px] shrink-0 bg-[#373632]">
          <img
            src={imgHeroMapTexture}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-50 mix-blend-multiply"
          />
        </div>
      </div>

      {badgeText ? (
        <div className="absolute left-[482px] top-0 z-10 flex h-[32px] items-center gap-[4px] bg-[#ff611d] p-[8px]">
          <img
            src={badgeIconUrl || imgHeroBadgeDefaultIcon}
            alt={badgeIcon?.alt || ""}
            className="h-[14px] w-[14px]"
          />
          <p className="bg-font-roboto text-[12px] font-bold leading-[10px] tracking-[0.24px] text-white">
            {badgeText.toUpperCase()}
          </p>
        </div>
      ) : null}

      <div className="absolute right-[23px] bottom-[28px] flex w-[848px] flex-col items-start gap-[55px]">
        <div className="flex w-full flex-col items-start gap-[16px]">
          <div
            className="flex h-[169px] w-full flex-col items-start justify-center pr-[24px] py-[12px]"
            style={{ filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.25))" }}
          >
            <h1
              className="w-[810px] bg-font-roboto-flex text-[56px] font-extralight leading-[48px] text-white"
              style={{
                fontVariationSettings:
                  "'GRAD' 0, 'XOPQ' 96, 'XTRA' 468, 'YOPQ' 79, 'YTAS' 750, 'YTDE' -203, 'YTFI' 738, 'YTLC' 514, 'YTUC' 712, 'wdth' 100",
                fontWeight: 838,
              }}
            >
              {heroTitle}
            </h1>
          </div>

          <div className="flex w-[523px] flex-col items-start gap-[20px] px-[82px]">
            <div className="flex w-[177px] items-start justify-between">
              <p className="bg-font-roboto text-[10px] font-normal leading-[24px] text-white">
                {(displayDate(entry?.publishedAt) || "").toUpperCase()}
              </p>
              <div className="flex items-center gap-[4px]">
                <img src={imgClockWhite} alt="" className="h-[12px] w-[12px]" />
                <p className="bg-font-roboto text-[10px] font-normal leading-[24px] text-white">
                  {entry?.readingTime ? `${entry.readingTime} MIN READ` : "3 MIN READ"}
                </p>
              </div>
              <img src={imgReplyWhite} alt="" className="h-[14px] w-[14px]" />
            </div>
            <div className="flex w-full flex-col items-start gap-[20px]">
              <Link
                href={entryHref(entry)}
                className="flex min-w-[156px] items-center justify-center rounded-[4px] bg-white p-[12px] bg-font-roboto text-[12px] font-bold text-[#113251] whitespace-nowrap"
              >
                Read full {singular}
              </Link>
            </div>
          </div>
        </div>

        <div className="flex w-full items-center justify-end">
          <Link
            href={indexHref}
            className="flex items-center gap-[5px] text-[14px] text-white underline"
            style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
          >
            <span>View all {plural}</span>
            <img src={imgArrowForwardWhite} alt="" className="h-[24px] w-[24px]" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function EventBanner({
  entry,
  ctaHref,
  ctaLabel,
  body,
}: {
  entry?: HomepageEntry | null;
  ctaHref?: string;
  ctaLabel?: string;
  body?: string;
}) {
  const title = entry?.title;
  const subtitle = entry?.publishedAt
    ? `Event date ${new Date(entry.publishedAt).toLocaleDateString("en-US").replaceAll("/", ".")}`
    : null;
  const resolvedCtaHref = ctaHref?.trim();
  const resolvedCtaLabel = ctaLabel?.trim();

  if (!title && !subtitle && !body && !resolvedCtaLabel && !resolvedCtaHref) return null;

  return (
    <div className="absolute left-0 top-[1286px] h-[336px] w-[1440px] overflow-hidden">
      <img src={entryImageUrl(entry, 1800, 600) || imgRectangle15} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-[#113251]/70" />
      <div className="absolute left-0 top-0 h-[336px] w-[1440px] text-center text-white">
        <div className="mt-[80px]">
          {resolvedCtaLabel ? (
            <div className="mx-auto inline-flex h-[32px] items-center gap-[4px] bg-[#ff611d] p-[8px]">
              <img src={imgEventRegistration} alt="" className="h-[14px] w-[14px]" />
              <p className="bg-font-roboto text-[12px] font-bold tracking-[0.24px]">
                {resolvedCtaLabel.toUpperCase()}
              </p>
            </div>
          ) : null}
          {title ? <h2 className="bg-type-h1 mt-[16px] text-white">{title}</h2> : null}
          {subtitle ? <h3 className="bg-type-h2 mt-[12px] text-white">{subtitle}</h3> : null}
          {body ? (
            <p className="mt-[14px] bg-font-crimson text-[34px] leading-[40px] text-white">
              {body}
            </p>
          ) : null}
          {resolvedCtaHref ? (
            <Link
              href={resolvedCtaHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-[18px] inline-flex items-center bg-font-helvetica text-[14px] underline"
            >
              <span>Register Here</span>
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function SponsorsAndAd({ ad }: { ad?: AdCreative | null }) {
  const logos = [
    imgScreenshot20260402At34113Pm1,
    imgScreenshot20260402At34116Pm1,
    imgScreenshot20260402At34125Pm1,
    imgScreenshot20260402At34147Pm1,
    imgScreenshot20260402At34120Pm1,
    imgScreenshot20260402At34131Pm1,
  ];
  return (
    <>
      <Link href="/sponsors" className="group absolute left-[26px] top-[1669px] block h-[361px] w-[684px]">
        <div className="mt-[68px] flex h-[89px] w-[684px] items-center justify-center gap-[10px] opacity-80">
          {logos.map((src, i) => (
            <img key={i} src={src} alt="" className="h-[75px] w-[82px] object-contain" />
          ))}
        </div>
        <div className="mx-auto mt-[34px] w-[348px] text-center">
          <h2 className="bg-type-h1 text-[#312e28] transition-all duration-200 group-hover:text-shadow-[0_0_10px_rgba(17,50,81,0.18)] group-hover:underline group-hover:decoration-[#113251] group-hover:underline-offset-[8px]">
            Our sponsors
          </h2>
          <p className="bg-type-body mt-[12px] text-[#312e28]">
            Breaking Ground reaches the firms shaping Western Pennsylvania construction — from owners and developers to contractors and specialty trades. To position your company within that network, learn more about becoming a sponsor.
          </p>
        </div>
      </Link>
      <div className="absolute left-[730px] top-[1677px] flex h-[361px] w-[686px] items-center justify-center bg-[#d9d9d9]">
        {ad?.imageUrl && ad.clickUrl ? (
          <a href={ad.clickUrl} target="_blank" rel="noopener noreferrer" className="block h-full w-full">
            <img src={ad.imageUrl} alt={ad.altText || ad.title || ""} className="h-full w-full object-cover" />
          </a>
        ) : (
          <h2 className="bg-type-h1 text-[#adadad]">Ad space</h2>
        )}
      </div>
    </>
  );
}

function MobileHeroFeature({
  entry,
  badgeLabel,
  badgeIcon,
}: {
  entry?: HomepageEntry | null;
  badgeLabel?: string;
  badgeIcon?: SanityImageLike;
}) {
  const heroImage = entryImageUrl(entry, 900, 650) || imgScreenshot20260319At103148Am2;
  const heroTitle =
    entry?.homepageHeadline?.trim() ||
    entry?.title ||
    "Profile article hero headline text styling area placeholder";
  const badgeText = badgeLabel?.trim();
  const badgeIconUrl = sanityImageUrl(badgeIcon, 28, 28);
  const { singular } = sectionLabels(entry?.section);

  return (
    <section className="bg-[#373632] text-white">
      <div className="relative h-[260px] overflow-hidden">
        <img src={heroImage} alt={heroTitle} className="h-full w-full object-cover" />
        {badgeText ? (
          <div className="absolute bottom-0 left-[20px] flex h-[32px] items-center gap-[4px] bg-[#ff611d] px-[8px]">
            <img
              src={badgeIconUrl || imgHeroBadgeDefaultIcon}
              alt={badgeIcon?.alt || ""}
              className="h-[14px] w-[14px]"
            />
            <p className="bg-font-roboto text-[12px] font-bold leading-[10px] tracking-[0.24px]">
              {badgeText.toUpperCase()}
            </p>
          </div>
        ) : null}
      </div>
      <div className="relative overflow-hidden px-[20px] py-[28px]">
        <img
          src={imgHeroMapTexture}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-45 mix-blend-multiply"
        />
        <div className="relative">
          <h1
            className="bg-font-roboto-flex text-[38px] leading-[40px]"
            style={{
              fontVariationSettings:
                "'GRAD' 0, 'XOPQ' 96, 'XTRA' 468, 'YOPQ' 79, 'YTAS' 750, 'YTDE' -203, 'YTFI' 738, 'YTLC' 514, 'YTUC' 712, 'wdth' 100",
              fontWeight: 838,
            }}
          >
            {heroTitle}
          </h1>
          <div className="mt-[16px] flex flex-wrap items-center gap-x-[12px] gap-y-[4px]">
            <p className="bg-font-roboto text-[10px] leading-[20px]">
              {displayDate(entry?.publishedAt)}
            </p>
            <div className="flex items-center gap-[4px]">
              <img src={imgClockWhite} alt="" className="h-[12px] w-[12px]" />
              <p className="bg-font-roboto text-[10px] leading-[20px]">
                {entry?.readingTime ? `${entry.readingTime} MIN READ` : "3 MIN READ"}
              </p>
            </div>
          </div>
          <Link
            href={entryHref(entry)}
            className="mt-[22px] flex w-full items-center justify-center rounded-[4px] bg-white p-[12px] bg-font-roboto text-[12px] font-bold text-[#113251]"
          >
            Read full {singular}
          </Link>
        </div>
      </div>
    </section>
  );
}

function MobileLatestNews({ news }: { news: NewsFeedItem[] }) {
  const cards = news.length > 0 ? news.slice(0, 4) : [];
  const fallback: NewsFeedItem[] = [{}, {}, {}, {}];
  const items = cards.length ? cards : fallback;

  return (
    <section className="border-b border-[#ebebeb] px-[20px] py-[34px]">
      <div className="mb-[22px] flex items-center gap-[8px]">
        <img src={imgCoffee} alt="" className="h-[20px] w-[20px]" />
        <h2 className="bg-font-helvetica text-[24px] font-bold leading-[26px] text-[#312e28]">
          Latest news
        </h2>
      </div>
      <div className="flex flex-col gap-[18px]">
        {items.map((entry, i) => (
          <a
            key={`${entry.link || "mobile-latest"}-${i}`}
            href={entry.link || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <h3 className="bg-font-roboto-condensed text-[17px] font-medium leading-[22px] text-[#312e28]">
              {entry?.headline || entry?.title || "Iran Conflict Fuels Economic Concerns: Key Indicators to Watch This Week"}
            </h3>
            <div className="mt-[4px] flex items-center gap-[12px]">
              <p className="bg-font-roboto text-[10px] leading-[20px] text-[#312e28]">
                {displayDate(entry?.pubDate || entry?.publicationAddedAt)}
              </p>
              <div className="flex items-center gap-[4px]">
                <img src={imgIcon2} alt="" className="h-[12px] w-[12px]" />
                <p className="bg-font-roboto text-[10px] leading-[20px] text-[#312e28]">3 MIN READ</p>
              </div>
            </div>
          </a>
        ))}
      </div>
      <Link
        href="/news"
        className="mt-[24px] flex w-full items-center justify-center rounded-[4px] bg-[#113251] p-[12px] bg-font-roboto text-[12px] font-bold text-white"
      >
        View all news
      </Link>
    </section>
  );
}

function MobileArticleSection({
  title,
  items,
  href,
  cta,
}: {
  title: string;
  items: TabItem[];
  href: string;
  cta: string;
}) {
  return (
    <section className="border-b border-[#ebebeb] px-[20px] py-[34px]">
      <h2
        className="bg-font-roboto-flex text-[26px] leading-[31px] text-[#312e28]"
        style={{
          fontVariationSettings:
            "'GRAD' 0, 'XOPQ' 96, 'XTRA' 468, 'YOPQ' 79, 'YTAS' 750, 'YTDE' -203, 'YTFI' 738, 'YTLC' 514, 'YTUC' 712, 'wdth' 100",
          fontWeight: 838,
        }}
      >
        {title}
      </h2>
      <div className="mt-[18px] flex gap-[16px] overflow-x-auto pb-[4px]">
        {items.slice(0, 3).map((entry) => (
          <Link key={entry.id} href={entry.href} className="block w-[270px] shrink-0">
            <img
              src={entry.imageUrl || imgScreenshot20260319At103148Am2}
              alt=""
              className="h-[170px] w-[270px] rounded-[4px] object-cover"
            />
            <p className="mt-[10px] bg-font-roboto-condensed text-[17px] font-medium leading-[22px] text-[#312e28]">
              {entry.title}
            </p>
          </Link>
        ))}
      </div>
      <Link
        href={href}
        className="mt-[22px] flex w-full items-center justify-center rounded-[4px] bg-[#113251] p-[12px] bg-font-roboto text-[12px] font-bold text-white"
      >
        {cta}
      </Link>
    </section>
  );
}

function MobileEventBanner({
  entry,
  ctaHref,
  ctaLabel,
  body,
}: {
  entry?: HomepageEntry | null;
  ctaHref?: string;
  ctaLabel?: string;
  body?: string;
}) {
  const title = entry?.title;
  const subtitle = entry?.publishedAt
    ? `Event date ${new Date(entry.publishedAt).toLocaleDateString("en-US").replaceAll("/", ".")}`
    : null;
  const resolvedCtaHref = ctaHref?.trim();
  const resolvedCtaLabel = ctaLabel?.trim();

  if (!title && !subtitle && !body && !resolvedCtaLabel && !resolvedCtaHref) return null;

  return (
    <section className="relative overflow-hidden px-[20px] py-[42px] text-center text-white">
      <img src={entryImageUrl(entry, 900, 500) || imgRectangle15} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-[#113251]/75" />
      <div className="relative">
        {resolvedCtaLabel ? (
          <div className="mx-auto inline-flex h-[32px] items-center gap-[4px] bg-[#ff611d] px-[8px]">
            <img src={imgEventRegistration} alt="" className="h-[14px] w-[14px]" />
            <p className="bg-font-roboto text-[12px] font-bold tracking-[0.24px]">
              {resolvedCtaLabel.toUpperCase()}
            </p>
          </div>
        ) : null}
        {title ? <h2 className="mt-[16px] bg-font-roboto-flex text-[32px] leading-[36px]">{title}</h2> : null}
        {subtitle ? <p className="mt-[10px] bg-font-roboto-condensed text-[18px] leading-[24px]">{subtitle}</p> : null}
        {body ? <p className="mt-[12px] bg-font-crimson text-[20px] leading-[27px]">{body}</p> : null}
        {resolvedCtaHref ? (
          <Link
            href={resolvedCtaHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-[18px] inline-flex bg-font-helvetica text-[14px] underline"
          >
            Register Here
          </Link>
        ) : null}
      </div>
    </section>
  );
}

function MobileSponsorsAndAd({ ad }: { ad?: AdCreative | null }) {
  const logos = [
    imgScreenshot20260402At34113Pm1,
    imgScreenshot20260402At34116Pm1,
    imgScreenshot20260402At34125Pm1,
    imgScreenshot20260402At34147Pm1,
    imgScreenshot20260402At34120Pm1,
    imgScreenshot20260402At34131Pm1,
  ];
  return (
    <section className="px-[20px] py-[36px]">
      <Link href="/sponsors" className="group block">
        <div className="grid grid-cols-3 items-center gap-[10px] opacity-80">
          {logos.map((src, i) => (
            <img key={i} src={src} alt="" className="mx-auto h-[54px] w-[74px] object-contain" />
          ))}
        </div>
        <div className="mt-[26px] text-center">
          <h2 className="bg-font-roboto-flex text-[28px] leading-[32px] text-[#312e28] transition-all duration-200 group-hover:text-shadow-[0_0_10px_rgba(17,50,81,0.18)] group-hover:underline group-hover:decoration-[#113251] group-hover:underline-offset-[6px]">
            Our sponsors
          </h2>
          <p className="mx-auto mt-[10px] max-w-[310px] bg-font-crimson text-[17px] leading-[24px] text-[#312e28]">
            Breaking Ground reaches the firms shaping Western Pennsylvania construction — from owners and developers to contractors and specialty trades. To position your company within that network, learn more about becoming a sponsor.
          </p>
        </div>
      </Link>
      <div className="mt-[28px] flex h-[170px] items-center justify-center bg-[#d9d9d9]">
        {ad?.imageUrl && ad.clickUrl ? (
          <a href={ad.clickUrl} target="_blank" rel="noopener noreferrer" className="block h-full w-full">
            <img src={ad.imageUrl} alt={ad.altText || ad.title || ""} className="h-full w-full object-cover" />
          </a>
        ) : (
          <h2 className="bg-font-roboto-flex text-[28px] leading-[32px] text-[#adadad]">Ad space</h2>
        )}
      </div>
    </section>
  );
}

export default async function IndexPage() {
  const [homepage, profilesRaw, perspectivesRaw, latest, homepageAds] = await Promise.all([
    client.fetch<HomepageDoc>(HOMEPAGE_QUERY, {}, options),
    client.fetch<HomepageEntry[]>(PROFILES_TAB_QUERY, {}, options),
    client.fetch<HomepageEntry[]>(PERSPECTIVES_TAB_QUERY, {}, options),
    loadLatestNewsItems(),
    getAdsForSurface("homepage"),
  ]);
  const homepageAd = selectAd(homepageAds);
  const hero = homepage?.heroArticle ?? null;
  const event = homepage?.tertiaryFeature ?? homepage?.issueHighlight ?? null;

  const toTabItem = (entry: HomepageEntry): TabItem => ({
    id: entry._id || entry.slug?.current || entry.title || "untitled",
    href: entryHref(entry),
    imageUrl: entryImageUrl(entry, 580, 380),
    title: entry.title || "Untitled",
    publishedAt: entry.publishedAt,
    readingTime: entry.readingTime,
  });
  const profiles = (profilesRaw || []).map(toTabItem);
  const perspectives = selectRotatingRecentItems(
    (perspectivesRaw || []).map(toTabItem),
    PERSPECTIVES_ROTATION_SIZE,
    PERSPECTIVES_ROTATION_INTERVAL_MS
  );

  return (
    <main className="figma-homepage min-h-screen bg-white lg:bg-[#e8e8e8]">
      <div className="lg:hidden">
        <HomepageTopRibbon />
        <MobileHeroFeature
          entry={hero}
          badgeLabel={homepage?.heroBadgeLabel}
          badgeIcon={homepage?.heroBadgeIcon}
        />
        <MobileLatestNews news={latest} />
        <MobileArticleSection
          title="Projects & Profiles"
          items={profiles}
          href="/sections/project-profiles"
          cta="View all profiles"
        />
        <MobileArticleSection
          title="Industry Perspectives"
          items={perspectives}
          href="/sections/perspectives"
          cta="View all perspectives"
        />
        <MobileEventBanner
          entry={event}
          ctaHref={homepage?.announcementLinkUrl}
          ctaLabel={homepage?.announcementLinkLabel}
          body={homepage?.announcementMessage}
        />
        <MobileSponsorsAndAd ad={homepageAd} />
      </div>

      <div className="hidden overflow-x-auto lg:block">
      <div className="relative mx-auto h-[2097px] w-[1440px] bg-white">
        <div className="relative left-1/2 z-[100] w-screen -translate-x-1/2">
          <HomepageTopRibbon />
        </div>
        <HeroFeature
          entry={hero}
          badgeLabel={homepage?.heroBadgeLabel}
          badgeIcon={homepage?.heroBadgeIcon}
        />
        <LatestNews news={latest} />
        <HomepageTabbedPanel profiles={profiles} perspectives={perspectives} />
        <EventBanner
          entry={event}
          ctaHref={homepage?.announcementLinkUrl}
          ctaLabel={homepage?.announcementLinkLabel}
          body={homepage?.announcementMessage}
        />
        <SponsorsAndAd ad={homepageAd} />
      </div>
      </div>
    </main>
  );
}
