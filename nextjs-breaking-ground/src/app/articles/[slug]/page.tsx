import type { Metadata } from "next";
import { client } from "@/sanity/client";
import FigmaArticlePage from "@/components/FigmaArticlePage";
import FigmaProfileArticlePage from "@/components/FigmaProfileArticlePage";
import Link from "next/link";

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
  "bodyText": pt::text(body)
}`;

export const revalidate = 0;
const options = { next: { revalidate: 0 } };

type MetaDoc = {
  title?: string;
  headline?: string;
  dek?: string;
  bodyText?: string;
};

const TITLE_MAX = 70;
const DESCRIPTION_MAX = 160;

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const meta = await client.fetch<MetaDoc | null>(
    META_QUERY,
    await params,
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

  return {
    title,
    description,
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
