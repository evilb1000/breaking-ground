import Link from "next/link";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { client } from "@/sanity/client";
import FigmaLandingTemplate, { type LandingItem } from "@/components/landing/FigmaLandingTemplate";
import Masthead from "@/components/Masthead";
import { articleHref } from "@/lib/urls";
import { adSurfaceForArticleSection } from "@/lib/ads";

const SECTIONS: Record<string, { title: string; seriesSlug: string }> = {
  local: { title: "Local", seriesSlug: "regional-market-update" },
  national: { title: "National", seriesSlug: "national-market-update" },
  "project-profiles": { title: "Project Profiles", seriesSlug: "project-profiles" },
  "member-profiles": { title: "Member Profiles", seriesSlug: "member-profiles" },
  features: { title: "Features", seriesSlug: "construction-features" },
  perspectives: { title: "Perspectives", seriesSlug: "construction-perspectives" },
  "data-insights": { title: "Data Insights", seriesSlug: "construction-data" },
  "ai-in-construction": { title: "AI In Construction", seriesSlug: "ai-in-construction" },
};

const ARTICLES_BY_SERIES_QUERY = `*[_type == "figmaArticle" && series->slug.current == $seriesSlug && defined(slug.current) && hideFromSite != true]
  | order(publishedAt desc){
    _id,
    "title": coalesce(headline, title),
    dek,
    slug,
    publishedAt,
    readingTime,
    "category": coalesce(articleTag, category, section),
    introImage{asset->{url,_ref,_type}, alt, crop, hotspot},
    headerImage{asset->{url,_ref,_type}, alt, crop, hotspot},
    heroImage{asset->{url,_ref,_type}, alt, crop, hotspot},
    homepageImage{asset->{url,_ref,_type}, alt, crop, hotspot},
    author->{name},
    series->{title, seriesImage{asset->{url,_ref,_type}, alt}}
  }`;

const ARTICLES_BY_SECTION_QUERY = `*[_type == "figmaArticle" && section == $section && defined(slug.current) && hideFromSite != true]
  | order(publishedAt desc){
    _id,
    _type,
    "title": coalesce(headline, title),
    dek,
    slug,
    publishedAt,
    "category": coalesce(articleTag, category, section),
    readingTime,
    introImage{asset->{url,_ref,_type}, alt, crop, hotspot},
    headerImage{asset->{url,_ref,_type}, alt, crop, hotspot},
    heroImage{asset->{url,_ref,_type}, alt, crop, hotspot},
    homepageImage{asset->{url,_ref,_type}, alt, crop, hotspot},
    author->{name},
    series->{title, seriesImage{asset->{url,_ref,_type}, alt}}
  }`;

export const revalidate = 0;
const options = { next: { revalidate: 0 } };
const LANDING_PAGE_SIZE = 6;

const urlFor = (source: SanityImageSource) =>
  imageUrlBuilder({
    projectId: client.config().projectId!,
    dataset: client.config().dataset!,
  }).image(source);

type ImageAssetRef = {
  asset?: { url?: string; _ref?: string; _type?: string };
  alt?: string;
  crop?: unknown;
  hotspot?: { x?: number; y?: number };
};

type LandingSourceItem = {
  _id: string;
  _type: string;
  title?: string;
  dek?: string;
  slug?: { current?: string };
  publishedAt?: string;
  category?: string;
  readingTime?: number;
  introImage?: ImageAssetRef | null;
  headerImage?: ImageAssetRef | null;
  heroImage?: ImageAssetRef | null;
  homepageImage?: ImageAssetRef | null;
  series?: { seriesImage?: ImageAssetRef | null } | null;
};

const hasAsset = (img?: ImageAssetRef | null) => Boolean(img?.asset?._ref || img?.asset?.url);
const pickImage = (article: LandingSourceItem) =>
  hasAsset(article?.homepageImage)
    ? article.homepageImage
    : hasAsset(article?.headerImage)
    ? article.headerImage
    : hasAsset(article?.heroImage)
    ? article.heroImage
    : hasAsset(article?.introImage)
    ? article.introImage
    : hasAsset(article?.series?.seriesImage)
    ? article.series?.seriesImage ?? null
    : null;

const hotspotPosition = (img?: ImageAssetRef | null) => {
  const hotspot = img?.hotspot;
  if (typeof hotspot?.x !== "number" || typeof hotspot?.y !== "number") return undefined;
  return `${(hotspot.x * 100).toFixed(1)}% ${(hotspot.y * 100).toFixed(1)}%`;
};

function formatDisplayDate(raw?: string): string {
  if (!raw) return "APRIL 15, 2026";
  const dt = new Date(raw);
  if (Number.isNaN(dt.getTime())) return "APRIL 15, 2026";
  return dt
    .toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();
}

export default async function SectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ section: string }>;
  searchParams?: Promise<{ page?: string }>;
}) {
  const { section } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const rawPage = Number.parseInt(resolvedSearchParams.page || "1", 10);
  const currentPage = Number.isFinite(rawPage) ? Math.max(rawPage, 1) : 1;
  const config = SECTIONS[section];

  if (!config) {
    return (
      <>
        <Masthead homeHref="/" />
        <main className="min-h-screen flex flex-col items-center justify-center bg-white text-black">
          <h1 className="font-serif text-4xl font-bold">Section not found</h1>
          <Link href="/" className="mt-6 text-gray-600 hover:underline">
            ← Back to home
          </Link>
        </main>
      </>
    );
  }

  const isSectionOwned =
    section === "project-profiles" ||
    section === "member-profiles" ||
    section === "features" ||
    section === "perspectives";

  const items = isSectionOwned
    ? await client.fetch<LandingSourceItem[]>(
        ARTICLES_BY_SECTION_QUERY,
        { section },
        options
      )
    : await client.fetch<LandingSourceItem[]>(
        ARTICLES_BY_SERIES_QUERY,
        { seriesSlug: config.seriesSlug },
        options
      );
  const mappedItems: LandingItem[] = items.map((article) => {
    const img = pickImage(article);
    const imageSrc = img
      ? urlFor(img as SanityImageSource)?.width(900).height(600).fit("crop").url()
      : null;

    // Prefer the article's own tag (articleTag → category → section).
    // Treat the schema's default placeholder "ARTICLE TAG" as if it were
    // unset so we don't render the literal placeholder on the landing page.
    const rawTag = (article.category || "").trim();
    const isPlaceholder = rawTag.toUpperCase() === "ARTICLE TAG";
    const tagLabel = !rawTag || isPlaceholder ? config.title : rawTag;

    return {
      id: article._id,
      title: article.title || "Untitled",
      summary: article.dek || undefined,
      href: articleHref(article.slug?.current),
      imageSrc,
      imageAlt: img?.alt || article.title || "Article image",
      imagePosition: hotspotPosition(img),
      dateLabel: formatDisplayDate(article.publishedAt),
      readTimeLabel: article.readingTime ? `${article.readingTime} MIN READ` : "3 MIN READ",
      tagLabel,
      external: false,
    };
  });

  const remainingItems = mappedItems.slice(1);
  const visibleTiles = remainingItems.slice(0, currentPage * LANDING_PAGE_SIZE);
  const hasMoreItems = visibleTiles.length < remainingItems.length;
  const nextPageHref = `/sections/${section}?page=${currentPage + 1}`;

  return (
    <FigmaLandingTemplate
      pageTitle={config.title}
      breadcrumbCurrent={config.title}
      featuredItem={mappedItems[0]}
      tiles={visibleTiles}
      currentListLabel={`Current ${config.title.toLowerCase()}`}
      loadMoreHref={hasMoreItems ? nextPageHref : undefined}
      loadMoreLabel="Load more"
      adSurface={adSurfaceForArticleSection(section)}
    />
  );
}
