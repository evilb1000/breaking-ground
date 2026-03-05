import Link from "next/link";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { client } from "@/sanity/client";
import MoreStoriesCarousel from "@/components/MoreStoriesCarousel";
import AnnouncementBar from "@/components/AnnouncementBar";
import Masthead from "@/components/Masthead";

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
    author->{name, image},
    series->{title, slug, seriesImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot}}
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
    author->{name, image},
    series->{title, slug, seriesImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot}}
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
    author->{name, image},
    series->{title, slug, seriesImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot}}
  }`;

const HOMEPAGE_QUERY = `*[_type == "homepage"][0]{
  announcementMessage,
  announcementLinkLabel,
  announcementLinkUrl,
  heroArticle->{
    _id, title, dek, heroLede, slug, publishedAt, category,
    headerImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot},
    heroImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot},
    author->{name, image},
    series->{title, slug, seriesImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot}}
  },
  gridOne[]->{
    _id, title, dek, slug, publishedAt, category,
    headerImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot},
    heroImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot},
    author->{name, image},
    series->{title, slug, seriesImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot}}
  },
  gridTwo[]->{
    _id, title, dek, slug, publishedAt, category,
    headerImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot},
    heroImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot},
    author->{name, image},
    series->{title, slug, seriesImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot}}
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
    author->{name, image},
    series->{title, slug, seriesImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot}}
  }
}`;

const urlFor = (source: SanityImageSource) =>
  imageUrlBuilder({ projectId: client.config().projectId!, dataset: client.config().dataset! })
    .image(source);

const hasImageAsset = (image: any) => Boolean(image?.asset?._ref || image?.asset?.url);
const pickStoryImage = (item: any) =>
  hasImageAsset(item?.headerImage)
    ? item.headerImage
    : hasImageAsset(item?.heroImage)
    ? item.heroImage
    : hasImageAsset(item?.series?.seriesImage)
    ? item.series.seriesImage
    : null;
const getImageSrc = (image: any, width: number, height: number) =>
  (image
    ? urlFor(image as SanityImageSource)?.width(width).height(height).fit('crop').url() || image?.asset?.url || ''
    : '');

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
        const cardImage = pickStoryImage(article);
        return {
          _id: article._id,
          slug: article.slug,
          title: article.title,
          dek: article.dek,
          category: article.category,
          authorName: article.author?.name,
          imageAlt: cardImage?.alt || article.title,
          imageSrc: getImageSrc(cardImage, 800, 600),
        };
      });

  const firstCarouselStories = toCarouselStories(firstCarouselSource);
  const secondCarouselStories = toCarouselStories(secondCarouselSource);

  const renderFeatureBlock = (item: any, placement: "default" | "hero" | "secondary" = "default") => {
    const featureImage = pickStoryImage(item);
    const isHeroPlacement = placement === "hero";
    const isSecondaryPlacement = placement === "secondary";
    const usePlacementLayout = isHeroPlacement || isSecondaryPlacement;
    return (
      <section className={`${usePlacementLayout ? "mt-2" : item.category === "feature" ? "mt-2" : "mt-12"} mb-16`}>
        {usePlacementLayout ? (
          <Link href={`/${item.slug.current}`} className="block group">
            <div className="w-full">
              <div className={`${isSecondaryPlacement ? "rounded-lg overflow-hidden" : ""}`}>
                <div className={`grid grid-cols-1 md:grid-cols-2 ${isSecondaryPlacement ? "gap-0" : "gap-8 md:gap-12"}`}>
                <div className={`${isSecondaryPlacement ? "order-2 md:order-2 h-[50vh] md:h-[70vh]" : "order-2 md:order-1"} flex items-center justify-center`}>
                  <div className={`${isSecondaryPlacement ? "w-full h-full bg-black text-white p-8 md:p-10 flex flex-col items-center text-center justify-center" : "max-w-3xl w-full flex flex-col items-center text-center"}`}>
                    <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold leading-tight group-hover:underline">
                      {item.title}
                    </h2>
                    {item.heroLede || item.dek ? (
                      <p className={`mt-4 text-xl md:text-3xl lg:text-4xl leading-snug ${isSecondaryPlacement ? "text-white/85" : "text-gray-600"}`}>
                        {item.heroLede || item.dek}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className={`${isSecondaryPlacement ? "order-1 md:order-1" : "order-1 md:order-2"} h-[50vh] md:h-[70vh] w-full overflow-hidden ${isSecondaryPlacement ? "" : "rounded-lg"}`}>
                  {featureImage?.asset ? (
                    (() => {
                      const src = getImageSrc(featureImage, 1200, 1500);
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
            </div>
          </Link>
        ) : (
          <Link href={`/${item.slug.current}`} className="block group">
            <div className="w-full overflow-hidden rounded-lg mb-6">
              {featureImage?.asset ? (
                (() => {
                  const src = getImageSrc(featureImage, 1600, 900);
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
    <main className="bg-white text-black px-4 md:px-12 lg:px-24 py-12 w-full">
      {/* Masthead */}
      <Masthead />

      {/* Hero */}
      {activeHero?.slug?.current ? renderFeatureBlock(activeHero, "hero") : null}

      {/* Announcement Bar */}
      <div id="announcement-fold-trigger">
        <AnnouncementBar
          message={homepage?.announcementMessage}
          linkLabel={homepage?.announcementLinkLabel}
          linkUrl={homepage?.announcementLinkUrl}
        />
      </div>

      {/* First Carousel */}
      <h3 className="font-serif text-2xl md:text-[2rem] font-bold tracking-tight mb-6 pt-8 text-center">
        Latest News
      </h3>

      {firstCarouselStories.length === 0 ? (
        <p className="text-gray-500">No additional articles yet.</p>
      ) : (
        <MoreStoriesCarousel stories={firstCarouselStories} />
      )}

      {/* Secondary Feature */}
      {homepage?.secondaryFeature?.slug?.current ? renderFeatureBlock(homepage.secondaryFeature, "secondary") : null}

      {/* Second Carousel */}
      {secondCarouselStories.length > 0 ? (
        <>
          <h3 className="font-serif text-2xl md:text-[2rem] font-bold tracking-tight mb-6 pt-8 text-center">
            More Coverage
          </h3>
          <MoreStoriesCarousel stories={secondCarouselStories} />
        </>
      ) : null}
    </main>
  );
}
