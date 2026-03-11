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
  homepageImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot},
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
  homepageImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot},
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
  homepageImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot},
    author->{name, image},
    series->{title, slug, seriesImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot}}
  }`;

const HOMEPAGE_QUERY = `*[_type == "homepage"][0]{
  announcementMessage,
  announcementLinkLabel,
  announcementLinkUrl,
  heroLayout,
  heroTextPosition,
  heroTextWidth,
  heroHeadlineSize,
  heroBodySize,
  heroTextColor,
  heroSplitBgColor,
  heroSplitGradient,
  heroSplitGradientDirection,
  heroSplitGradientFrom,
  heroSplitGradientTo,
  secondaryLayout,
  secondaryTextPosition,
  secondaryTextWidth,
  secondaryHeadlineSize,
  secondaryBodySize,
  secondaryTextColor,
  secondarySplitBgColor,
  secondarySplitGradient,
  secondarySplitGradientDirection,
  secondarySplitGradientFrom,
  secondarySplitGradientTo,
  tertiaryLayout,
  tertiaryTextPosition,
  tertiaryTextWidth,
  tertiaryHeadlineSize,
  tertiaryBodySize,
  tertiaryTextColor,
  tertiarySplitBgColor,
  tertiarySplitGradient,
  tertiarySplitGradientDirection,
  tertiarySplitGradientFrom,
  tertiarySplitGradientTo,
  heroArticle->{
    _id, title, dek, heroLede, slug, publishedAt, category,
    headerImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot},
    heroImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot},
    homepageImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot},
    author->{name, image},
    series->{title, slug, seriesImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot}}
  },
  gridOne[]->{
    _id, title, dek, slug, publishedAt, category,
    headerImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot},
    heroImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot},
    homepageImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot},
    author->{name, image},
    series->{title, slug, seriesImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot}}
  },
  gridTwo[]->{
    _id, title, dek, slug, publishedAt, category,
    headerImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot},
    heroImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot},
    homepageImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot},
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
    homepageImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot},
    author->{name, image},
    series->{title, slug, seriesImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot}}
  },
  tertiaryFeature->{
    _id,
    title,
    dek,
    heroLede,
    slug,
    publishedAt,
    category,
    headerImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot},
    heroImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot},
    homepageImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot},
    author->{name, image},
    series->{title, slug, seriesImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot}}
  },
  gridThree[]->{
    _id, title, dek, slug, publishedAt, category,
    headerImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot},
    heroImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot},
    homepageImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot},
    author->{name, image},
    series->{title, slug, seriesImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot}}
  }
}`;

const urlFor = (source: SanityImageSource) =>
  imageUrlBuilder({ projectId: client.config().projectId!, dataset: client.config().dataset! })
    .image(source);

const hasImageAsset = (image: any) => Boolean(image?.asset?._ref || image?.asset?.url);
const pickStoryImage = (item: any) =>
  hasImageAsset(item?.homepageImage)
    ? item.homepageImage
    : hasImageAsset(item?.headerImage)
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
    heroLayout?: string;
    heroTextPosition?: string;
    heroTextWidth?: string;
    heroHeadlineSize?: string;
    heroBodySize?: string;
    heroTextColor?: { hex?: string };
    heroSplitBgColor?: { hex?: string };
    heroSplitGradient?: boolean;
    heroSplitGradientDirection?: string;
    heroSplitGradientFrom?: { hex?: string };
    heroSplitGradientTo?: { hex?: string };
    secondaryLayout?: string;
    secondaryTextPosition?: string;
    secondaryTextWidth?: string;
    secondaryHeadlineSize?: string;
    secondaryBodySize?: string;
    secondaryTextColor?: { hex?: string };
    secondarySplitBgColor?: { hex?: string };
    secondarySplitGradient?: boolean;
    secondarySplitGradientDirection?: string;
    secondarySplitGradientFrom?: { hex?: string };
    secondarySplitGradientTo?: { hex?: string };
    tertiaryLayout?: string;
    tertiaryTextPosition?: string;
    tertiaryTextWidth?: string;
    tertiaryHeadlineSize?: string;
    tertiaryBodySize?: string;
    tertiaryTextColor?: { hex?: string };
    tertiarySplitBgColor?: { hex?: string };
    tertiarySplitGradient?: boolean;
    tertiarySplitGradientDirection?: string;
    tertiarySplitGradientFrom?: { hex?: string };
    tertiarySplitGradientTo?: { hex?: string };
    heroArticle?: any;
    gridOne?: any[];
    gridTwo?: any[];
    gridThree?: any[];
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
    tertiaryFeature?: {
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
  const thirdCarouselSource = homepage?.gridThree?.length ? homepage.gridThree : [];

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
  const thirdCarouselStories = toCarouselStories(thirdCarouselSource);

  const renderFeatureBlock = (
    item: any,
    layout: "split-white" | "split-dark" | "full-bleed" = "split-white",
    textPosition: string = "bottom-left",
    textWidth: string = "medium",
    headlineSize: string = "medium",
    bodySize: string = "medium",
    textColor?: string,
    splitBgColor?: string,
    splitGradient?: boolean,
    splitGradientDirection?: string,
    splitGradientFrom?: string,
    splitGradientTo?: string,
  ) => {
    const featureImage = pickStoryImage(item);
    const isDark = layout === "split-dark";
    const isFullBleed = layout === "full-bleed";

    if (isFullBleed) {
      const src = featureImage?.asset ? getImageSrc(featureImage, 1920, 1080) : "";

      const positionClasses: Record<string, string> = {
        "bottom-left": "absolute bottom-0 left-0 p-6 md:p-12 text-left",
        "bottom-center": "absolute bottom-0 inset-x-0 p-6 md:p-12 text-center flex flex-col items-center",
        "bottom-right": "absolute bottom-0 right-0 p-6 md:p-12 text-right",
        "center": "absolute inset-0 flex flex-col items-center justify-center p-6 md:p-12 text-center",
        "top-left": "absolute top-0 left-0 p-6 md:p-12 text-left",
        "top-center": "absolute top-0 inset-x-0 p-6 md:p-12 text-center flex flex-col items-center",
      };

      const widthClasses: Record<string, string> = {
        narrow: "max-w-[600px]",
        medium: "max-w-[800px]",
        wide: "max-w-[1000px]",
        full: "max-w-full",
      };

      const gradientClasses: Record<string, string> = {
        "bottom-left": "bg-gradient-to-t from-black/80 via-black/30 to-transparent",
        "bottom-center": "bg-gradient-to-t from-black/80 via-black/30 to-transparent",
        "bottom-right": "bg-gradient-to-t from-black/80 via-black/30 to-transparent",
        "center": "bg-black/40",
        "top-left": "bg-gradient-to-b from-black/80 via-black/30 to-transparent",
        "top-center": "bg-gradient-to-b from-black/80 via-black/30 to-transparent",
      };

      const headlineSizeClasses: Record<string, string> = {
        small: "text-2xl md:text-4xl lg:text-5xl",
        medium: "text-3xl md:text-5xl lg:text-6xl",
        large: "text-4xl md:text-6xl lg:text-7xl",
        xl: "text-5xl md:text-7xl lg:text-8xl",
      };

      const bodySizeClasses: Record<string, string> = {
        small: "text-base md:text-lg",
        medium: "text-xl md:text-2xl",
        large: "text-2xl md:text-3xl",
      };

      const posClass = positionClasses[textPosition] || positionClasses["bottom-left"];
      const widthClass = widthClasses[textWidth] || widthClasses["medium"];
      const gradientClass = gradientClasses[textPosition] || gradientClasses["bottom-left"];
      const headlineClass = headlineSizeClasses[headlineSize] || headlineSizeClasses["medium"];
      const bodyClass = bodySizeClasses[bodySize] || bodySizeClasses["medium"];

      return (
        <section className="mt-2 mb-16">
          <Link href={`/${item.slug.current}`} className="block group relative rounded-lg overflow-hidden">
            <div className="w-full h-[50vh] md:h-[80vh]">
              {src ? (
                <img
                  src={src}
                  alt={featureImage?.alt || item.title}
                  className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                />
              ) : (
                <div className="w-full h-full bg-gray-100" />
              )}
            </div>
            <div className={`absolute inset-0 ${gradientClass}`} />
            <div className={posClass} style={textColor ? { color: textColor } : undefined}>
              <div className={widthClass}>
                <h2 className={`font-serif ${headlineClass} font-bold leading-tight ${textColor ? "" : "text-white"} group-hover:underline`}>
                  {item.title}
                </h2>
                {item.heroLede || item.dek ? (
                  <p className={`mt-4 ${bodyClass} leading-snug ${textColor ? "opacity-85" : "text-white/85"}`}>
                    {item.heroLede || item.dek}
                  </p>
                ) : null}
              </div>
            </div>
          </Link>
        </section>
      );
    }

    const headlineSizeClassesSplit: Record<string, string> = {
      small: "text-2xl md:text-4xl lg:text-5xl",
      medium: "text-3xl md:text-5xl lg:text-6xl",
      large: "text-4xl md:text-6xl lg:text-7xl",
      xl: "text-5xl md:text-7xl lg:text-8xl",
    };
    const bodySizeClassesSplit: Record<string, string> = {
      small: "text-lg md:text-xl lg:text-2xl",
      medium: "text-xl md:text-3xl lg:text-4xl",
      large: "text-2xl md:text-4xl lg:text-5xl",
    };
    const splitHeadlineClass = headlineSizeClassesSplit[headlineSize] || headlineSizeClassesSplit.medium;
    const splitBodyClass = bodySizeClassesSplit[bodySize] || bodySizeClassesSplit.medium;

    const defaultBg = isDark ? "#000000" : "#ffffff";
    const defaultText = isDark ? "#ffffff" : "#000000";
    const bgColor = splitBgColor || defaultBg;
    const fontColor = textColor || defaultText;

    let bgStyle: React.CSSProperties;
    if (splitGradient && splitGradientFrom && splitGradientTo) {
      const dir = splitGradientDirection || "to bottom";
      bgStyle = { background: `linear-gradient(${dir}, ${splitGradientFrom}, ${splitGradientTo})` };
    } else {
      bgStyle = { backgroundColor: bgColor };
    }

    return (
      <section className="mt-2 mb-16">
        <Link href={`/${item.slug.current}`} className="block group">
          <div className="w-full">
            <div className={`${isDark ? "rounded-lg overflow-hidden" : ""}`}>
              <div className={`grid grid-cols-1 md:grid-cols-2 ${isDark ? "gap-0" : "gap-8 md:gap-12"}`}>
                <div className={`${isDark ? "order-2 md:order-2 h-[50vh] md:h-[70vh]" : "order-2 md:order-1"} flex items-center justify-center`}>
                  <div
                    className={`${isDark ? "w-full h-full p-8 md:p-10 flex flex-col items-center text-center justify-center" : "max-w-3xl w-full flex flex-col items-center text-center"}`}
                    style={{ ...bgStyle, color: fontColor }}
                  >
                    <h2 className={`font-serif ${splitHeadlineClass} font-bold leading-tight group-hover:underline`}>
                      {item.title}
                    </h2>
                    {item.heroLede || item.dek ? (
                      <p className={`mt-4 ${splitBodyClass} leading-snug`} style={{ opacity: 0.85 }}>
                        {item.heroLede || item.dek}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className={`${isDark ? "order-1 md:order-1" : "order-1 md:order-2"} h-[50vh] md:h-[70vh] w-full overflow-hidden ${isDark ? "" : "rounded-lg"}`}>
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
      </section>
    );
  };

  return (
    <main className="bg-white text-black px-4 md:px-12 lg:px-24 py-12 w-full">
      {/* Masthead */}
      <Masthead />

      {/* Hero */}
      {activeHero?.slug?.current ? renderFeatureBlock(activeHero, (homepage?.heroLayout as any) || "split-white", homepage?.heroTextPosition || "bottom-left", homepage?.heroTextWidth || "medium", homepage?.heroHeadlineSize || "medium", homepage?.heroBodySize || "medium", homepage?.heroTextColor?.hex, homepage?.heroSplitBgColor?.hex, homepage?.heroSplitGradient, homepage?.heroSplitGradientDirection, homepage?.heroSplitGradientFrom?.hex, homepage?.heroSplitGradientTo?.hex) : null}

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

      {/* Sponsorship / whitespace gap */}
      <div className="my-16 md:my-24" />

      {/* Secondary Feature */}
      {homepage?.secondaryFeature?.slug?.current ? renderFeatureBlock(homepage.secondaryFeature, (homepage?.secondaryLayout as any) || "split-dark", homepage?.secondaryTextPosition || "bottom-left", homepage?.secondaryTextWidth || "medium", homepage?.secondaryHeadlineSize || "medium", homepage?.secondaryBodySize || "medium", homepage?.secondaryTextColor?.hex, homepage?.secondarySplitBgColor?.hex, homepage?.secondarySplitGradient, homepage?.secondarySplitGradientDirection, homepage?.secondarySplitGradientFrom?.hex, homepage?.secondarySplitGradientTo?.hex) : null}

      {/* Second Carousel */}
      {secondCarouselStories.length > 0 ? (
        <>
          <h3 className="font-serif text-2xl md:text-[2rem] font-bold tracking-tight mb-6 pt-8 text-center">
            More Coverage
          </h3>
          <MoreStoriesCarousel stories={secondCarouselStories} />
        </>
      ) : null}

      {/* Sponsorship / whitespace gap */}
      <div className="my-16 md:my-24" />

      {/* Tertiary Feature */}
      {homepage?.tertiaryFeature?.slug?.current ? renderFeatureBlock(homepage.tertiaryFeature, (homepage?.tertiaryLayout as any) || "split-white", homepage?.tertiaryTextPosition || "bottom-left", homepage?.tertiaryTextWidth || "medium", homepage?.tertiaryHeadlineSize || "medium", homepage?.tertiaryBodySize || "medium", homepage?.tertiaryTextColor?.hex, homepage?.tertiarySplitBgColor?.hex, homepage?.tertiarySplitGradient, homepage?.tertiarySplitGradientDirection, homepage?.tertiarySplitGradientFrom?.hex, homepage?.tertiarySplitGradientTo?.hex) : null}

      {/* Third Carousel */}
      {thirdCarouselStories.length > 0 ? (
        <>
          <h3 className="font-serif text-2xl md:text-[2rem] font-bold tracking-tight mb-6 pt-8 text-center">
            Even More
          </h3>
          <MoreStoriesCarousel stories={thirdCarouselStories} />
        </>
      ) : null}
    </main>
  );
}
