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
  dek,
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

const PERSPECTIVES_TAB_QUERY = `*[_type == "figmaArticle" && section == "perspectives"] | order(coalesce(publishedAt, _createdAt) desc)[0...6]${TAB_PROJECTION}`;

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
    <div className="absolute left-[965px] top-[526px] h-[634px] w-[451px] border-l border-[#ebebeb] px-[24px] pt-[23px]">
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
    <div className="absolute left-[25px] top-[27px] h-[475px] w-[1390px]">
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

function EventBanner({ entry, ctaHref, body }: { entry?: HomepageEntry | null; ctaHref?: string; body?: string }) {
  const title = entry?.title || "Come Join Us At the 2025 Evening of Excellence";
  const subtitle = `Event starts 8:00 pm on ${entry?.publishedAt ? new Date(entry.publishedAt).toLocaleDateString("en-US").replaceAll("/", ".") : "04.13.2026"}`;
  return (
    <div className="absolute left-0 top-[1160px] h-[336px] w-[1440px] overflow-hidden">
      <img src={entryImageUrl(entry, 1800, 600) || imgRectangle15} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-[#113251]/70" />
      <div className="absolute left-0 top-0 h-[336px] w-[1440px] text-center text-white">
        <div className="mt-[80px]">
          <div className="mx-auto inline-flex h-[32px] items-center gap-[4px] bg-[#ff611d] p-[8px]">
            <img src={imgEventRegistration} alt="" className="h-[14px] w-[14px]" />
            <p className="bg-font-roboto text-[12px] font-bold tracking-[0.24px]">EVENT REGISTRATION</p>
          </div>
          <h2 className="bg-type-h1 mt-[16px] text-white">{title}</h2>
          <h3 className="bg-type-h2 mt-[12px] text-white">{subtitle}</h3>
          <p className="bg-type-h3 mt-[14px] text-white">{body || "Join us for an unforgettable evening of celebration, inspiration, and impact."}</p>
          <Link href={ctaHref || entryHref(entry)} className="mt-[18px] inline-flex items-center bg-font-helvetica text-[14px] underline">
            <span>Register Here</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function SponsorsAndAd() {
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
      <div className="absolute left-[26px] top-[1543px] h-[361px] w-[684px]">
        <div className="mt-[68px] flex h-[89px] w-[684px] items-center justify-center gap-[10px] opacity-80">
          {logos.map((src, i) => (
            <img key={i} src={src} alt="" className="h-[75px] w-[82px] object-contain" />
          ))}
        </div>
        <div className="mx-auto mt-[34px] w-[348px] text-center">
          <h2 className="bg-type-h1 text-[#312e28]">Our sponsors</h2>
          <p className="bg-type-body mt-[12px] text-[#312e28]">
            Text about how to become a sponsor or who to contact to learn more about it, <span className="underline">click here.</span>
          </p>
        </div>
      </div>
      <div className="absolute left-[730px] top-[1551px] flex h-[361px] w-[686px] items-center justify-center bg-[#d9d9d9]">
        <h2 className="bg-type-h1 text-[#adadad]">Ad space</h2>
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
    "Profile article headline text content area";
  const badgeText = badgeLabel?.trim();
  const badgeIconUrl = sanityImageUrl(badgeIcon, 28, 28);
  const { singular } = sectionLabels(entry?.section);

  return (
    <section className="relative h-[578px] overflow-hidden bg-[#373632]">
      <img
        src={imgHeroMapTexture}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-50 mix-blend-multiply"
      />
      <div className="relative h-[271px] w-full overflow-hidden">
        <img
          src={heroImage}
          alt={heroTitle}
          className="h-full w-full object-cover"
        />
        {badgeText ? (
          <div className="absolute bottom-0 left-1/2 flex h-[32px] -translate-x-1/2 items-center justify-center gap-[4px] bg-[#ff611d] p-[8px]">
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
      </div>

      <div className="relative mx-auto mt-[32px] flex w-[350px] max-w-[calc(100%-40px)] flex-col gap-[32px]">
        <div className="flex flex-col gap-[12px]">
          <h1
            className="bg-font-roboto-flex text-[46px] leading-[48px] text-white"
            style={{
              fontVariationSettings:
                "'GRAD' 0, 'XOPQ' 96, 'XTRA' 468, 'YOPQ' 79, 'YTAS' 750, 'YTDE' -203, 'YTFI' 738, 'YTLC' 514, 'YTUC' 712, 'wdth' 100",
              fontWeight: 838,
            }}
          >
            {heroTitle}
          </h1>
          <div className="flex items-center gap-[12px]">
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
        </div>

        <Link
          href={entryHref(entry)}
          className="flex w-full items-center justify-center rounded-[4px] bg-white p-[12px] bg-font-roboto text-[12px] font-bold text-[#113251]"
        >
          Read full {singular}
        </Link>
      </div>
    </section>
  );
}

function MobileLatestNews({ news }: { news: NewsFeedItem[] }) {
  const cards = news.length > 0 ? news.slice(0, 4) : [];
  const fallback: NewsFeedItem[] = [{}, {}, {}, {}];
  const items = cards.length ? cards : fallback;

  return (
    <section className="border-t border-[#ebebeb] px-[24px] pb-[36px] pt-[48px]">
      <div className="flex flex-col gap-[37px]">
        <div className="flex items-center gap-[8px]">
          <img src={imgCoffee} alt="" className="h-[20px] w-[20px]" />
          <h2 className="bg-font-helvetica text-[24px] font-bold leading-[18px] text-[#312e28]">
            Latest news
          </h2>
        </div>

        <div className="flex flex-col gap-[20px]">
          {items.map((entry, i) => (
            <a
              key={`${entry.link || "mobile-latest"}-${i}`}
              href={entry.link || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <h3 className="bg-font-roboto-condensed text-[16px] font-medium leading-[22px] text-[#312e28]">
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
      </div>

      <Link
        href="/news"
        className="mt-[37px] flex w-full items-center justify-center rounded-[4px] bg-[#113251] p-[12px] bg-font-roboto text-[12px] font-bold text-white"
      >
        View all news
      </Link>
    </section>
  );
}

function MobileEventBanner({ entry, ctaHref, body }: { entry?: HomepageEntry | null; ctaHref?: string; body?: string }) {
  const title = entry?.title || "Event Title 03.25.26";
  const subtitle = `Event starts ${entry?.publishedAt ? new Date(entry.publishedAt).toLocaleDateString("en-US").replaceAll("/", ".") : "03.25.26"}`;

  return (
    <section className="relative h-[243px] overflow-hidden">
      <img src={entryImageUrl(entry, 900, 500) || imgRectangle15} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-[#1d486c]/80" />
      <div className="absolute left-[31px] top-0 z-10 flex h-[32px] items-center justify-center gap-[4px] bg-[#ff611d] p-[8px]">
        <img src={imgEventRegistration} alt="" className="h-[14px] w-[14px]" />
        <p className="bg-font-roboto text-[12px] font-bold leading-[10px] tracking-[0.24px] text-white">
          EVENT REGISTRATION
        </p>
      </div>
      <div className="absolute left-[29px] top-[67px] flex w-[272px] flex-col gap-[9px] text-white">
        <div className="flex flex-col gap-[10px]">
          <div className="flex w-[205px] flex-col gap-px">
            <h2
              className="bg-font-roboto-flex text-[22px] leading-[26px]"
              style={{
                fontVariationSettings:
                  "'GRAD' 0, 'XOPQ' 96, 'XTRA' 468, 'YOPQ' 79, 'YTAS' 750, 'YTDE' -203, 'YTFI' 738, 'YTLC' 514, 'YTUC' 712, 'wdth' 100",
                fontWeight: 838,
              }}
            >
              {title}
            </h2>
            <h3 className="bg-font-roboto-condensed text-[16px] font-medium leading-[22px]">
              {subtitle}
            </h3>
          </div>
          <p className="bg-font-roboto text-[12px] leading-[20px]">
            {body || "Join us for an unforgettable evening of celebration, inspiration, and impact."}
          </p>
        </div>
        <Link href={ctaHref || entryHref(entry)} className="flex items-center gap-[5px] bg-font-helvetica text-[14px]">
          <span>Register here</span>
          <img src={imgArrowForwardWhite} alt="" className="h-[24px] w-[24px]" />
        </Link>
      </div>
    </section>
  );
}

function MobileSponsorsAndAd() {
  const logos = [
    imgScreenshot20260402At34113Pm1,
    imgScreenshot20260402At34116Pm1,
    imgScreenshot20260402At34125Pm1,
    imgScreenshot20260402At34147Pm1,
    imgScreenshot20260402At34120Pm1,
    imgScreenshot20260402At34131Pm1,
  ];

  return (
    <section className="overflow-hidden px-[20px] pb-[41px] pt-[59px]">
      <div className="-mx-[20px] overflow-x-auto px-[20px]">
        <div className="flex w-max items-center gap-[10px] opacity-80">
          {logos.map((src, i) => (
            <img key={i} src={src} alt="" className="h-[75px] w-[82px] shrink-0 object-contain" />
          ))}
        </div>
      </div>
      <div className="mt-[16px] flex w-[348px] max-w-full flex-col gap-[12px] text-[#312e28]">
        <h2
          className="bg-font-roboto-flex text-[22px] leading-[26px]"
          style={{
            fontVariationSettings:
              "'GRAD' 0, 'XOPQ' 96, 'XTRA' 468, 'YOPQ' 79, 'YTAS' 750, 'YTDE' -203, 'YTFI' 738, 'YTLC' 514, 'YTUC' 712, 'wdth' 100",
            fontWeight: 838,
          }}
        >
          Our sponsors
        </h2>
        <p className="bg-font-crimson text-[14px] leading-[20px]">
          Text about how to become a sponsor or who to contact to learn more about it, <span className="underline">click here.</span>
        </p>
      </div>

      <div className="mt-[60px] flex h-[314px] w-[346px] max-w-full items-center justify-center bg-[#d9d9d9]">
        <h2 className="bg-type-h1 text-[#adadad]">Ad space</h2>
      </div>
    </section>
  );
}

export default async function IndexPage() {
  const [homepage, profilesRaw, perspectivesRaw, latest] = await Promise.all([
    client.fetch<HomepageDoc>(HOMEPAGE_QUERY, {}, options),
    client.fetch<HomepageEntry[]>(PROFILES_TAB_QUERY, {}, options),
    client.fetch<HomepageEntry[]>(PERSPECTIVES_TAB_QUERY, {}, options),
    loadLatestNewsItems(),
  ]);
  const hero = homepage?.heroArticle ?? null;
  const event = homepage?.tertiaryFeature ?? homepage?.issueHighlight ?? null;

  const toTabItem = (entry: HomepageEntry): TabItem => ({
    id: entry._id || entry.slug?.current || entry.title || "untitled",
    href: entryHref(entry),
    imageUrl: entryImageUrl(entry, 580, 380),
    title: entry.title || "Untitled",
    dek: entry.dek,
    publishedAt: entry.publishedAt,
    readingTime: entry.readingTime,
  });
  const profiles = (profilesRaw || []).map(toTabItem);
  const perspectives = (perspectivesRaw || []).map(toTabItem);

  return (
    <main className="figma-homepage min-h-screen bg-white lg:bg-[#e8e8e8] lg:overflow-x-auto">
      <HomepageTopRibbon />

      <div className="lg:hidden">
        <MobileHeroFeature
          entry={hero}
          badgeLabel={homepage?.heroBadgeLabel}
          badgeIcon={homepage?.heroBadgeIcon}
        />
        <HomepageTabbedPanel profiles={profiles} perspectives={perspectives} />
        <MobileLatestNews news={latest} />
        <MobileEventBanner
          entry={event}
          ctaHref={homepage?.announcementLinkUrl}
          body={homepage?.announcementMessage}
        />
        <MobileSponsorsAndAd />
      </div>

      <div className="relative mx-auto hidden h-[1971px] w-[1440px] bg-white lg:block">
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
          body={homepage?.announcementMessage}
        />
        <SponsorsAndAd />
      </div>
    </main>
  );
}
