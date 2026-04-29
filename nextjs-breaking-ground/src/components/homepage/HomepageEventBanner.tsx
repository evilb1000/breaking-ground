export type HomepageEventBannerProps = {
  title?: string | null;
  subtitle?: string | null;
  body?: string | null;
  ctaLabel?: string | null;
  ctaHref?: string | null;
  backgroundImageSrc?: string | null;
};

const FALLBACK_EVENT_IMAGE = "/figma-assets/event-banner-bg.png";

export default function HomepageEventBanner({
  title,
  subtitle,
  body,
  ctaLabel,
  ctaHref,
  backgroundImageSrc,
}: HomepageEventBannerProps) {
  const resolvedTitle = title?.trim();
  const resolvedSubtitle = subtitle?.trim();
  const resolvedBody = body?.trim();
  const resolvedCtaLabel = ctaLabel?.trim();
  const resolvedCtaHref = ctaHref?.trim();

  if (
    !resolvedTitle &&
    !resolvedSubtitle &&
    !resolvedBody &&
    !resolvedCtaLabel &&
    !resolvedCtaHref
  ) {
    return null;
  }

  return (
    <section className="relative mt-12 overflow-hidden rounded-sm bg-[#113251] px-[29px] py-[48px] text-left text-white lg:mt-16 lg:px-6 lg:py-16 lg:text-center">
      <img
        src={backgroundImageSrc?.trim() || FALLBACK_EVENT_IMAGE}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-[#113251]/70" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_52%)]" />
      <div className="relative">
        <p className="bg-font-roboto mb-5 inline-flex rounded bg-[#ff611d] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] lg:mx-auto">
          Event registration
        </p>
        {resolvedTitle ? (
          <h3
            className="bg-font-roboto-flex text-[32px] leading-[36px] lg:bg-type-h1"
            style={{
              fontVariationSettings:
                "'GRAD' 0, 'XOPQ' 96, 'XTRA' 468, 'YOPQ' 79, 'YTAS' 750, 'YTDE' -203, 'YTFI' 738, 'YTLC' 514, 'YTUC' 712, 'wdth' 100",
              fontWeight: 838,
            }}
          >
            {resolvedTitle}
          </h3>
        ) : null}
        {resolvedSubtitle ? (
          <p className="bg-font-roboto-condensed mt-2 text-[18px] font-medium leading-[24px] lg:mt-3 lg:bg-type-h2">
            {resolvedSubtitle}
          </p>
        ) : null}
        {resolvedBody ? (
          <p className="mt-3 max-w-3xl bg-font-crimson text-[20px] leading-[27px] lg:mx-auto lg:mt-5 lg:text-[34px] lg:leading-[40px]">
            {resolvedBody}
          </p>
        ) : null}
        {resolvedCtaHref && resolvedCtaLabel ? (
          <a
            href={resolvedCtaHref}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-font-roboto mt-6 inline-flex items-center rounded border border-white/30 px-4 py-2 text-sm font-bold uppercase tracking-[0.08em] transition-colors hover:bg-white hover:text-[#113251]"
          >
            {resolvedCtaLabel}
          </a>
        ) : null}
      </div>
    </section>
  );
}
