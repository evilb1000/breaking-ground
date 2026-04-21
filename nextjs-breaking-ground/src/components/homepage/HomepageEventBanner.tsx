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
    <section className="relative mt-16 overflow-hidden rounded-sm bg-[#113251] px-6 py-16 text-white text-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_52%)]" />
      <div className="relative">
        <p className="mx-auto mb-5 inline-flex rounded bg-[#ff611d] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em]">
          Event registration
        </p>
        <h3 className="font-serif text-4xl md:text-5xl font-bold leading-tight">
          {title}
        </h3>
        <p className="mt-3 font-serif text-2xl md:text-3xl font-bold">{subtitle}</p>
        <p className="mx-auto mt-5 max-w-3xl text-lg md:text-xl leading-relaxed">
          {body}
        </p>
        <a
          href={ctaHref}
          className="mt-6 inline-flex items-center rounded border border-white/30 px-4 py-2 text-sm font-bold uppercase tracking-[0.08em] hover:bg-white hover:text-[#113251] transition-colors"
        >
          {ctaLabel}
        </a>
      </div>
    </section>
  );
}
