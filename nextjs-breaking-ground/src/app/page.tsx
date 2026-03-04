import Link from "next/link";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { client } from "@/sanity/client";
import MoreStoriesCarousel from "@/components/MoreStoriesCarousel";
import AnnouncementBar from "@/components/AnnouncementBar";

export const revalidate = 0;
const options = { next: { revalidate: 0 } };

const FEATURED_QUERY = `*[_type == "article" && featured == true && defined(slug.current)]
  | order(_updatedAt desc)[0]{
    _id,
    title,
    dek,
    heroLede,
    slug,
    publishedAt,
    category,
  headerImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot},
  heroImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot},
    author->{name, image}
  }`;

const FALLBACK_LATEST_QUERY = `*[_type == "article" && defined(slug.current)]
  | order(publishedAt desc)[0]{
    _id,
    title,
    dek,
    heroLede,
    slug,
    publishedAt,
    category,
  headerImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot},
  heroImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot},
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
  heroImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot},
    author->{name, image}
  }`;

const HOMEPAGE_QUERY = `*[_type == "homepage"][0]{
  announcementMessage,
  announcementLinkLabel,
  announcementLinkUrl,
  heroArticle->{
    _id, title, dek, heroLede, slug, publishedAt, category,
    headerImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot},
    heroImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot},
    author->{name, image}
  },
  gridOne[]->{
    _id, title, dek, slug, publishedAt, category,
    headerImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot},
    heroImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot},
    author->{name, image}
  },
  gridTwo[]->{
    _id, title, dek, slug, publishedAt, category,
    headerImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot},
    heroImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot},
    author->{name, image}
  },
  secondaryFeature->{
    _id,
    title,
    dek,
    heroLede,
    slug,
    publishedAt,
    category,
    headerImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot},
    heroImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot},
    author->{name, image}
  }
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
  const homepage = await client.fetch<{
    announcementMessage?: string;
    announcementLinkLabel?: string;
    announcementLinkUrl?: string;
    heroArticle?: any;
    gridOne?: any[];
    gridTwo?: any[];
    secondaryFeature?: {
      _id: string;
      title: string;
      dek?: string;
      heroLede?: string;
      slug?: {current?: string};
      category?: string;
      headerImage?: {
        asset?: unknown;
        alt?: string;
      };
      heroImage?: {
        asset?: unknown;
        alt?: string;
      };
    };
  } | null>(
    HOMEPAGE_QUERY,
    {},
    options
  );

  const activeHero = homepage?.heroArticle && homepage.heroArticle.slug?.current ? homepage.heroArticle : featured;
  const firstCarouselSource = homepage?.gridOne?.length ? homepage.gridOne : moreStories;
  const secondCarouselSource = homepage?.gridTwo?.length ? homepage.gridTwo : [];

  const toCarouselStories = (items: any[]) =>
    items
      .filter((article) => article?.slug?.current)
      .map((article) => {
        const cardImage = article?.headerImage?.asset ? article.headerImage : article?.heroImage;
        return {
          _id: article._id,
          slug: article.slug,
          title: article.title,
          dek: article.dek,
          category: article.category,
          authorName: article.author?.name,
          imageAlt: cardImage?.alt || article.title,
          imageSrc: cardImage?.asset
            ? urlFor(cardImage as SanityImageSource)?.width(800).height(600).fit('crop').url() || ''
            : '',
        };
      });

  const firstCarouselStories = toCarouselStories(firstCarouselSource);
  const secondCarouselStories = toCarouselStories(secondCarouselSource);

  const renderFeatureBlock = (item: any, isSecondary = false) => {
    const featureImage = item?.headerImage?.asset ? item.headerImage : item?.heroImage;
    return (
      <section className={`${item.category === "feature" ? "mt-2" : "mt-12"} mb-16`}>
        {item.category === "feature" ? (
          <Link href={`/${item.slug.current}`} className="block group">
            <div className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                <div className={`${isSecondary ? "order-2 md:order-2 h-[45vh]" : "order-2 md:order-1"} flex items-center justify-center`}>
                  <div className={`${isSecondary ? "w-full h-full bg-black text-white rounded-lg p-8 md:p-10 flex flex-col items-center text-center justify-center" : "max-w-2xl w-full flex flex-col items-center text-center"}`}>
                    <h2 className="font-serif text-4xl md:text-5xl font-bold leading-tight group-hover:underline">
                      {item.title}
                    </h2>
                    {item.heroLede || item.dek ? (
                      <p className={`mt-4 text-2xl md:text-3xl leading-snug ${isSecondary ? "text-white/85" : "text-gray-600"}`}>
                        {item.heroLede || item.dek}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className={`${isSecondary ? "order-1 md:order-1" : "order-1 md:order-2"} h-[45vh] w-full overflow-hidden rounded-lg`}>
                  {featureImage?.asset ? (
                    (() => {
                      const src = urlFor(featureImage as SanityImageSource)
                        ?.width(1200)
                        .height(1500)
                        .fit('crop')
                        .url() || '';
                      return (
                        <img
                          src={src}
                          alt={featureImage?.alt || item.title}
                          className="w-full h-full object-cover object-center"
                        />
                      );
                    })()
                  ) : (
                    <div className="w-full h-full bg-gray-100" />
                  )}
                </div>
              </div>
            </div>
          </Link>
        ) : (
          <Link href={`/${item.slug.current}`} className="block group">
            <div className="w-full overflow-hidden rounded-lg mb-6">
              {featureImage?.asset ? (
                (() => {
                  const src = urlFor(featureImage as SanityImageSource)
                    ?.width(1600)
                    .height(900)
                    .fit('crop')
                    .url() || '';
                  return (
                    <img
                      src={src}
                      alt={featureImage?.alt || item.title}
                      className="w-full h-[300px] md:h-[400px] object-cover object-center transition-transform duration-300 ease-out group-hover:scale-[1.03] group-hover:opacity-95"
                    />
                  );
                })()
              ) : (
                <div className="w-full h-[300px] md:h-[400px] bg-gray-100" />
              )}
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold leading-tight group-hover:underline">
              {item.title}
            </h2>
            {item.heroLede || item.dek ? (
              <p className="mt-4 text-xl md:text-2xl text-gray-600 leading-snug max-w-3xl">
                {item.heroLede || item.dek}
              </p>
            ) : null}
          </Link>
        )}
      </section>
    );
  };

  return (
    <main className="bg-white text-black px-12 md:px-24 py-12 w-full">
      {/* Masthead */}
      <header className="sticky top-0 z-50 bg-white text-center px-6 py-6 border-b border-gray-200">
        <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight">Breaking Ground</h1>
        <p className="text-sm uppercase tracking-wide text-gray-500 mt-4">
          Construction • Industry • Power • Western PA
        </p>
      </header>

      {/* Hero */}
      {activeHero?.slug?.current ? renderFeatureBlock(activeHero) : null}

      {/* Announcement Bar */}
      <AnnouncementBar
        message={homepage?.announcementMessage}
        linkLabel={homepage?.announcementLinkLabel}
        linkUrl={homepage?.announcementLinkUrl}
      />

      {/* First Carousel */}
      <h3 className="font-serif text-[2rem] font-bold tracking-tight mb-6 pt-8 text-center">
        Latest News
      </h3>

      {firstCarouselStories.length === 0 ? (
        <p className="text-gray-500">No additional articles yet.</p>
      ) : (
        <MoreStoriesCarousel stories={firstCarouselStories} />
      )}

      {/* Secondary Feature */}
      {homepage?.secondaryFeature?.slug?.current ? renderFeatureBlock(homepage.secondaryFeature, true) : null}

      {/* Second Carousel */}
      {secondCarouselStories.length > 0 ? (
        <>
          <h3 className="font-serif text-[2rem] font-bold tracking-tight mb-6 pt-8 text-center">
            More Coverage
          </h3>
          <MoreStoriesCarousel stories={secondCarouselStories} />
        </>
      ) : null}
    </main>
  );
}
