import Link from "next/link";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { client } from "@/sanity/client";

export const revalidate = 0;
const options = { next: { revalidate: 0 } };

const FEATURED_QUERY = `*[_type == "article" && featured == true && defined(slug.current)]
  | order(_updatedAt desc)[0]{
    _id,
    title,
    dek,
    slug,
    publishedAt,
    category,
  headerImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot},
    author->{name, image}
  }`;

const FALLBACK_LATEST_QUERY = `*[_type == "article" && defined(slug.current)]
  | order(publishedAt desc)[0]{
    _id,
    title,
    dek,
    slug,
    publishedAt,
    category,
  headerImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot},
    author->{name, image}
  }`;

const MORE_STORIES_QUERY = `*[_type == "article" && defined(slug.current)]
  | order(publishedAt desc)[0...7]{
    _id,
    title,
    dek,
    slug,
    publishedAt,
    category,
  headerImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot},
    author->{name, image}
  }`;

const urlFor = (source: SanityImageSource) =>
  imageUrlBuilder({ projectId: client.config().projectId!, dataset: client.config().dataset! })
    .image(source);

export default async function IndexPage() {
  // Get featured (or fallback) and recent list
  const featured =
    (await client.fetch<any | null>(FEATURED_QUERY, {}, options)) ||
    (await client.fetch<any | null>(FALLBACK_LATEST_QUERY, {}, options));

  const list = await client.fetch<any[]>(MORE_STORIES_QUERY, {}, options);
  const moreStories = featured ? list.filter((a) => a._id !== featured._id).slice(0, 6) : list.slice(0, 6);

  const formatDate = (iso?: string) =>
    iso ? new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "";

  return (
    <main className="bg-white text-black px-6 md:px-12 py-12 max-w-5xl mx-auto">
      {/* Masthead */}
      <header className="text-center mb-12">
        <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight">Breaking Ground</h1>
        <p className="text-sm uppercase tracking-wide text-gray-500 mt-4">
          Construction • Industry • Power • Western PA
        </p>
      </header>

      {/* Featured Article */}
      {featured && (
        <section className="mb-16">
          <Link href={`/${featured.slug.current}`} className="block group">
            <div className="w-full overflow-hidden rounded-lg mb-6">
              {featured?.headerImage?.asset ? (
                (() => {
                  const src = urlFor(featured.headerImage as SanityImageSource)
                    ?.width(1600)
                    .height(900)
                    .fit('crop')
                    .url() || ''
                  return (
                    <img
                      src={src}
                      alt={featured.headerImage?.alt || featured.title}
                      className="w-full h-[300px] md:h-[400px] object-cover object-center transition-transform duration-300 ease-out group-hover:scale-[1.03] group-hover:opacity-95"
                    />
                  )
                })()
              ) : (
                <div className="w-full h-[300px] md:h-[400px] bg-gray-100" />
              )}
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold leading-tight group-hover:underline">
              {featured.title}
            </h2>
            {featured.dek ? (
              <p className="mt-4 text-lg italic text-gray-600 leading-relaxed max-w-3xl">
                {featured.dek}
              </p>
            ) : null}
            <div className="mt-4 text-sm text-gray-500 flex flex-wrap items-center gap-2">
              {featured.author?.name && (
                <span className="uppercase tracking-wide">By {featured.author.name}</span>
              )}
              {featured.publishedAt && (
                <>
                  <span aria-hidden="true">•</span>
                  <time>{formatDate(featured.publishedAt)}</time>
                </>
              )}
            </div>
          </Link>
        </section>
      )}

      {/* More Stories */}
      <h3 className="font-serif text-xl font-bold tracking-tight mb-6 border-t border-gray-200 pt-8">
        More Stories
      </h3>

      {moreStories.length === 0 ? (
        <p className="text-gray-500">No additional articles yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {moreStories.map((article) => (
            <Link href={`/${article.slug.current}`} className="group block" key={article._id}>
              <div className="w-full h-[180px] overflow-hidden rounded-md mb-4 bg-gray-100">
                {article?.headerImage?.asset ? (
                  (() => {
                    const src = urlFor(article.headerImage as SanityImageSource)
                      ?.width(800)
                      .height(600)
                      .fit('crop')
                      .url() || ''
                    return (
                      <img
                        src={src}
                        alt={article.headerImage?.alt || article.title}
                        className="w-full h-full object-cover object-center transition-transform duration-300 ease-out group-hover:scale-[1.03] group-hover:opacity-95"
                      />
                    )
                  })()
                ) : null}
              </div>
              <h4 className="font-serif text-xl font-semibold leading-snug group-hover:underline">
                {article.title}
              </h4>
              {article.dek ? (
                <p className="text-gray-600 text-sm leading-relaxed mt-2 line-clamp-2">{article.dek}</p>
              ) : null}
              <div className="text-[11px] uppercase tracking-wide text-gray-500 mt-3 flex flex-wrap gap-2">
                {article.author?.name && <span>By {article.author.name}</span>}
                {article.category && (
                  <>
                    <span aria-hidden="true">•</span>
                    <span>{article.category}</span>
                  </>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
