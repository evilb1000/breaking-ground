import { PortableText } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { client } from "@/sanity/client";
import ChartFromRefClient from "@/components/ChartFromRefClient";
import MapEmbedClient from "@/components/MapEmbedClient";
import RevealOnScroll from "@/components/RevealOnScroll";
import ScrollOpacity from "@/components/ScrollOpacity";

const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

function imgUrl(source: any, width = 1600): string | null {
  if (!source?.asset?._ref && !source?.asset?.url) return null;
  return source.asset?.url || urlFor(source as SanityImageSource)?.width(width).auto("format").url() || null;
}

function hotspotPos(hotspot: any): string {
  if (!hotspot) return "50% 50%";
  return `${(hotspot.x * 100).toFixed(1)}% ${(hotspot.y * 100).toFixed(1)}%`;
}

/* ------------------------------------------------------------------ */
/*  Theme / spacing resolution                                        */
/* ------------------------------------------------------------------ */

const BG_MAP: Record<string, string> = {
  white: "#ffffff",
  light: "#f5f5f0",
  dark: "#1a1a1a",
  black: "#000000",
};

const TEXT_MAP: Record<string, string> = {
  white: "#111111",
  light: "#111111",
  dark: "#f5f5f0",
  black: "#ffffff",
};

function resolveGradient(section: any): string | null {
  const g = section.bgGradient;
  if (!g?.enabled || !g?.colorFrom?.hex || !g?.colorTo?.hex) return null;
  const dir = g.direction || "to bottom";
  const opacity = typeof g.opacity === "number" ? g.opacity / 100 : 1;

  if (opacity >= 1) {
    return `linear-gradient(${dir}, ${g.colorFrom.hex}, ${g.colorTo.hex})`;
  }

  const fromR = g.colorFrom.rgb;
  const toR = g.colorTo.rgb;
  const from = fromR ? `rgba(${fromR.r},${fromR.g},${fromR.b},${opacity})` : g.colorFrom.hex;
  const to = toR ? `rgba(${toR.r},${toR.g},${toR.b},${opacity})` : g.colorTo.hex;
  return `linear-gradient(${dir}, ${from}, ${to})`;
}

function resolveTheme(section: any) {
  const theme: string = section.sectionTheme || "white";
  const gradient = resolveGradient(section);

  if (theme === "custom") {
    const bg = section.customBgColor?.hex || "#ffffff";
    const isLight = section.customTextColor !== "light";
    return {
      bg,
      gradient,
      fg: isLight ? "#111111" : "#ffffff",
      dataTheme: isLight ? "white" : "dark",
    };
  }
  return { bg: BG_MAP[theme], gradient, fg: TEXT_MAP[theme], dataTheme: theme };
}

const SPACING: Record<string, number> = { none: 0, tight: 32, std: 64, major: 96 };

function resolveSpacing(value: string | undefined, fallback: string) {
  return SPACING[value || fallback] ?? SPACING[fallback];
}

/* ------------------------------------------------------------------ */
/*  SectionWrapper — every page-builder block is wrapped in this      */
/* ------------------------------------------------------------------ */

function SectionWrapper({
  section,
  children,
  defaultTop = "std",
  defaultBottom = "std",
}: {
  section: any;
  children: React.ReactNode;
  defaultTop?: string;
  defaultBottom?: string;
}) {
  const { bg, gradient, fg, dataTheme } = resolveTheme(section);
  const pt = resolveSpacing(section.topSpacing, defaultTop);
  const pb = resolveSpacing(section.bottomSpacing, defaultBottom);
  const align = section.textAlign || "left";
  const hasHeader = section.heading || section.subheading;
  const hasCaption = section.sectionCaption;

  const bgStyle: React.CSSProperties = gradient
    ? { background: `${gradient}, ${bg}`, color: fg, paddingTop: pt, paddingBottom: pb }
    : { backgroundColor: bg, color: fg, paddingTop: pt, paddingBottom: pb };

  return (
    <section
      className="pp-section"
      data-theme={dataTheme}
      style={bgStyle}
    >
      {hasHeader && (
        <div className="pp-grid-container" style={{ marginBottom: 32 }}>
          <div className="pp-span-8" style={{ textAlign: align as any }}>
            {section.heading && <h2 className="pp-section-heading">{section.heading}</h2>}
            {section.subheading && <p className="pp-section-subheading">{section.subheading}</p>}
          </div>
        </div>
      )}

      {children}

      {hasCaption && (
        <div className="pp-grid-container">
          <p className="pp-span-8 pp-section-caption" style={{ textAlign: align as any }}>
            {section.sectionCaption}
          </p>
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared PortableText components                                    */
/* ------------------------------------------------------------------ */

const ptComponents = {
  types: {
    inlineChart: ({ value }: { value: any }) => {
      const refId = value?._ref || value?._id;
      return refId ? <ChartFromRefClient id={refId} /> : null;
    },
    chartFigure: ({ value }: { value: any }) => {
      const refId = value?.chart?._ref || value?.chart?._id;
      if (!refId) return null;
      return (
        <figure>
          <ChartFromRefClient
            id={refId}
            align={(value?.alignment || "center") as any}
            size={(value?.size || "full") as any}
          />
          {value?.caption && (
            <figcaption className="text-center text-sm text-gray-500 mt-2">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
    inlineImage: ({ value }: { value: any }) => {
      const src = imgUrl(value, 1200);
      if (!src) return null;
      return (
        <figure className="my-8">
          <img src={src} alt={value?.alt || ""} className="rounded-md w-full h-auto" />
          {value?.caption && <figcaption className="text-sm text-gray-500 mt-2">{value.caption}</figcaption>}
        </figure>
      );
    },
    figure: ({ value }: { value: any }) => {
      const src = value?.image ? imgUrl(value.image, 1200) : null;
      if (!src) return null;
      return (
        <figure className="my-8">
          <img src={src} alt={value?.alt || ""} className="rounded-md w-full h-auto" />
          {value?.caption && <figcaption className="text-sm text-gray-500 mt-2">{value.caption}</figcaption>}
        </figure>
      );
    },
    mapEmbed: ({ value }: { value: any }) => {
      const dataUrl = value?.dataFile?.asset?.url;
      if (!dataUrl) return null;
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
          {value?.caption && <p className="text-center text-sm text-gray-500 mt-2">{value.caption}</p>}
        </div>
      );
    },
  },
};

/* ------------------------------------------------------------------ */
/*  Content renderers (pure content — no spacing, no backgrounds)     */
/* ------------------------------------------------------------------ */

const HERO_HEIGHT: Record<string, string> = {
  standard: "70vh",
  tall: "85vh",
  full: "100vh",
};

function HeroContent({ section }: { section: any }) {
  const src = imgUrl(section.image, 2400);
  if (!src) return null;
  const width = section.contentWidth || "bleed";
  const height = HERO_HEIGHT[section.heroHeight || "tall"] || "85vh";
  const fade = section.imageFade;

  const image = (
    <div className="pp-hero" data-fade={fade ? "true" : undefined} style={{ height }}>
      <img
        src={src}
        alt={section.alt || ""}
        style={{ objectPosition: hotspotPos(section.image?.hotspot) }}
      />
      {section.overlayText && <div className="pp-hero-overlay">{section.overlayText}</div>}
    </div>
  );

  if (width === "bleed") {
    return (
      <>
        {image}
        {section.caption && !fade && (
          <div className="pp-grid-container" style={{ marginTop: 8 }}>
            <p className="pp-span-8 pp-caption">{section.caption}</p>
          </div>
        )}
      </>
    );
  }

  const spanClass = width === "editorial" ? "pp-span-8" : "pp-span-full";
  return (
    <div className="pp-grid-container">
      <div className={spanClass}>
        {image}
        {section.caption && <p className="pp-caption">{section.caption}</p>}
      </div>
    </div>
  );
}

function TextContent({ section }: { section: any }) {
  if (!section.body) return null;
  const width = section.contentWidth || "editorial";
  const effectiveWidth = width === "bleed" ? "wide" : width;
  const spanClass = effectiveWidth === "editorial" ? "pp-span-8" : "pp-span-full";
  const align = section.textAlign || "left";

  return (
    <div className="pp-grid-container">
      <div className={spanClass} style={{ textAlign: align as any }}>
        <div className="prose prose-lg md:prose-xl max-w-none leading-relaxed prose-headings:mt-6 prose-headings:mb-3 prose-p:my-4 md:prose-p:my-5 prose-ul:my-4 prose-ol:my-4 prose-li:my-1 prose-img:my-6 prose-figure:my-8">
          <PortableText value={section.body} components={ptComponents} />
        </div>
      </div>
    </div>
  );
}

function PullQuoteContent({ section }: { section: any }) {
  return (
    <div className="pp-grid-container">
      <blockquote className="pp-pull-quote pp-span-6-center">
        {section.quote}
        {section.attribution && <cite>{section.attribution}</cite>}
      </blockquote>
    </div>
  );
}

const OVERLAY_POS: Record<string, string> = {
  "bottom-left": "flex-end flex-start",
  "bottom-center": "flex-end center",
  "center": "center center",
  "top-left": "flex-start flex-start",
};

function FullWidthImageContent({ section }: { section: any }) {
  const src = imgUrl(section.image, 2400);
  if (!src) return null;
  const width = section.contentWidth || "bleed";
  const fade = section.imageFade;
  const reveal = section.revealEffect && section.revealEffect !== "none" ? section.revealEffect : null;
  const overlayText = section.overlayText;
  const pos = section.overlayPosition || "bottom-left";

  const wrapReveal = (el: React.ReactNode) => {
    if (reveal === "scroll-fade") return <ScrollOpacity>{el}</ScrollOpacity>;
    return reveal ? <RevealOnScroll effect={reveal}>{el}</RevealOnScroll> : el;
  };

  const overlayEl = overlayText ? (
    <div className={`pp-fw-overlay pp-fw-overlay--${pos}`}>
      <div className="pp-grid-container">
        <div className="pp-span-8">
          <span className="pp-fw-overlay-text">{overlayText}</span>
        </div>
      </div>
    </div>
  ) : null;

  if (width === "bleed") {
    return wrapReveal(
      <div className={`pp-fw-wrap ${fade ? "pp-fade" : ""}`}>
        <img src={src} alt={section.alt || ""} className="pp-img" />
        {overlayEl}
        {section.caption && !fade && (
          <div className="pp-grid-container" style={{ marginTop: 8 }}>
            <p className="pp-span-8 pp-caption">{section.caption}</p>
          </div>
        )}
      </div>,
    );
  }

  const spanClass = width === "editorial" ? "pp-span-8" : "pp-span-full";
  return (
    <div className="pp-grid-container">
      <div className={spanClass}>
        {wrapReveal(
          <div className={`pp-fw-wrap ${fade ? "pp-fade" : ""}`}>
            <img src={src} alt={section.alt || ""} className="pp-img rounded-sm" />
            {overlayEl}
          </div>,
        )}
        {section.caption && <p className="pp-caption">{section.caption}</p>}
      </div>
    </div>
  );
}


function ImageDiptychContent({ section }: { section: any }) {
  const srcL = imgUrl(section.imageLeft, 1000);
  const srcR = imgUrl(section.imageRight, 1000);
  if (!srcL && !srcR) return null;
  const width = section.contentWidth || "wide";
  const effectiveWidth = width === "bleed" ? "wide" : width;

  const pair = (
    <>
      <div className="pp-col-6">
        {srcL && <img src={srcL} alt={section.altLeft || ""} className="pp-img-cover rounded-sm" />}
        {section.captionLeft && <p className="pp-caption">{section.captionLeft}</p>}
      </div>
      <div className="pp-col-6">
        {srcR && <img src={srcR} alt={section.altRight || ""} className="pp-img-cover rounded-sm" />}
        {section.captionRight && <p className="pp-caption">{section.captionRight}</p>}
      </div>
    </>
  );

  if (effectiveWidth === "editorial") {
    return (
      <div className="pp-grid-container">
        <div className="pp-span-8">
          <div className="pp-inner-split">{pair}</div>
        </div>
      </div>
    );
  }

  return <div className="pp-grid-container">{pair}</div>;
}

function ImageGridContent({ section }: { section: any }) {
  const images: any[] = section.images || [];
  if (!images.length) return null;
  const width = section.contentWidth || "wide";
  const effectiveWidth = width === "bleed" ? "wide" : width;

  const cells = images.map((item: any, i: number) => {
    const src = imgUrl(item.image, 800);
    if (!src) return null;
    return (
      <div key={i} className="pp-col-4">
        <img src={src} alt={item.alt || ""} className="pp-img-cover rounded-sm" />
        {item.caption && <p className="pp-caption">{item.caption}</p>}
      </div>
    );
  });

  if (effectiveWidth === "editorial") {
    return (
      <div className="pp-grid-container">
        <div className="pp-span-8">
          <div className="pp-inner-split">{cells}</div>
        </div>
      </div>
    );
  }

  return <div className="pp-grid-container">{cells}</div>;
}

function ColorBlockContent({ section }: { section: any }) {
  if (!section.body) return null;
  const width = section.contentWidth || "editorial";
  const effectiveWidth = width === "bleed" ? "wide" : width;
  const spanClass = effectiveWidth === "editorial" ? "pp-span-8" : "pp-span-full";
  const align = section.textAlign || "left";

  return (
    <div className="pp-grid-container">
      <div className={spanClass} style={{ textAlign: align as any }}>
        <div className="prose prose-lg md:prose-xl max-w-none leading-relaxed prose-headings:mt-6 prose-headings:mb-3 prose-p:my-4 md:prose-p:my-5" style={{ color: "inherit" }}>
          <PortableText value={section.body} components={ptComponents} />
        </div>
      </div>
    </div>
  );
}

function ProjectDataContent({ project, section }: { project: any; section: any }) {
  const width = section.contentWidth || "wide";
  const entries = [
    { label: "Architect", value: project.architect },
    { label: "General Contractor", value: project.generalContractor },
    { label: "Owner / Client", value: project.owner },
    { label: "Project Type", value: project.projectType },
    { label: "Size", value: project.projectSize },
    { label: "Cost", value: project.projectCost },
    { label: "Completion", value: project.completionDate },
    { label: "Location", value: project.location },
  ].filter((e) => e.value);

  const placard = (
    <div className="pp-placard" style={{ paddingBlock: 20 }}>
      <div className="pp-placard-title" style={{ paddingBlock: 20 }}>
        <span style={{ fontWeight: 600 }}>Project Data</span>
        {project.projectName && (
          <p style={{ fontSize: "1.125rem", letterSpacing: "0", textTransform: "none", marginTop: 8, fontFamily: "Georgia, serif", lineHeight: 1.3 }}>
            {project.projectName}
          </p>
        )}
      </div>
      <div className="pp-placard-grid" style={{ paddingBlock: 20 }}>
        {entries.map((e) => (
          <dl key={e.label} className="pp-placard-item" style={{ marginBottom: 20 }}>
            <dt>{e.label}</dt>
            <dd>{e.value}</dd>
          </dl>
        ))}
      </div>
    </div>
  );

  if (width === "editorial") {
    return (
      <div className="pp-grid-container">
        <div className="pp-span-8">{placard}</div>
      </div>
    );
  }

  return <div className="pp-grid-container"><div className="pp-span-full">{placard}</div></div>;
}

function GalleryContent({ section }: { section: any }) {
  const images: any[] = section.images || [];
  const cols: number = section.columns || 3;
  if (!images.length) return null;
  const width = section.contentWidth || "wide";
  const effectiveWidth = width === "bleed" ? "wide" : width;
  const spanClass = effectiveWidth === "editorial" ? "pp-span-8" : "pp-span-full";

  return (
    <div className="pp-grid-container">
      <div className={spanClass}>
        <div className={`pp-gallery pp-gallery-${cols}`}>
          {images.map((item: any, i: number) => {
            const src = imgUrl(item.image, 800);
            if (!src) return null;
            return (
              <figure key={i}>
                <img src={src} alt={item.alt || ""} className="pp-img-cover rounded-sm" style={{ aspectRatio: "4/3" }} />
                {item.caption && <figcaption className="pp-caption">{item.caption}</figcaption>}
              </figure>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section dispatcher                                                */
/* ------------------------------------------------------------------ */

function RenderSection({ section, project }: { section: any; project: any }) {
  switch (section._type) {
    case "heroSection":
      return (
        <SectionWrapper section={section} defaultTop="none" defaultBottom="none">
          <HeroContent section={section} />
        </SectionWrapper>
      );
    case "textBlock":
      return (
        <SectionWrapper section={section} defaultTop="tight" defaultBottom="tight">
          <TextContent section={section} />
        </SectionWrapper>
      );
    case "pullQuote":
      return (
        <SectionWrapper section={section} defaultTop="std" defaultBottom="std">
          <PullQuoteContent section={section} />
        </SectionWrapper>
      );
    case "fullWidthImage":
      return (
        <SectionWrapper section={section}>
          <FullWidthImageContent section={section} />
        </SectionWrapper>
      );
    case "imageDiptych":
      return (
        <SectionWrapper section={section}>
          <ImageDiptychContent section={section} />
        </SectionWrapper>
      );
    case "imageGrid":
      return (
        <SectionWrapper section={section}>
          <ImageGridContent section={section} />
        </SectionWrapper>
      );
    case "colorBlock":
      return (
        <SectionWrapper section={section} defaultTop="std" defaultBottom="std">
          <ColorBlockContent section={section} />
        </SectionWrapper>
      );
    case "projectDataBlock":
      return (
        <SectionWrapper section={section} defaultTop="std" defaultBottom="std">
          <ProjectDataContent project={project} section={section} />
        </SectionWrapper>
      );
    case "gallerySection":
      return (
        <SectionWrapper section={section}>
          <GalleryContent section={section} />
        </SectionWrapper>
      );
    default:
      return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Main page component                                               */
/* ------------------------------------------------------------------ */

export default function ProjectProfilePage({ project }: { project: any }) {
  const fallbackImg = imgUrl(project.headerImage, 2400);
  const fallbackHotspot = project.headerImage?.hotspot;

  const firstBlock = project.pageContent?.[0];
  const firstIsHero = firstBlock?._type === "heroSection";
  const firstHeroImg = firstIsHero ? imgUrl(firstBlock.image, 2400) : null;

  const heroSrc = firstIsHero ? firstHeroImg : fallbackImg;
  const heroHotspot = firstIsHero ? firstBlock.image?.hotspot : fallbackHotspot;
  const heroAlt = firstIsHero
    ? firstBlock.alt || project.title
    : project.headerImage?.alt || project.title;
  const heroHeight = firstIsHero
    ? (HERO_HEIGHT[firstBlock.heroHeight || "tall"] || "85vh")
    : "90vh";
  const heroFade = firstIsHero ? firstBlock.imageFade : false;
  const heroTheme = firstIsHero ? resolveTheme(firstBlock) : { bg: "#000", gradient: null, fg: "#fff", dataTheme: "black" };
  const hasHero = !!heroSrc;

  const allAuthors = [
    ...(project.author ? [project.author] : []),
    ...(project.coAuthors || []),
  ];

  const formattedDate = project.publishedAt
    ? new Date(project.publishedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const baseBg = `linear-gradient(to bottom, ${heroTheme.bg} 75%, transparent 100%)`;
  const heroBgStyle: React.CSSProperties = heroTheme.gradient
    ? { background: `${heroTheme.gradient}, ${baseBg}` }
    : { background: baseBg };

  return (
    <article>
      {/* ── Cinematic hero with overlaid title ── */}
      {hasHero && (
        <section className="pp-section" data-theme={heroTheme.dataTheme} style={heroBgStyle}>
          <div
            className="pp-hero"
            data-fade={heroFade ? "true" : undefined}
            style={{ height: heroHeight }}
          >
            <img
              src={heroSrc!}
              alt={heroAlt}
              style={{ objectPosition: hotspotPos(heroHotspot) }}
            />
            <div className="pp-hero-title-overlay">
              <div className="pp-grid-container">
                <div className="pp-span-8">
                  <p className="pp-hero-label">Project Profile</p>
                  <h1 className="pp-hero-title">{project.title}</h1>
                  {project.dek && <p className="pp-hero-dek">{project.dek}</p>}
                  {formattedDate && <p className="pp-hero-date">{formattedDate}</p>}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}


      {/* ── Standalone title section (only when there's no hero at all) ── */}
      {!hasHero && (
        <section className="pp-section" style={{ paddingTop: 48, paddingBottom: 24 }}>
          <div className="pp-grid-container">
            <header className="pp-span-8">
              <p
                style={{
                  fontSize: "0.6875rem",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  marginBottom: 12,
                  opacity: 0.5,
                }}
              >
                Project Profile
              </p>
              <h1
                style={{
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: "clamp(2.25rem, 5vw, 3.75rem)",
                  lineHeight: 1.1,
                  fontWeight: 700,
                  margin: 0,
                }}
              >
                {project.title}
              </h1>
              {project.dek && (
                <p
                  style={{
                    fontSize: "1.1875rem",
                    lineHeight: 1.5,
                    color: "#555",
                    marginTop: 16,
                    fontFamily: "Georgia, serif",
                  }}
                >
                  {project.dek}
                </p>
              )}

              {allAuthors.length > 0 && (
                <div className="flex items-center gap-3 mt-6 flex-wrap">
                  {allAuthors.map((a: any) => {
                    const aImg = a?.image
                      ? urlFor(a.image as SanityImageSource)?.width(64).height(64).url()
                      : null;
                    return aImg ? (
                      <img
                        key={a.name}
                        src={aImg}
                        alt={a.name || "Author"}
                        className="h-10 w-10 rounded-full object-cover"
                        width={40}
                        height={40}
                      />
                    ) : null;
                  })}
                  <span style={{ fontSize: "0.875rem", color: "#666" }}>
                    By {allAuthors.map((a: any) => a.name).filter(Boolean).join(" and ")}
                  </span>
                </div>
              )}

              {formattedDate && (
                <p style={{ fontSize: "0.8125rem", color: "#999", marginTop: 8 }}>
                  {formattedDate}
                </p>
              )}
            </header>
          </div>
        </section>
      )}

      {/* Page builder sections (skip first if it was consumed as the hero) */}
      {(project.pageContent || []).map((section: any, i: number) => {
        if (i === 0 && firstIsHero) return null;
        return <RenderSection key={section._key || i} section={section} project={project} />;
      })}
    </article>
  );
}
