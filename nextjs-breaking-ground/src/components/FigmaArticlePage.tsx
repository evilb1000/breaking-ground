import { PortableText } from "next-sanity";
import Link from "next/link";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { client } from "@/sanity/client";
import ChartFromRefClient from "@/components/ChartFromRefClient";
import HomepageTopRibbon from "@/components/homepage/HomepageTopRibbon";
import HomepageEventBanner from "@/components/homepage/HomepageEventBanner";

/* ------------------------------------------------------------------ */
/*  Image URL builder                                                  */
/* ------------------------------------------------------------------ */

const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type SanityImage = {
  asset?: { _ref?: string; url?: string };
  assetUrl?: string;
  alt?: string;
  caption?: string;
  hotspot?: { x: number; y: number };
};

export type RelatedRef = {
  _id: string;
  _type: string;
  slug?: string;
  title?: string;
  headline?: string;
  section?: string;
  category?: string;
  publishedAt?: string;
  headerImage?: SanityImage;
  introImage?: SanityImage;
};

export type NextRef = {
  _id?: string;
  _type?: string;
  slug?: string;
  title?: string;
  headline?: string;
  section?: string;
  category?: string;
};

export type FigmaArticleDoc = {
  _id?: string;
  _type: "figmaArticle";
  slug?: { current: string } | string;
  headline?: string;
  title?: string;
  dek?: string;
  publishedAt?: string;
  readingTime?: number;
  section?: string;
  articleTag?: string;
  introImage?: SanityImage;
  heroImage?: SanityImage;
  headerImage?: SanityImage;
  author?: { name?: string; image?: SanityImage; bio?: string };
  authorBio?: string;
  body?: Array<Record<string, unknown>>;
  relatedArticles?: RelatedRef[];
  nextArticle?: NextRef;
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

export function sectionLabel(section?: string): string {
  if (!section) return "Section";
  const map: Record<string, string> = {
    features: "Features",
    "project-profiles": "Project Profiles",
    "member-profiles": "Member Profiles",
    news: "News",
    perspectives: "Perspectives",
    opinion: "Opinion",
  };
  return map[section] || section;
}

export function sectionHref(section?: string): string {
  return section ? `/sections/${section}` : "/";
}

export function formatMetaDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d
    .toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();
}

export function relatedSlug(ref: RelatedRef | NextRef): string {
  return ref.slug ? `/${ref.slug}` : "/";
}

export function relatedTitle(ref: RelatedRef | NextRef): string {
  return ref.headline || ref.title || "Untitled";
}

export function imageSrc(img?: SanityImage, width = 1200): string | null {
  if (!img) return null;
  if (img.asset?._ref) {
    const built = urlFor(img as SanityImageSource)?.width(width).url();
    if (built) return built;
  }
  return img.asset?.url || img.assetUrl || null;
}

export function hotspotPosition(img?: SanityImage): string {
  const h = img?.hotspot;
  if (!h) return "50% 50%";
  return `${(h.x * 100).toFixed(1)}% ${(h.y * 100).toFixed(1)}%`;
}

/* ------------------------------------------------------------------ */
/*  PortableText serializers                                           */
/* ------------------------------------------------------------------ */

const sizeClassMap = {
  small: "max-w-[25%]",
  medium: "max-w-[50%]",
  large: "max-w-[75%]",
  full: "max-w-full",
} as const;

const alignClassMap = {
  left: "float-left mr-6 mb-4",
  right: "float-right ml-6 mb-4",
  center: "mx-auto my-6 block",
} as const;

export const articleComponents = {
  block: {
    h2: ({ children }: { children?: React.ReactNode }) => (
      <h2 className="bg-type-h2 mt-10 mb-4 text-[color:var(--bg-on-surface)]">{children}</h2>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3 className="bg-type-h3 mt-6 mb-2 text-[color:var(--bg-on-surface)]">{children}</h3>
    ),
    h4: ({ children }: { children?: React.ReactNode }) => (
      <h4 className="bg-type-article-h4 mt-4 mb-2 text-[color:var(--bg-on-surface)]">{children}</h4>
    ),
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <blockquote className="bg-article-pullquote">{children}</blockquote>
    ),
    normal: ({ children }: { children?: React.ReactNode }) => (
      <p className="bg-type-body text-[color:var(--bg-on-surface)]">{children}</p>
    ),
  },
  marks: {
    link: ({ value, children }: { value?: { href?: string; openInNewTab?: boolean }; children?: React.ReactNode }) => {
      const href = value?.href || "#";
      const newTab = value?.openInNewTab;
      return (
        <a
          href={href}
          target={newTab ? "_blank" : undefined}
          rel={newTab ? "noopener noreferrer" : undefined}
        >
          {children}
        </a>
      );
    },
  },
  types: {
    adSlot: ({
      value,
    }: {
      value?: {
        image?: SanityImage;
        linkUrl?: string;
        alt?: string;
      };
    }) => {
      const src = value?.image ? imageSrc(value.image, 1400) : null;
      const inner = src ? (
        <img
          src={src}
          alt={value?.alt || ""}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[#d9d9d9]">
          <h2 className="bg-type-h1 text-[#adadad]">Ad space</h2>
        </div>
      );
      const box = (
        <div className="mx-auto h-[361px] w-full max-w-[686px] overflow-hidden">
          {inner}
        </div>
      );
      return (
        <div className="my-8">
          {value?.linkUrl ? (
            <a
              href={value.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              {box}
            </a>
          ) : (
            box
          )}
        </div>
      );
    },
    pullQuote: ({ value }: { value?: { quote?: string; attribution?: string } }) => {
      if (!value?.quote) return null;
      return (
        <figure className="bg-article-pullquote">
          {value.quote}
          {value.attribution ? (
            <cite className="bg-article-pullquote-attribution">{value.attribution}</cite>
          ) : null}
        </figure>
      );
    },
    inlineChart: ({ value }: { value?: { _ref?: string; _id?: string } }) => {
      const refId = value?._ref || value?._id;
      if (!refId) return null;
      return (
        <div className="my-8">
          <ChartFromRefClient id={refId} />
        </div>
      );
    },
    chartFigure: ({
      value,
    }: {
      value?: {
        chart?: { _ref?: string; _id?: string };
        caption?: string;
        alignment?: "left" | "right" | "center";
        size?: "small" | "medium" | "large" | "full";
      };
    }) => {
      const refId = value?.chart?._ref || value?.chart?._id;
      if (!refId) return null;
      const align = value?.alignment || "center";
      const size = value?.size || "full";
      return (
        <figure className="my-8">
          <ChartFromRefClient id={refId} align={align} size={size} />
          {value?.caption ? (
            <figcaption className="bg-type-caption mt-2 text-[color:var(--bg-disabled)]">
              {value.caption}
            </figcaption>
          ) : null}
        </figure>
      );
    },
    inlineImage: ({ value }: { value?: SanityImage & { alignment?: keyof typeof alignClassMap; align?: keyof typeof alignClassMap; size?: keyof typeof sizeClassMap } }) => {
      const src = imageSrc(value, 1200);
      if (!src) return null;
      const align = (value?.alignment || value?.align || "center") as keyof typeof alignClassMap;
      const size = (value?.size || "full") as keyof typeof sizeClassMap;
      return (
        <figure className={`my-6 ${alignClassMap[align]} ${sizeClassMap[size]}`}>
          <img src={src} alt={value?.alt || ""} className="block h-auto w-full" />
          {value?.caption ? (
            <figcaption className="bg-type-caption mt-2 text-[color:var(--bg-disabled)]">
              {value.caption}
            </figcaption>
          ) : null}
        </figure>
      );
    },
    figure: ({
      value,
    }: {
      value?: {
        image?: SanityImage;
        alt?: string;
        caption?: string;
        alignment?: keyof typeof alignClassMap;
        align?: keyof typeof alignClassMap;
        size?: keyof typeof sizeClassMap;
      };
    }) => {
      const src = imageSrc(value?.image, 1200);
      if (!src) return null;
      const align = (value?.alignment || value?.align || "center") as keyof typeof alignClassMap;
      const size = (value?.size || "full") as keyof typeof sizeClassMap;
      return (
        <figure className={`my-6 ${alignClassMap[align]} ${sizeClassMap[size]}`}>
          <img src={src} alt={value?.alt || ""} className="block h-auto w-full" />
          {value?.caption ? (
            <figcaption className="bg-type-caption mt-2 text-[color:var(--bg-disabled)]">
              {value.caption}
            </figcaption>
          ) : null}
        </figure>
      );
    },
    // Maps are intentionally deferred from the Figma article template.
    // Keep the serializer registered but render nothing so editor blocks
    // in body content do not crash rendering.
    mapEmbed: () => null,
  },
};

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function Breadcrumb({ section, headline }: { section?: string; headline?: string }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-[8px] bg-type-breadcrumb text-[color:var(--bg-on-surface)]">
      <Link href="/" className="hover:underline">
        Home
      </Link>
      <span aria-hidden="true" className="text-[color:var(--bg-disabled)]">/</span>
      <Link href={sectionHref(section)} className="hover:underline">
        {sectionLabel(section)}
      </Link>
      <span aria-hidden="true" className="text-[color:var(--bg-disabled)]">/</span>
      <span className="text-[color:var(--bg-disabled)] truncate max-w-[420px]">
        {headline}
      </span>
    </nav>
  );
}

function MetaRow({ publishedAt, readingTime }: { publishedAt?: string; readingTime?: number }) {
  return (
    <div className="flex items-center gap-[16px] bg-type-meta text-[color:var(--bg-disabled)] uppercase tracking-[0.05em]">
      {publishedAt ? <span>{formatMetaDate(publishedAt)}</span> : null}
      {typeof readingTime === "number" ? (
        <span className="inline-flex items-center gap-[6px]">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {readingTime} MIN READ
        </span>
      ) : null}
      <span className="inline-flex items-center gap-[6px]">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-7.6-4.5L3 21l1.5-4.5A8.38 8.38 0 0 1 3 11.5 8.5 8.5 0 0 1 11.5 3h1A8.38 8.38 0 0 1 21 11.5z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        REPLY
      </span>
    </div>
  );
}

function SocialRow({ shareUrl, headline }: { shareUrl: string; headline: string }) {
  const encoded = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(headline);
  const items = [
    {
      label: "Twitter",
      href: `https://twitter.com/intent/tweet?url=${encoded}&text=${encodedTitle}`,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18 3h3l-7.5 8.57L22.5 21H16l-5.25-6.86L4.5 21H1.5l8-9.14L1.5 3H8l4.75 6.29L18 3zm-1.06 16h1.72L7.2 5H5.38l11.56 14z" />
        </svg>
      ),
    },
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3V9zm7 0h3.8v1.64h.05c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.78 2.65 4.78 6.09V21h-4v-5.37c0-1.28-.02-2.93-1.79-2.93-1.79 0-2.07 1.39-2.07 2.84V21h-4V9z" />
        </svg>
      ),
    },
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M13 22v-8h3l1-4h-4V7.5c0-1.1.3-2 2-2h2V2.1C16.8 2 15.6 2 14.5 2 11.9 2 10 3.7 10 6.9V10H7v4h3v8h3z" />
        </svg>
      ),
    },
    {
      label: "Email",
      href: `mailto:?subject=${encodedTitle}&body=${encoded}`,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
  ];
  return (
    <ul className="flex items-center gap-[14px] text-[color:var(--bg-on-surface)]">
      {items.map((item) => (
        <li key={item.label}>
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Share on ${item.label}`}
            className="inline-flex h-[28px] w-[28px] items-center justify-center rounded-full border border-[color:var(--bg-disabled)] hover:bg-[color:var(--bg-on-surface)] hover:text-white transition-colors"
          >
            {item.icon}
          </a>
        </li>
      ))}
    </ul>
  );
}

function Sidebar({
  publishedAt,
  readingTime,
  author,
  authorBio,
  relatedArticles,
  shareUrl,
  headline,
}: {
  publishedAt?: string;
  readingTime?: number;
  author?: FigmaArticleDoc["author"];
  authorBio?: string;
  relatedArticles?: RelatedRef[];
  shareUrl: string;
  headline: string;
}) {
  const authorImg = author?.image ? imageSrc(author.image, 80) : null;
  return (
    <aside className="flex flex-col gap-[32px] w-[206px]">
      {/* Meta block */}
      <div className="flex flex-col gap-[8px]">
        <p className="bg-type-tag text-[color:var(--bg-disabled)]">ARTICLE INFO</p>
        <MetaRow publishedAt={publishedAt} readingTime={readingTime} />
      </div>

      {/* Author block */}
      {author?.name ? (
        <div className="flex flex-col gap-[12px]">
          <p className="bg-type-tag text-[color:var(--bg-disabled)]">AUTHOR</p>
          <div className="flex items-center gap-[12px]">
            {authorImg ? (
              <img
                src={authorImg}
                alt={author.name}
                className="h-[40px] w-[40px] rounded-full object-cover"
              />
            ) : (
              <div className="h-[40px] w-[40px] rounded-full bg-[color:var(--bg-beige)]" aria-hidden="true" />
            )}
            <p className="bg-type-article-h4 text-[color:var(--bg-on-surface)]">{author.name}</p>
          </div>
          {authorBio ? (
            <p className="bg-type-caption text-[color:var(--bg-on-surface)] leading-[16px]">
              {authorBio}
            </p>
          ) : null}
        </div>
      ) : null}

      {/* Social block */}
      <div className="flex flex-col gap-[12px]">
        <p className="bg-type-tag text-[color:var(--bg-disabled)]">SHARE</p>
        <SocialRow shareUrl={shareUrl} headline={headline} />
      </div>

      {/* Related articles block */}
      {relatedArticles && relatedArticles.length > 0 ? (
        <div className="flex flex-col gap-[12px]">
          <p className="bg-type-tag text-[color:var(--bg-disabled)]">RELATED</p>
          <ul className="flex flex-col gap-[16px]">
            {relatedArticles.map((rel) => {
              const img = imageSrc(rel.introImage || rel.headerImage, 220);
              return (
                <li key={rel._id}>
                  <Link href={relatedSlug(rel)} className="group flex flex-col gap-[8px]">
                    {img ? (
                      <div className="h-[120px] w-full overflow-hidden rounded-[2px] bg-[color:var(--bg-beige)]">
                        <img
                          src={img}
                          alt={relatedTitle(rel)}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                      </div>
                    ) : null}
                    <p className="bg-type-tag text-[color:var(--bg-disabled)]">
                      {sectionLabel(rel.section || rel.category)}
                    </p>
                    <p className="bg-type-article-h4 text-[color:var(--bg-on-surface)] group-hover:underline">
                      {relatedTitle(rel)}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </aside>
  );
}

function NextArticleCTA({ next }: { next?: NextRef }) {
  if (!next?.slug) return null;
  return (
    <Link
      href={relatedSlug(next)}
      className="group mt-10 inline-flex items-baseline gap-[12px] text-[color:var(--bg-on-surface)]"
    >
      <span className="bg-type-tag text-[color:var(--bg-disabled)]">NEXT ARTICLE</span>
      <span className="bg-type-h3 group-hover:underline">
        {relatedTitle(next)}
      </span>
      <span aria-hidden="true" className="bg-type-h3 transition-transform group-hover:translate-x-1">
        →
      </span>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function FigmaArticlePage({ article }: { article: FigmaArticleDoc }) {
  const headline = article.headline || "Untitled";
  const section = article.section;
  const introSrc = imageSrc(article.introImage, 1400);
  const introPos = hotspotPosition(article.introImage);
  const slugValue =
    typeof article.slug === "string"
      ? article.slug
      : article.slug?.current || "";
  const shareUrl = `https://breakingground.pub/${slugValue}`;

  return (
    <>
      <HomepageTopRibbon />

      {/* 1440-max container with strict Figma column geometry */}
      <main className="bg-white text-[color:var(--bg-on-surface)]">
        <div className="mx-auto w-full max-w-[1440px] px-[24px] lg:px-0">
          {/* Article body grid: sidebar on the left, main column on the right.
              Figma frame: sidebar x=143 w=206, main x=377 w=686. */}
          <div
            className="relative grid pt-[160px] pb-[80px] gap-x-[28px]"
            style={{
              gridTemplateColumns: "143px 206px 28px 686px 1fr",
            }}
          >
            {/* Main column — intro image, breadcrumb, tag+headline, body */}
            <article className="col-start-4 col-end-5 flex flex-col gap-[24px]">
              {introSrc ? (
                <figure className="w-full">
                  <img
                    src={introSrc}
                    alt={article.introImage?.alt || headline}
                    className="h-[460px] w-full object-cover"
                    style={{ objectPosition: introPos }}
                  />
                  {article.introImage?.caption ? (
                    <figcaption className="bg-type-caption mt-2 text-[color:var(--bg-disabled)]">
                      {article.introImage.caption}
                    </figcaption>
                  ) : null}
                </figure>
              ) : null}

              <Breadcrumb section={section} headline={headline} />

              <header className="flex flex-col gap-[16px]">
                <p className="bg-type-tag text-[color:var(--bg-on-surface)]">
                  {(() => {
                    // Treat the schema's default placeholder "ARTICLE TAG" as
                    // unset so the section name is shown instead of the literal
                    // placeholder text.
                    const raw = (article.articleTag || "").trim();
                    const fallback = sectionLabel(section);
                    const tag = !raw || raw.toUpperCase() === "ARTICLE TAG" ? fallback : raw;
                    return tag.toUpperCase();
                  })()}
                </p>
                <h1 className="bg-type-h1 text-[color:var(--bg-on-surface)]">
                  {headline}
                </h1>
                {article.dek ? (
                  <p className="bg-type-body text-[color:var(--bg-on-surface)] opacity-80">
                    {article.dek}
                  </p>
                ) : null}
              </header>

              <div className="bg-article-body">
                {Array.isArray(article.body) ? (
                  <PortableText value={article.body as any} components={articleComponents as any} />
                ) : null}
              </div>

              <NextArticleCTA next={article.nextArticle} />
            </article>

            {/* Sidebar — left column, starts below intro image (y=623 in Figma) */}
            <div className="col-start-2 col-end-3 row-start-1 mt-[463px]">
              <Sidebar
                publishedAt={article.publishedAt}
                readingTime={article.readingTime}
                author={article.author}
                authorBio={article.authorBio}
                relatedArticles={article.relatedArticles}
                shareUrl={shareUrl}
                headline={headline}
              />
            </div>
          </div>

          {/* Event banner (frame 165:764) */}
          <div className="px-[24px] pb-[80px]">
            <HomepageEventBanner
              title="2026 Breaking Ground Summit"
              subtitle="Industry leaders. Western PA. One room."
              body="Join us for a full day of project announcements, regional data, and off-the-record conversations with the contractors, owners, and architects shaping the next decade of building."
              ctaLabel="Register"
              ctaHref="/events"
            />
          </div>
        </div>
      </main>
    </>
  );
}
