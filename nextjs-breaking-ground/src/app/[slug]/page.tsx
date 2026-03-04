import { PortableText } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { client } from "@/sanity/client";
import ChartFromRefClient from "@/components/ChartFromRefClient";
import MapEmbedClient from "@/components/MapEmbedClient";
import Link from "next/link";

const ENTRY_QUERY = `*[_type == "article" && slug.current == $slug][0]{
  _type,
  title,
  dek,
  publishedAt,
  headerImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot},
  heroImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot},
  author->{name, image},
  series->{title, slug, seriesImage{asset->{url,_ref,_type}, alt, caption, crop, hotspot}},
  category,
  body[]{
    ...,
    // ensure map/file URLs are present for mapEmbed blocks
    mapFile{asset->{url}},
    dataFile{asset->{url}}
  },
  readingTime,
  featured
}`;

const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

export const revalidate = 0;
const options = { next: { revalidate: 0 } };

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
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

  // Hero image fallback order: article header image -> legacy hero image -> series default image.
  const resolvedHeroImage = article?.headerImage?.asset?._ref || article?.headerImage?.asset?.url
    ? article.headerImage
    : article?.heroImage?.asset?._ref || article?.heroImage?.asset?.url
    ? article.heroImage
    : article?.series?.seriesImage?.asset?._ref || article?.series?.seriesImage?.asset?.url
    ? article.series.seriesImage
    : null;
  const heroImageSource = resolvedHeroImage?.asset?._ref
    ? (resolvedHeroImage as SanityImageSource)
    : null;
  const heroImageUrl = heroImageSource
    ? urlFor(heroImageSource)?.width(1100).height(620).url()
    : resolvedHeroImage?.asset?.url ?? null;

  const authorImageUrl = article?.author?.image
    ? urlFor(article.author.image as SanityImageSource)?.width(64).height(64).url()
    : null;

  // PortableText custom renderers for inline/floating images
  const components = {
    types: {
      inlineChart: ({value}: {value: any}) => {
        const refId = value?._ref || value?._id
        if (!refId) return null
        return <ChartFromRefClient id={refId} />
      },
      chartFigure: ({value}: {value: any}) => {
        const refId = value?.chart?._ref || value?.chart?._id
        const align = (value?.alignment || 'center') as 'left'|'right'|'center'
        const size = (value?.size || 'full') as 'small'|'medium'|'large'|'full'
        if (!refId) return null
        return (
          <figure>
            <ChartFromRefClient id={refId} align={align} size={size} />
            {value?.caption ? (
              <figcaption className="text-center text-sm text-gray-500 mt-2">{value.caption}</figcaption>
            ) : null}
          </figure>
        )
      },
      inlineImage: ({value}: {value: any}) => {
        // Ensure we have an image asset ref before building a URL
        const hasAsset = value?.asset?._ref || value?.asset?.url
        const src = hasAsset
          ? (value?.asset?.url || urlFor(value as SanityImageSource)?.width(1200).url())
          : null
        if (!src) return null
        const sizeMap = {
          small: 'max-w-[25%]',
          medium: 'max-w-[50%]',
          large: 'max-w-[75%]',
          full: 'max-w-full',
        } as const
        const sizeKey = (value?.size ?? 'full') as keyof typeof sizeMap
        const sizeClass = sizeMap[sizeKey]

        const align = (value?.alignment || value?.align) as 'left' | 'right' | 'center' | undefined
        const alignClass =
          align === 'left'
            ? 'float-left mr-8 mb-6'
            : align === 'right'
            ? 'float-right ml-8 mb-6'
            : 'mx-auto my-8 block'

        return (
          <figure className={`rounded-md ${alignClass} ${sizeClass}`}>
            <img src={src} alt={value?.alt || ''} className="rounded-md w-full h-auto" />
            {value?.caption ? (
              <figcaption className="text-center text-sm text-gray-500 mt-2">{value.caption}</figcaption>
            ) : null}
          </figure>
        )
      },
      figure: ({value}: {value: any}) => {
        const hasAsset = value?.image?.asset?._ref || value?.image?.asset?.url
        const imgSrc = hasAsset
          ? (value?.image?.asset?.url || urlFor(value.image as SanityImageSource)?.width(1200).url())
          : null
        if (!imgSrc) return null
        // Prefer new 'alignment' field, fallback to legacy 'align'
        const align = (value?.alignment || value?.align) as 'left' | 'right' | 'center' | undefined
        const alignClass =
          align === 'left'
            ? 'float-left mr-8 mb-6'
            : align === 'right'
            ? 'float-right ml-8 mb-6'
            : 'mx-auto my-8 block'

        const sizeMap = {
          small: 'max-w-[25%]',
          medium: 'max-w-[50%]',
          large: 'max-w-[75%]',
          full: 'max-w-full',
        } as const
        const sizeKey = (value?.size ?? 'full') as keyof typeof sizeMap
        const sizeClass = sizeMap[sizeKey]
        return (
          <figure className={`rounded-md ${alignClass} ${sizeClass}`}>
            <img src={imgSrc} alt={value?.alt || ''} className="rounded-md w-full h-auto" />
            {value?.caption ? (
              <figcaption className="text-center text-sm text-gray-500 mt-2">{value.caption}</figcaption>
            ) : null}
          </figure>
        )
      },
      mapEmbed: ({value}: {value: any}) => {
        const dataUrl = value?.dataFile?.asset?.url
        if (!dataUrl) return null
        return (
          <div className="my-6">
            <MapEmbedClient
              dataUrl={dataUrl}
              valueProperty={value?.valueProperty}
              valueProperties={value?.valueProperties}
              heightScale={value?.heightScale ?? 1}
              columnRadius={value?.columnRadius ?? 80}
              columnSpacing={value?.columnSpacing ?? 90}
              colors={value?.colors}
            />
            {value?.caption ? (
              <p className="text-center text-sm text-gray-500 mt-2">{value.caption}</p>
            ) : null}
          </div>
        )
      },
    },
  }

  return (
    <main className="min-h-screen w-full px-6 md:px-12 pt-0 pb-8 flex flex-col gap-6 bg-white text-black items-start text-left">
      {heroImageUrl && (
        <div style={{marginLeft: 'calc(50% - 50vw)', width: '100vw', position: 'relative'}}>
          <Link href="/" className="absolute top-4 left-4 z-10 bg-white/90 px-3 py-1.5 rounded hover:bg-white text-sm hover:underline">
            Home
          </Link>
          <img
            src={heroImageUrl}
            alt={resolvedHeroImage?.alt || article.title}
            style={{width: '100%', height: '60vh', objectFit: 'cover'}}
          />
          {resolvedHeroImage?.caption && (
            <p className="text-sm text-gray-500 mt-2 px-4 max-w-3xl mx-auto">{resolvedHeroImage.caption}</p>
          )}
        </div>
      )}
      {!heroImageUrl && (
        <Link href="/" className="hover:underline">
          ← Back to posts
        </Link>
      )}
      <div className="max-w-3xl ml-[10vw] mr-auto w-full">
        <h1 className="text-8xl font-bold font-serif mt-6 text-left">{article.title}</h1>
      {article.dek ? (
        <p className="italic text-gray-700 leading-relaxed mt-2 mb-2 font-serif text-left">
          {article.dek}
        </p>
      ) : null}

      {(article?.author?.name || authorImageUrl) && (
        <div className="flex items-center gap-3 mt-6 text-left">
          {authorImageUrl && (
            <img
              src={authorImageUrl}
              alt={article?.author?.name || 'Author'}
              className="h-10 w-10 rounded-full object-cover"
              width="40"
              height="40"
            />
          )}
          {article?.author?.name && <span className="text-sm text-gray-700">By {article.author.name}</span>}
        </div>
      )}
      <p className="text-gray-600 text-left">{new Date(article.publishedAt).toLocaleDateString()}</p>

      <div className="prose prose-lg md:prose-xl leading-relaxed max-w-prose prose-headings:mt-8 prose-headings:mb-4 prose-p:my-6 md:prose-p:my-7 prose-ul:my-5 prose-ol:my-5 prose-li:my-2 prose-img:my-8 prose-figure:my-10 text-left">
        {Array.isArray(article.body) && (
          <PortableText value={article.body} components={components} />
        )}
      </div>
      </div>
    </main>
  );
}

