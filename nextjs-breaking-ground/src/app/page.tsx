import Link from "next/link";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { client } from "@/sanity/client";
import Masthead from "@/components/Masthead";
import HomepageEventBanner from "@/components/homepage/HomepageEventBanner";
import HomepageHeroFeature from "@/components/homepage/HomepageHeroFeature";
import HomepageLatestNewsCard from "@/components/homepage/HomepageLatestNewsCard";
import HomepageSponsorsRow from "@/components/homepage/HomepageSponsorsRow";
import HomepageTabbedPanel, { type HomepageTabItem } from "@/components/homepage/HomepageTabbedPanel";

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

const MORE_STORIES_QUERY = `*[_type in ["article", "projectProfile"] && defined(slug.current)]
  | order(publishedAt desc)[0...7]{
    _id,
    _type,
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

const PROJECT_PROFILES_QUERY = `*[_type == "projectProfile" && defined(slug.current)]
  | order(publishedAt desc)[0...8]{
    _id,
    title,
    dek,
    slug,
    publishedAt,
    headerImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot}
  }`;

const BY_SERIES_QUERY = `*[_type == "article" && series->slug.current == $seriesSlug && defined(slug.current)]
  | order(publishedAt desc)[0...8]{
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
    series->{title, slug, seriesImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot}}
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
  const [featuredCandidate, fallbackLatest, list, homepage, profiles, issues, perspectives] =
    await Promise.all([
      client.fetch<any | null>(FEATURED_QUERY, {}, options),
      client.fetch<any | null>(FALLBACK_LATEST_QUERY, {}, options),
      client.fetch<any[]>(MORE_STORIES_QUERY, {}, options),
      client.fetch<{ heroArticle?: any } | null>(HOMEPAGE_QUERY, {}, options),
      client.fetch<any[]>(PROJECT_PROFILES_QUERY, {}, options),
      client.fetch<any[]>(BY_SERIES_QUERY, { seriesSlug: "construction-features" }, options),
      client.fetch<any[]>(BY_SERIES_QUERY, { seriesSlug: "construction-perspectives" }, options),
    ]);

  const featured = featuredCandidate || fallbackLatest;
  const activeHero = homepage?.heroArticle?.slug?.current ? homepage.heroArticle : featured;

  const safeDate = (value?: string) => {
    if (!value) return "";
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return "";
    return dt.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  const latestNews = (activeHero
    ? list.filter((item) => item?._id !== activeHero?._id)
    : list
  )
    .filter((item) => item?.slug?.current)
    .slice(0, 3)
    .map((item) => {
      const image = pickStoryImage(item);
      return {
        id: item._id,
        href: `/${item.slug.current}`,
        title: item.title,
        publishedAt: safeDate(item.publishedAt),
        imageSrc: getImageSrc(image, 600, 380),
        imageAlt: image?.alt || item.title,
      };
    });

  const tabItemsFrom = (items: any[], fallbackPrefix: string): HomepageTabItem[] => {
    const mapped = items
      .filter((item) => item?.slug?.current)
      .slice(0, 4)
      .map((item) => {
        const image = pickStoryImage(item);
        return {
          id: item._id,
          title: item.title || `${fallbackPrefix} title`,
          description: item.heroLede || item.dek || "Produced six times a year, Breaking Ground is the first comprehensive source ...",
          href: `/${item.slug.current}`,
          imageSrc: getImageSrc(image, 420, 300),
          imageAlt: image?.alt || item.title || `${fallbackPrefix} image`,
        };
      });

    if (mapped.length > 0) return mapped;

    return Array.from({ length: 4 }).map((_, i) => ({
      id: `${fallbackPrefix}-${i + 1}`,
      title: `${fallbackPrefix} title`,
      description: "Produced six times a year, Breaking Ground is the first comprehensive source ...",
      href: "/",
      imageSrc: null,
      imageAlt: `${fallbackPrefix} placeholder`,
    }));
  };

  const profileTabItems = tabItemsFrom(
    profiles.map((item) => ({
      ...item,
      heroLede: item.dek,
      homepageImage: item.headerImage,
      headerImage: item.headerImage,
    })),
    "Profile",
  );
  const issueTabItems = tabItemsFrom(issues, "Issue");
  const perspectiveTabItems = tabItemsFrom(perspectives, "Perspective");

  const featureImage = pickStoryImage(activeHero);
  const heroHref = activeHero?.slug?.current ? `/${activeHero.slug.current}` : "/";
  const adArticle = profiles[0];

  return (
    <main className="bg-white text-black px-4 md:px-8 lg:px-[26px] py-10 w-full">
      <Masthead />

      {activeHero?.slug?.current ? (
        <HomepageHeroFeature
          href={heroHref}
          title={activeHero.title}
          lede={activeHero.heroLede || activeHero.dek}
          category={activeHero.category || "Article tag"}
          publishedAt={safeDate(activeHero.publishedAt)}
          imageSrc={getImageSrc(featureImage, 1400, 850)}
          imageAlt={featureImage?.alt || activeHero.title}
        />
      ) : null}

      <section className="mt-7 grid grid-cols-1 xl:grid-cols-[1fr_566px] gap-10 items-start">
        <div>
          <h2 className="flex items-center gap-2 font-serif text-4xl font-bold text-[#312e28]">
            <span className="inline-block size-2 rounded-full bg-[#ff611d]" />
            Latest news
          </h2>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
            {latestNews.map((item) => (
              <HomepageLatestNewsCard
                key={item.id}
                href={item.href}
                title={item.title}
                publishedAt={item.publishedAt}
                imageSrc={item.imageSrc}
                imageAlt={item.imageAlt}
              />
            ))}
          </div>

          <div className="mt-10 border-t border-[#d8d2cb] pt-8">
            <article className="grid grid-cols-[160px_1fr] gap-7 items-start">
              <div className="size-[150px] rounded-full bg-[#ebe7df] flex items-center justify-center text-[#8f8778] font-bold text-sm">
                Partner
              </div>
              <div>
                <h3 className="font-serif text-[42px] leading-[1.08] font-bold text-[#312e28]">
                  {adArticle?.title || "The IBEW Union Hall"}
                </h3>
                <p className="mt-2 font-serif text-[18px] leading-relaxed text-[#4a4640]">
                  {adArticle?.dek ||
                    "For more than a century, this sponsored section highlights skilled workforce partnerships and regional project momentum."}
                </p>
                <Link
                  href={adArticle?.slug?.current ? `/${adArticle.slug.current}` : "/"}
                  className="mt-3 inline-flex text-[#d45422] font-semibold underline underline-offset-2"
                >
                  Call to action link
                </Link>
              </div>
            </article>
          </div>
        </div>

        <HomepageTabbedPanel
          profiles={profileTabItems}
          issues={issueTabItems}
          perspectives={perspectiveTabItems}
        />
      </section>

      <HomepageEventBanner
        title="Come Join Us At the 2025 Evening of Excellence"
        subtitle="Event starts 8:00 pm on 04/13/2026"
        body="Join us for an unforgettable evening of celebration, inspiration, and impact."
        ctaLabel="Register here"
        ctaHref="/contact"
      />

      <HomepageSponsorsRow
        sponsors={[
          "IBEW",
          "Turner",
          "JR",
          "HCE",
          "Thoroughbred",
          "Trumbull",
        ]}
      />
    </main>
  );
}
