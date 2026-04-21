import Link from "next/link";

type HomepageHeroFeatureProps = {
  href: string;
  title: string;
  lede?: string;
  category?: string;
  publishedAt?: string;
  imageSrc?: string | null;
  imageAlt: string;
};

export default function HomepageHeroFeature({
  href,
  title,
  lede,
  category,
  publishedAt,
  imageSrc,
  imageAlt,
}: HomepageHeroFeatureProps) {
  return (
    <section className="mt-6">
      <Link href={href} className="block group">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-6 bg-[#f5f3f0] p-3 rounded-sm">
          <div className="h-[360px] lg:h-[428px] overflow-hidden rounded-sm bg-gray-100">
            {imageSrc ? (
              <img
                src={imageSrc}
                alt={imageAlt}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
            ) : null}
          </div>
          <div className="flex flex-col justify-center px-3 md:px-4 py-2 md:py-4 text-[#312e28]">
            <p className="bg-font-roboto text-[10px] uppercase tracking-[0.2em] font-bold text-[#ff611d]">
              {category || "Article tag"}
            </p>
            <h2 className="bg-font-roboto-flex mt-3 text-[36px] leading-[1.12] md:text-[44px] md:leading-[1.06] font-semibold">
              {title}
            </h2>
            {publishedAt ? (
              <p className="bg-font-roboto mt-3 text-[10px] leading-[2.2] text-[#6a6762] uppercase tracking-[0.08em]">
                {publishedAt}
              </p>
            ) : null}
            {lede ? (
              <p className="bg-font-crimson mt-5 text-[16px] leading-[1.4] text-[#3b3833]">
                {lede}
              </p>
            ) : null}
            <span className="bg-font-roboto mt-6 inline-flex w-fit items-center justify-center rounded bg-[#113251] px-5 py-2 text-xs font-bold uppercase tracking-[0.08em] text-white">
              Read article
            </span>
          </div>
        </div>
      </Link>
    </section>
  );
}
