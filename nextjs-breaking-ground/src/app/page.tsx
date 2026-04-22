import Link from "next/link";
import fs from "node:fs/promises";
import path from "node:path";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { client } from "@/sanity/client";

const imgRectangle10 = "https://www.figma.com/api/mcp/asset/6c59e688-e35f-4e4f-bbc2-ab33435c85c4";
const imgIcon = "https://www.figma.com/api/mcp/asset/41630572-64c1-457a-904a-0c86bee9151f";
const imgInstagramWhite = "https://www.figma.com/api/mcp/asset/65a7b66a-686d-4b22-91e9-3308c2d30d21";
const imgYoutubeWhite = "https://www.figma.com/api/mcp/asset/7dde89aa-1ea9-4ac7-84f6-fce6c9a025b5";
const imgLinkedInWhite = "https://www.figma.com/api/mcp/asset/33903285-e910-4f19-b151-3f464cad87a0";
const imgFacebookWhite = "https://www.figma.com/api/mcp/asset/cf25c62d-6db9-42f5-9fd3-94b41207389f";
const imgBg2 = "https://www.figma.com/api/mcp/asset/961e793c-d56e-4301-a43b-7c3d4b349e0e";
const imgIcon2 = "https://www.figma.com/api/mcp/asset/50ddeba7-3fb9-4535-a668-e537f61673ae";
const imgReply = "https://www.figma.com/api/mcp/asset/d8cc6c62-d443-48c3-a550-c38f9624107e";
const imgImage3 = "https://www.figma.com/api/mcp/asset/9f80ebc1-2a79-40f3-9974-4b3c4de209ad";
const imgRectangle15 = "https://www.figma.com/api/mcp/asset/4b8a2fbc-1bfb-483a-9cbd-417cf38d2823";
const imgScreenshot20260402At34113Pm1 = "https://www.figma.com/api/mcp/asset/d3db63ed-3893-4df2-9ce6-ae8d2a93560b";
const imgScreenshot20260402At34116Pm1 = "https://www.figma.com/api/mcp/asset/6cbb7f6d-92ef-4360-a3de-4640ba736f7a";
const imgScreenshot20260402At34125Pm1 = "https://www.figma.com/api/mcp/asset/9b296214-2c89-47de-b670-5479c3b66e27";
const imgScreenshot20260402At34147Pm1 = "https://www.figma.com/api/mcp/asset/d1cd9949-fc16-4efc-8ecb-ad3cea0984f1";
const imgScreenshot20260402At34120Pm1 = "https://www.figma.com/api/mcp/asset/ca867f23-f84e-49a9-989e-67f94a8a88c3";
const imgScreenshot20260402At34131Pm1 = "https://www.figma.com/api/mcp/asset/2b98f650-e0b6-4325-9a19-0f1dcfe223cb";
const imgScreenshot20260319At103148Am2 = "https://www.figma.com/api/mcp/asset/ac3eed3d-50fe-44e9-bea9-4339f21bde42";
const imgEventRegistration = "https://www.figma.com/api/mcp/asset/39ced4f3-b3a9-4c67-bbe0-f0c3517c6f3a";
const imgCoffee = "https://www.figma.com/api/mcp/asset/b9f91e7a-8deb-4f88-b389-2fbb17186e26";

// Projection used for every dereferenced homepage entry.
// Coalesces article/projectProfile/figmaArticle field names into
// the shape expected by the homepage render code:
//   title    <- title (article/projectProfile) OR headline (figmaArticle)
//   category <- category (article) OR articleTag (figmaArticle) OR section (figmaArticle)
const ENTRY_PROJECTION = `
  _id,
  _type,
  "title": coalesce(title, headline),
  dek,
  slug,
  publishedAt,
  readingTime,
  "category": coalesce(category, articleTag, section),
  projectType,
  projectName,
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
  dek?: string;
  slug?: { current?: string };
  publishedAt?: string;
  readingTime?: number;
  category?: string;
  projectType?: string;
  projectName?: string;
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

const entryHref = (entry?: HomepageEntry | null) => {
  const slug = entry?.slug?.current;
  return slug ? `/${slug}` : "#";
};

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

function TopRibbon() {
  const nav: { label: string; hasChevron: boolean; href?: string }[] = [
    { label: "Region", hasChevron: true, href: "/sections/local" },
    { label: "Profiles", hasChevron: true, href: "/sections/project-profiles" },
    { label: "Features", hasChevron: false, href: "/sections/features" },
    { label: "Perspectives", hasChevron: false, href: "/sections/perspectives" },
    { label: "Insights", hasChevron: true, href: "/sections/data-insights" },
    { label: "About", hasChevron: true, href: "/about" },
    { label: "News", hasChevron: false, href: "/news" },
  ];
  return (
    <div className="absolute left-0 top-0 flex w-[1440px] items-center justify-between bg-[#f5f3f0] px-[26px] pb-[28px] pt-[36px]">
      <div className="relative h-[65px] w-[266px]">
        <img src={imgBg2} alt="Breaking Ground" className="absolute inset-0 h-full w-full object-cover" />
      </div>
      <div className="flex items-center gap-[24px]">
        <div className="flex items-center gap-[28px]">
          {nav.map((item) => (
            <div key={item.label} className="flex items-center gap-[2px]">
              {item.href ? (
                <Link href={item.href} className="bg-type-nav whitespace-nowrap text-[#312e28] hover:opacity-75 transition-opacity">
                  {item.label}
                </Link>
              ) : (
                <p className="bg-type-nav whitespace-nowrap text-[#312e28]">{item.label}</p>
              )}
              {item.hasChevron ? (
                <span className="inline-flex h-[24px] w-[24px] items-center justify-center translate-y-[1px]" aria-hidden="true">
                  <svg viewBox="0 0 24 24" className="h-[24px] w-[24px] text-[#312e28] opacity-80">
                    <path
                      d="M7 10l5 5 5-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              ) : null}
            </div>
          ))}
        </div>
        <div className="relative h-[36px] w-[36px]">
          <div className="absolute inset-[12.5%]">
            <img src={imgIcon} alt="Search" className="absolute inset-0 h-full w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

function LatestNews({ news }: { news: NewsFeedItem[] }) {
  // Figma frame 211:2251 — 4 plain-text tiles stacked vertically, subtle beige panel.
  // Title on top (Roboto Condensed 20/26, up to 2 lines), meta below. No per-item borders.
  const cards = news.length > 0 ? news.slice(0, 4) : [];
  const fallback: NewsFeedItem[] = [{}, {}, {}, {}];
  const items = cards.length ? cards : fallback;
  return (
    <div className="absolute left-[965px] top-[631px] h-[634px] w-[451px] bg-[#f5f3f0] px-[24px] pt-[23px]">
      <div className="flex items-center gap-[8px]">
        <div className="relative h-[20px] w-[20px] overflow-hidden">
          <div className="absolute inset-[4.17%_4.17%_12.5%_8.33%]">
            <div className="absolute inset-[-6%_-5.71%]">
              <img src={imgCoffee} alt="" className="block h-full w-full" />
            </div>
          </div>
        </div>
        <h2 className="bg-type-h2 text-[#312e28]">Latest news</h2>
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
  const heroImage = entryImageUrl(entry, 1800, 900) || imgScreenshot20260319At103148Am2;
  const heroTitle = entry?.title || "Profile article headline text content area placeholder";
  const heroDek = entry?.dek;
  const tag = entry?.category || entry?.projectType || "ARTICLE TAG";
  const badgeText = badgeLabel?.trim();
  const badgeIconUrl = sanityImageUrl(badgeIcon, 28, 28);
  return (
    <div className="absolute left-[26px] top-[156px] flex h-[428px] w-[1392px] gap-[20px]">
      <img src={heroImage} alt={heroTitle} className="h-[428px] w-[686px] rounded-[4px] object-cover" />
      <div className="flex h-[428px] w-[686px] flex-col justify-center px-[24px] pb-[42px]">
        <p className="bg-type-tag text-[#ff611d]">{tag}</p>
        <h1 className="bg-type-h1 mt-[8px] w-[654px] text-[#312e28]">
          {heroTitle}
        </h1>
        <div className="mt-[10px] flex items-center gap-[12px]">
          <p className="bg-type-meta text-[#312e28]">{displayDate(entry?.publishedAt)}</p>
          <div className="flex items-center gap-[4px]">
            <img src={imgIcon2} alt="" className="h-[12px] w-[12px]" />
            <p className="bg-type-meta text-[#312e28]">{entry?.readingTime ? `${entry.readingTime} MIN READ` : "3 MIN READ"}</p>
          </div>
          <img src={imgReply} alt="" className="h-[14px] w-[14px]" />
        </div>
        {heroDek ? (
          <p className="bg-type-body mt-[20px] w-[654px] text-[#312e28]">
            {heroDek}
          </p>
        ) : null}
        <Link href={entryHref(entry)} className="mt-[20px] inline-flex w-[156px] items-center justify-center rounded-[4px] bg-[#113251] p-[12px] bg-font-roboto text-[12px] font-bold text-white">
          Read article
        </Link>
      </div>
      {badgeText ? (
        <div className="absolute left-[290px] top-0 flex h-[32px] items-center gap-[4px] bg-[#ff611d] p-[8px]">
          {badgeIconUrl ? (
            <img src={badgeIconUrl} alt={badgeIcon?.alt || ""} className="h-[14px] w-[14px]" />
          ) : null}
          <p className="bg-font-roboto text-[12px] font-bold tracking-[0.24px] text-white">
            {badgeText.toUpperCase()}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function TabbedPanel({ entries }: { entries: HomepageEntry[] }) {
  // Figma frame 211:2263 — 3 tall tiles horizontally (287×346 each).
  // Per tile: image on top, then meta row, then title. No per-tile borders.
  const rows = entries.length > 0 ? entries.slice(0, 3) : [];
  const fallback = [
    { _id: "tab-fallback-1" },
    { _id: "tab-fallback-2" },
    { _id: "tab-fallback-3" },
  ] as HomepageEntry[];
  const items = rows.length ? rows : fallback;
  return (
    <div className="absolute left-[27px] top-[631px] h-[591px] w-[916px] pt-[32px]">
      <div className="flex items-center gap-[12px]">
        <button className="rounded-[4px] bg-[#ff611d] px-[12px] py-[8px] bg-font-roboto text-[12px] font-bold text-white">Profiles</button>
        <a
          href="https://www.mbawpa.org/news/breaking-ground-magazine/"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-[4px] bg-[rgba(161,161,161,0.1)] px-[12px] py-[8px] bg-font-roboto text-[12px] font-bold text-[#595959]"
        >
          Issues
        </a>
        <button className="rounded-[4px] bg-[rgba(161,161,161,0.1)] px-[12px] py-[8px] bg-font-roboto text-[12px] font-bold text-[#595959]">Perspectives</button>
      </div>
      <h2 className="mt-[32px] bg-type-h2 text-[#312e28]">Breaking Ground Profiles</h2>
      <div className="mt-[20px] flex gap-[17px]">
        {items.map((entry, r) => (
          <Link key={entry._id || r} href={entryHref(entry)} className="group block w-[287px]">
            <img
              src={entryImageUrl(entry, 580, 380) || imgRectangle10}
              alt=""
              className="h-[190px] w-[287px] rounded-[4px] object-cover"
            />
            <div className="mt-[13px] flex flex-col gap-[5px]">
              <div className="flex items-center gap-[12px]">
                <p className="bg-font-roboto text-[10px] leading-[24px] font-normal text-[#312e28]">
                  {displayDate(entry?.publishedAt)}
                </p>
                <div className="flex items-center gap-[4px]">
                  <img src={imgIcon2} alt="" className="h-[12px] w-[12px]" />
                  <p className="bg-font-roboto text-[10px] leading-[24px] font-normal text-[#312e28]">
                    {entry?.readingTime ? `${entry.readingTime} MIN READ` : "3 MIN READ"}
                  </p>
                </div>
                <img src={imgReply} alt="" className="h-[14px] w-[14px]" />
              </div>
              <p className="bg-font-roboto-condensed text-[20px] leading-[26px] font-medium text-[#312e28] group-hover:underline line-clamp-3">
                {entry?.title || "Profile title placeholder"}
              </p>
            </div>
          </Link>
        ))}
      </div>
      <Link
        href="/sections/project-profiles"
        className="mt-[32px] inline-flex w-[156px] items-center justify-center rounded-[4px] bg-[#113251] p-[12px] bg-font-roboto text-[12px] font-bold text-white"
      >
        View all profiles
      </Link>
    </div>
  );
}

function MidAd({ entry }: { entry?: HomepageEntry | null }) {
  return (
    <div className="absolute left-0 top-[1163px] flex h-[145px] w-[684px] items-center gap-[28px]">
      <img src={entryImageUrl(entry, 500, 500) || imgImage3} alt="" className="ml-[24px] h-[145px] w-[160px] rounded-[4px] object-cover" />
      <div className="w-[480px]">
        <h2 className="bg-type-h2 text-[#312e28]">{entry?.title || "The IBEW Union Hall"}</h2>
        {entry?.dek ? (
          <p className="bg-type-body mt-[6px] text-[#312e28]">
            {entry.dek}
          </p>
        ) : null}
        <Link href={entryHref(entry)} className="mt-[6px] inline-block bg-font-roboto text-[14px] text-[#c85006] underline">
          Call to action link
        </Link>
      </div>
    </div>
  );
}

function EventBanner({ entry, ctaLabel, ctaHref, body }: { entry?: HomepageEntry | null; ctaLabel?: string; ctaHref?: string; body?: string }) {
  const title = entry?.title || "Come Join Us At the 2025 Evening of Excellence";
  const subtitle = `Event starts 8:00 pm on ${entry?.publishedAt ? new Date(entry.publishedAt).toLocaleDateString("en-US").replaceAll("/", ".") : "04.13.2026"}`;
  return (
    <div className="absolute left-0 top-[1372px] h-[336px] w-[1440px] overflow-hidden">
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
          <Link href={ctaHref || entryHref(entry)} className="mt-[18px] inline-flex items-center gap-[5px] bg-font-helvetica text-[14px] underline">
            <span>{ctaLabel || "Register here"}</span>
            <svg viewBox="0 0 24 24" className="h-[24px] w-[24px]" aria-hidden="true">
              <path
                d="M5 12h14M13 6l6 6-6 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
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
      <div className="absolute left-[26px] top-[1732px] h-[361px] w-[684px]">
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
      <div className="absolute left-[730px] top-[1740px] flex h-[361px] w-[686px] items-center justify-center bg-[#d9d9d9]">
        <h2 className="bg-type-h1 text-[#adadad]">Ad space</h2>
      </div>
    </>
  );
}

function FigmaFooter() {
  const links1 = ["Local", "National", "Project profiles", "Member profiles"];
  const links2 = ["Feature", "Perspectives", "Data insights", "AI in construction"];
  const links3 = ["About Breaking Ground", "Sponsors", "Contact"];
  return (
    <footer className="absolute left-0 top-[2160px] h-[236px] w-[1440px] bg-[#312e28] px-[48px] py-[48px] text-white">
      <div className="flex items-start gap-[48px]">
        <div className="w-[373px]">
          <img src={imgBg2} alt="Breaking Ground" className="h-[58px] w-[240px] object-cover" />
          <p className="bg-font-roboto mt-[15px] text-[10px]">CONSTRUCTION • INDUSTRY • POWER • WESTERN PA</p>
        </div>
        <div className="flex w-[606px] gap-[58px] bg-font-roboto text-[14px]">
          <div className="space-y-[12px]">{links1.map((x) => <p key={x}>{x}</p>)}</div>
          <div className="space-y-[12px]">{links2.map((x) => <p key={x}>{x}</p>)}</div>
          <div className="space-y-[12px]">{links3.map((x) => <p key={x}>{x}</p>)}</div>
        </div>
        <div className="ml-auto">
          <div className="flex items-center gap-[19px]">
            <img src={imgFacebookWhite} alt="" className="h-[36px] w-[36px]" />
            <img src={imgLinkedInWhite} alt="" className="h-[36px] w-[36px]" />
            <img src={imgYoutubeWhite} alt="" className="h-[36px] w-[36px]" />
            <img src={imgInstagramWhite} alt="" className="h-[36px] w-[36px]" />
          </div>
          <p className="bg-font-helvetica mt-[14px] text-[12px]">© 2026 Breaking Ground    Privacy    Terms</p>
        </div>
      </div>
    </footer>
  );
}

export default async function IndexPage() {
  const homepage = await client.fetch<HomepageDoc>(HOMEPAGE_QUERY, {}, options);
  const hero = homepage?.heroArticle ?? null;
  const latest = await loadLatestNewsItems();
  const tabbed = homepage?.gridTwo?.length ? homepage.gridTwo : homepage?.gridThree ?? [];
  const midAd = homepage?.secondaryFeature ?? null;
  const event = homepage?.tertiaryFeature ?? homepage?.issueHighlight ?? null;

  return (
    <main className="figma-homepage min-h-screen bg-[#e8e8e8] overflow-x-auto">
      <div className="relative mx-auto h-[2644px] w-[1440px] bg-white">
        <TopRibbon />
        <HeroFeature
          entry={hero}
          badgeLabel={homepage?.heroBadgeLabel}
          badgeIcon={homepage?.heroBadgeIcon}
        />
        <LatestNews news={latest} />
        <TabbedPanel entries={tabbed} />
        <MidAd entry={midAd} />
        <EventBanner
          entry={event}
          ctaLabel={homepage?.announcementLinkLabel}
          ctaHref={homepage?.announcementLinkUrl}
          body={homepage?.announcementMessage}
        />
        <SponsorsAndAd />
        <FigmaFooter />
      </div>
    </main>
  );
}
