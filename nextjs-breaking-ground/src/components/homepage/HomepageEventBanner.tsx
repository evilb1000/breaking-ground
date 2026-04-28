type HomepageEventBannerProps = {
  title: string;
  subtitle: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
};

export default function HomepageEventBanner({
  title,
  subtitle,
  body,
  ctaLabel,
  ctaHref,
}: HomepageEventBannerProps) {
  return (
    <section className="relative mt-12 overflow-hidden rounded-sm bg-[#113251] px-[29px] py-[48px] text-left text-white lg:mt-16 lg:px-6 lg:py-16 lg:text-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_52%)]" />
      <div className="relative">
        <p className="bg-font-roboto mb-5 inline-flex rounded bg-[#ff611d] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] lg:mx-auto">
          Event registration
        </p>
        <h3
          className="bg-font-roboto-flex text-[22px] leading-[26px] lg:text-[36px] lg:leading-[44px]"
          style={{
            fontVariationSettings:
              "'GRAD' 0, 'XOPQ' 96, 'XTRA' 468, 'YOPQ' 79, 'YTAS' 750, 'YTDE' -203, 'YTFI' 738, 'YTLC' 514, 'YTUC' 712, 'wdth' 100",
            fontWeight: 838,
          }}
        >
          {title}
        </h3>
        <p className="bg-font-roboto-condensed mt-2 text-[16px] font-medium leading-[22px] lg:mt-3 lg:text-[28px] lg:leading-[34px]">{subtitle}</p>
        <p className="bg-font-roboto mt-3 max-w-3xl text-[12px] leading-[20px] lg:mx-auto lg:mt-5 lg:bg-type-body">
          {body}
        </p>
        <a
          href={ctaHref}
          className="bg-font-roboto mt-6 inline-flex items-center rounded border border-white/30 px-4 py-2 text-sm font-bold uppercase tracking-[0.08em] transition-colors hover:bg-white hover:text-[#113251]"
        >
          {ctaLabel}
        </a>
      </div>
    </section>
  );
}
