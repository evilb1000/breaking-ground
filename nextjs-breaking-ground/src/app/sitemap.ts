import type { MetadataRoute } from "next";
import { client } from "@/sanity/client";
import { SITE_URL, articleUrl } from "@/lib/urls";
import slugsManifest from "../../config/article-slugs.json";

// Regenerate the sitemap at most once an hour. Article pages themselves still
// use `revalidate = 0` so readers see fresh content instantly; crawlers just
// don't need to see every minor edit a minute after it happens.
export const revalidate = 3600;

// Section landings that exist as real routes. Mirrors the SECTIONS whitelist
// in src/app/sections/[section]/page.tsx — keep these in sync if you add or
// rename a section.
const SECTION_SLUGS = [
  "features",
  "project-profiles",
  "member-profiles",
  "perspectives",
  "local",
  "national",
  "data-insights",
  "ai-in-construction",
] as const;

// Other static top-level pages that aren't section landings or articles.
// `/` is handled separately so it gets priority 1.0.
const STATIC_PAGES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/news", changeFrequency: "daily", priority: 0.8 },
  { path: "/news-feed", changeFrequency: "daily", priority: 0.8 },
  { path: "/about", changeFrequency: "monthly", priority: 0.4 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.4 },
  { path: "/sponsors", changeFrequency: "monthly", priority: 0.4 },
];

type SanityArticleSitemapRow = {
  slug: string | null;
  _updatedAt?: string;
};

// Live projection so the sitemap's <lastmod> actually reflects the most recent
// edit in Sanity instead of the last time the static manifest was regenerated.
const ARTICLES_QUERY = `*[_type == "figmaArticle" && defined(slug.current)]{
  "slug": slug.current,
  _updatedAt
}`;

async function fetchSanityArticles(): Promise<SanityArticleSitemapRow[]> {
  try {
    const rows = await client.fetch<SanityArticleSitemapRow[]>(
      ARTICLES_QUERY,
      {},
      { next: { revalidate: 3600 } },
    );
    return Array.isArray(rows) ? rows.filter((r) => !!r.slug) : [];
  } catch (err) {
    // Never take the whole sitemap down just because Sanity hiccuped — fall
    // back to the manifest that's committed alongside next.config.ts.
    console.warn("[sitemap] Sanity fetch failed, falling back to manifest", err);
    return [];
  }
}

function manifestSlugs(): string[] {
  const raw = (slugsManifest as { slugs?: unknown }).slugs;
  return Array.isArray(raw)
    ? (raw as unknown[]).filter(
        (s): s is string => typeof s === "string" && s.length > 0,
      )
    : [];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const liveArticles = await fetchSanityArticles();
  const articleEntries: MetadataRoute.Sitemap =
    liveArticles.length > 0
      ? liveArticles.map((a) => ({
          url: articleUrl(a.slug),
          lastModified: a._updatedAt ? new Date(a._updatedAt) : now,
          changeFrequency: "weekly",
          priority: 0.6,
        }))
      : manifestSlugs().map((slug) => ({
          url: articleUrl(slug),
          lastModified: now,
          changeFrequency: "weekly",
          priority: 0.6,
        }));

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    ...STATIC_PAGES.map((p) => ({
      url: `${SITE_URL}${p.path}`,
      lastModified: now,
      changeFrequency: p.changeFrequency,
      priority: p.priority,
    })),
    ...SECTION_SLUGS.map((slug) => ({
      url: `${SITE_URL}/sections/${slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];

  return [...staticEntries, ...articleEntries];
}
