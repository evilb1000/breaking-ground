import type { Metadata } from "next";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { client } from "@/sanity/client";
import FigmaArticlePage from "@/components/FigmaArticlePage";
import FigmaProfileArticlePage from "@/components/FigmaProfileArticlePage";
import Link from "next/link";

const SITE_URL = "https://www.breakinggroundpittsburgh.com";

const ENTRY_QUERY = `*[_type == "figmaArticle" && slug.current == $slug][0]{
  _type,
  title,
  headline,
  dek,
  publishedAt,
  readingTime,
  section,
  articleTag,
  introImage{_type, asset, "assetUrl": asset->url, alt, caption, crop, hotspot},
  headerImage{_type, asset, "assetUrl": asset->url, alt, caption, crop, hotspot},
  heroImage{_type, asset, "assetUrl": asset->url, alt, caption, crop, hotspot},
  author->{name, image, bio},
  authorBio,
  coAuthors[]->{name, image},
  series->{title, slug, seriesImage{_type, asset, "assetUrl": asset->url, alt, caption, crop, hotspot}},
  category,
  body[]{
    ...,
    mapFile{asset->{url}},
    dataFile{asset->{url}}
  },
  featured,
  relatedArticles[]->{
    _id,
    _type,
    "slug": slug.current,
    title,
    headline,
    section,
    category,
    publishedAt,
    headerImage{_type, asset, "assetUrl": asset->url, alt, crop, hotspot},
    introImage{_type, asset, "assetUrl": asset->url, alt, crop, hotspot}
  },
  nextArticle->{
    _id,
    _type,
    "slug": slug.current,
    title,
    headline,
    section,
    category
  }
}`;

// Lean projection for <head> metadata. pt::text() collapses the Portable Text
// body to a plain-text string so we can truncate the first paragraph as a
// meta-description fallback when `dek` is missing. Runs as a separate query
// from the main article fetch so neither path has to carry the other's cost.
const META_QUERY = `*[_type == "figmaArticle" && slug.current == $slug][0]{
  title,
  headline,
  dek,
  publishedAt,
  section,
  "authorName": author->name,
  "bodyText": pt::text(body),
  introImage{alt, asset->{_id, url}},
  heroImage{alt, asset->{_id, url}},
  headerImage{alt, asset->{_id, url}}
}`;

export const revalidate = 0;
const options = { next: { revalidate: 0 } };

type MetaImage = {
  alt?: string;
  asset?: {
    _id?: string;
    url?: string;
  };
};

type MetaDoc = {
  title?: string;
  headline?: string;
  dek?: string;
  bodyText?: string;
  publishedAt?: string;
  section?: string;
  authorName?: string;
  introImage?: MetaImage;
  heroImage?: MetaImage;
  headerImage?: MetaImage;
};

const TITLE_MAX = 70;
const DESCRIPTION_MAX = 160;
// LinkedIn/Facebook/Twitter all render 1.91:1 crops best around 1200x630.
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

function truncate(input: string, max: number): string {
  const trimmed = input.replace(/\s+/g, " ").trim();
  if (trimmed.length <= max) return trimmed;
  const cut = trimmed.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  const base = lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut;
  return `${base.replace(/[\s,;:\-–—]+$/, "")}…`;
}

function firstParagraph(bodyText?: string): string {
  if (!bodyText) return "";
  const blocks = bodyText.split(/\n\s*\n/);
  return (blocks.find((b) => b.trim().length > 0) ?? "").trim();
}

function buildDescription(meta: MetaDoc | null): string | undefined {
  if (!meta) return undefined;
  const dek = meta.dek?.trim();
  if (dek) return truncate(dek, DESCRIPTION_MAX);
  const paragraph = firstParagraph(meta.bodyText);
  return paragraph ? truncate(paragraph, DESCRIPTION_MAX) : undefined;
}

// Picks the first image we can actually use for a social card. Order mirrors
// what the visible page templates do: introImage is the "hero" of the article
// layout, heroImage is the homepage card variant, headerImage is a fallback
// from older authoring patterns.
function pickSocialImage(
  meta: MetaDoc,
): { url: string; alt: string } | null {
  const candidates = [meta.introImage, meta.heroImage, meta.headerImage];
  for (const img of candidates) {
    if (!img?.asset) continue;
    if (img.asset._id) {
      const built = urlFor(img as SanityImageSource)
        ?.width(OG_WIDTH)
        .height(OG_HEIGHT)
        .fit("crop")
        .auto("format")
        .url();
      if (built) return { url: built, alt: img.alt || "" };
    }
    if (img.asset.url) {
      return { url: img.asset.url, alt: img.alt || "" };
    }
  }
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolved = await params;
  const meta = await client.fetch<MetaDoc | null>(
    META_QUERY,
    resolved,
    options,
  );

  if (!meta) {
    return {
      title: "Article not found | Breaking Ground",
      description: "The article you are looking for could not be found.",
    };
  }

  const rawTitle = (meta.headline || meta.title || "").trim();
  const title = rawTitle
    ? `${truncate(rawTitle, TITLE_MAX)} | Breaking Ground`
    : "Breaking Ground";
  const description = buildDescription(meta);
  const canonical = `${SITE_URL}/articles/${resolved.slug}`;
  const social = pickSocialImage(meta);

  const ogImages = social
    ? [
        {
          url: social.url,
          width: OG_WIDTH,
          height: OG_HEIGHT,
          alt: social.alt || rawTitle || "Breaking Ground",
        },
      ]
    : undefined;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title,
      description,
      url: canonical,
      siteName: "Breaking Ground",
      ...(ogImages ? { images: ogImages } : {}),
      ...(meta.publishedAt ? { publishedTime: meta.publishedAt } : {}),
      ...(meta.authorName ? { authors: [meta.authorName] } : {}),
      ...(meta.section ? { section: meta.section } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(ogImages ? { images: ogImages.map((i) => i.url) } : {}),
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // FigmaArticlePage owns its own typing; keep this loose so the GROQ shape
  // can evolve without dragging this route along.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const article = await client.fetch<any | null>(ENTRY_QUERY, await params, options);

  if (!article) {
    return (
      <main className="container mx-auto min-h-screen max-w-3xl p-8 flex flex-col gap-4">
        <Link href="/" className="hover:underline">
          ← Back to posts
        </Link>
        <h1 className="text-2xl font-semibold">Article not found</h1>
      </main>
    );
  }

  const isProfile =
    article?.section === "project-profiles" || article?.section === "member-profiles";

  return isProfile ? (
    <FigmaProfileArticlePage article={article} />
  ) : (
    <FigmaArticlePage article={article} />
  );
}
