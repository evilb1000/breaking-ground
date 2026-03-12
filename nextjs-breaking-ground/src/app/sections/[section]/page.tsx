import Link from "next/link";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { client } from "@/sanity/client";
import Masthead from "@/components/Masthead";

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

const ARTICLES_BY_SERIES_QUERY = `*[_type == "article" && series->slug.current == $seriesSlug && defined(slug.current)]
  | order(publishedAt desc){
    _id,
    title,
    dek,
    slug,
    publishedAt,
    category,
    headerImage{asset->{url,_ref,_type}, alt},
    heroImage{asset->{url,_ref,_type}, alt},
    homepageImage{asset->{url,_ref,_type}, alt},
    author->{name},
    series->{title, seriesImage{asset->{url,_ref,_type}, alt}}
  }`;

const PROJECT_PROFILES_QUERY = `*[_type == "projectProfile" && defined(slug.current)]
  | order(publishedAt desc){
    _id,
    title,
    dek,
    slug,
    publishedAt,
    projectName,
    location,
    headerImage{asset->{url,_ref,_type}, alt},
    author->{name}
  }`;

export const revalidate = 0;
const options = { next: { revalidate: 0 } };

const urlFor = (source: SanityImageSource) =>
  imageUrlBuilder({
    projectId: client.config().projectId!,
    dataset: client.config().dataset!,
  }).image(source);

const hasAsset = (img: any) => Boolean(img?.asset?._ref || img?.asset?.url);
const pickImage = (article: any) =>
  hasAsset(article?.homepageImage)
    ? article.homepageImage
    : hasAsset(article?.headerImage)
    ? article.headerImage
    : hasAsset(article?.heroImage)
    ? article.heroImage
    : hasAsset(article?.series?.seriesImage)
    ? article.series.seriesImage
    : null;

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

  const isProjectProfiles = section === "project-profiles";

  const articles = isProjectProfiles
    ? await client.fetch<any[]>(PROJECT_PROFILES_QUERY, {}, options)
    : await client.fetch<any[]>(
        ARTICLES_BY_SERIES_QUERY,
        { seriesSlug: config.seriesSlug },
        options
      );

  return (
    <>
      <Masthead homeHref="/" />
      <main className="min-h-screen bg-white text-black px-4 md:px-12 lg:px-24 py-12">
        <h1 className="font-serif text-5xl md:text-6xl font-bold tracking-tight text-center">
          {config.title}
        </h1>

        {articles.length === 0 ? (
          <p className="mt-8 text-lg text-gray-500 text-center">No articles yet.</p>
        ) : (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => {
              const img = pickImage(article);
              const imgSrc = img
                ? urlFor(img as SanityImageSource)?.width(800).height(600).fit("crop").url()
                : null;

              return (
                <Link
                  key={article._id}
                  href={`/${article.slug.current}`}
                  className="group block"
                >
                  <div className="w-full h-[240px] md:h-[280px] overflow-hidden rounded-lg bg-gray-100 mb-4">
                    {imgSrc ? (
                      <img
                        src={imgSrc}
                        alt={img?.alt || article.title}
                        className="w-full h-full object-cover object-center transition-transform duration-300 ease-out group-hover:scale-[1.03] group-hover:opacity-95"
                      />
                    ) : null}
                  </div>
                  <h2 className="font-serif text-2xl md:text-3xl font-bold leading-snug group-hover:underline">
                    {article.title}
                  </h2>
                  {article.dek ? (
                    <p className="text-gray-600 text-base md:text-lg leading-relaxed mt-2 line-clamp-2">
                      {article.dek}
                    </p>
                  ) : null}
                  {isProjectProfiles && article.location && (
                    <p className="text-sm text-gray-500 mt-2">{article.location}</p>
                  )}
                  {article.author?.name && (
                    <p className="text-sm text-gray-500 mt-3">
                      By {article.author.name}
                      {article.publishedAt
                        ? ` · ${new Date(article.publishedAt).toLocaleDateString()}`
                        : null}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
