import Link from "next/link";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { client } from "@/sanity/client";
import MoreStoriesCarousel from "@/components/MoreStoriesCarousel";
import AnnouncementBar from "@/components/AnnouncementBar";

export const revalidate = 0;
const options = { next: { revalidate: 0 } };

const FEATURED_QUERY = `*[_type in ["article","animatedData"] && featured == true && defined(slug.current)]
  | order(_updatedAt desc)[0]{
    _id,
    title,
    dek,
    heroLede,
    slug,
    publishedAt,
    category,
  headerImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot},
    author->{name, image}
  }`;

const FALLBACK_LATEST_QUERY = `*[_type in ["article","animatedData"] && defined(slug.current)]
  | order(publishedAt desc)[0]{
    _id,
    title,
    dek,
    heroLede,
    slug,
    publishedAt,
    category,
  headerImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot},
    author->{name, image}
  }`;

const MORE_STORIES_QUERY = `*[_type in ["article","animatedData"] && defined(slug.current)]
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

const ANNOUNCEMENT_QUERY = `*[_type == "homepage"][0]{
  announcementMessage,
  announcementLinkLabel,
  announcementLinkUrl
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
  const announcement = await client.fetch<{
    announcementMessage?: string;
    announcementLinkLabel?: string;
    announcementLinkUrl?: string;
  } | null>(
    ANNOUNCEMENT_QUERY,
    {},
    options
  );
  const carouselStories = moreStories.map((article) => ({
    _id: article._id,
    slug: article.slug,
    title: article.title,
    dek: article.dek,
    category: article.category,
    authorName: article.author?.name,
    imageAlt: article.headerImage?.alt || article.title,
    imageSrc: article?.headerImage?.asset
      ? urlFor(article.headerImage as SanityImageSource)
          ?.width(800)
          .height(600)
          .fit('crop')
          .url() || ''
      : '',
  }));

  return (
    <main className="bg-white text-black px-12 md:px-24 py-12 w-full">
      {/* Masthead */}
      <header className="sticky top-0 z-50 bg-white text-center px-6 py-6 border-b border-gray-200">
        <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight">Breaking Ground</h1>
        <p className="text-sm uppercase tracking-wide text-gray-500 mt-4">
          Construction • Industry • Power • Western PA
        </p>
      </header>

      {/* Featured Article */}
      {featured && (
    <section className={`${featured.category === "feature" ? "mt-2" : "mt-12"} mb-16`}>
      {featured.category === "feature" ? (
        <Link href={`/${featured.slug.current}`} className="block group">
          <div className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              <div className="order-2 md:order-1 flex items-center justify-center">
                <div className="max-w-2xl w-full flex flex-col items-center text-center">
                  <h2 className="font-serif text-4xl md:text-5xl font-bold leading-tight group-hover:underline">
                    {featured.title}
                  </h2>
                  {featured.heroLede || featured.dek ? (
                    <p className="mt-4 text-2xl md:text-3xl text-gray-600 leading-snug">
                      {featured.heroLede || featured.dek}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="order-1 md:order-2 h-[45vh] w-full overflow-hidden rounded-lg">
                {featured?.headerImage?.asset ? (
                  (() => {
                    const src = urlFor(featured.headerImage as SanityImageSource)
                      ?.width(1200)
                      .height(1500)
                      .fit('crop')
                      .url() || ''
                    return (
                      <img
                        src={src}
                        alt={featured.headerImage?.alt || featured.title}
                        className="w-full h-full object-cover object-center"
                      />
                    )
                  })()
                ) : (
                  <div className="w-full h-full bg-gray-100" />
                )}
              </div>
            </div>
          </div>
        </Link>
      ) : (
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
          {featured.heroLede || featured.dek ? (
            <p className="mt-4 text-xl md:text-2xl text-gray-600 leading-snug max-w-3xl">
              {featured.heroLede || featured.dek}
            </p>
          ) : null}
        </Link>
      )}
    </section>
      )}

      {/* Announcement Bar */}
      <AnnouncementBar
        message={announcement?.announcementMessage}
        linkLabel={announcement?.announcementLinkLabel}
        linkUrl={announcement?.announcementLinkUrl}
      />

      {/* More Stories */}
      <h3 className="font-serif text-xl font-bold tracking-tight mb-6 pt-8">
        More Stories
      </h3>

      {moreStories.length === 0 ? (
        <p className="text-gray-500">No additional articles yet.</p>
      ) : (
        <MoreStoriesCarousel stories={carouselStories} />
      )}
    </main>
  );
}
