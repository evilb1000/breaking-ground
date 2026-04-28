import Link from "next/link";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { client } from "@/sanity/client";
import FigmaLandingTemplate, { type LandingItem } from "@/components/landing/FigmaLandingTemplate";
import Masthead from "@/components/Masthead";
import { articleHref } from "@/lib/urls";

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

const ARTICLES_BY_SERIES_QUERY = `*[_type == "figmaArticle" && series->slug.current == $seriesSlug && defined(slug.current)]
  | order(publishedAt desc){
    _id,
    "title": coalesce(headline, title),
    dek,
    slug,
    publishedAt,
    readingTime,
    "category": coalesce(articleTag, category, section),
    introImage{asset->{url,_ref,_type}, alt},
    headerImage{asset->{url,_ref,_type}, alt},
    heroImage{asset->{url,_ref,_type}, alt},
    homepageImage{asset->{url,_ref,_type}, alt},
    author->{name},
    series->{title, seriesImage{asset->{url,_ref,_type}, alt}}
  }`;

const PROFILES_BY_SECTION_QUERY = `*[_type == "figmaArticle" && section == $section && defined(slug.current)]
  | order(publishedAt desc){
    _id,
    _type,
    "title": coalesce(headline, title),
    dek,
    slug,
    publishedAt,
    "category": coalesce(articleTag, category, section),
    readingTime,
    introImage{asset->{url,_ref,_type}, alt},
    headerImage{asset->{url,_ref,_type}, alt},
    heroImage{asset->{url,_ref,_type}, alt},
    homepageImage{asset->{url,_ref,_type}, alt},
    author->{name},
    series->{title, seriesImage{asset->{url,_ref,_type}, alt}}
  }`;

export const revalidate = 0;
const options = { next: { revalidate: 0 } };

const urlFor = (source: SanityImageSource) =>
  imageUrlBuilder({
    projectId: client.config().projectId!,
    dataset: client.config().dataset!,
  }).image(source);

type ImageAssetRef = {
  asset?: { url?: string; _ref?: string; _type?: string };
  alt?: string;
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
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
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

  const isProfileSection = section === "project-profiles" || section === "member-profiles";

  const items = isProfileSection
    ? await client.fetch<LandingSourceItem[]>(
        PROFILES_BY_SECTION_QUERY,
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
      dateLabel: formatDisplayDate(article.publishedAt),
      readTimeLabel: article.readingTime ? `${article.readingTime} MIN READ` : "3 MIN READ",
      tagLabel,
      external: false,
    };
  });

  return (
    <FigmaLandingTemplate
      pageTitle={config.title}
      breadcrumbCurrent={config.title}
      featuredItem={mappedItems[0]}
      tiles={mappedItems.slice(1, 7)}
      currentListLabel={`Current ${config.title.toLowerCase()}`}
      loadMoreHref={`/sections/${section}`}
      loadMoreLabel="Load more"
    />
  );
}
