import Link from "next/link";

type HomepageLatestNewsCardProps = {
  href: string;
  title: string;
  publishedAt?: string;
  imageSrc?: string | null;
  imageAlt: string;
};

export default function HomepageLatestNewsCard({
  href,
  title,
  publishedAt,
  imageSrc,
  imageAlt,
}: HomepageLatestNewsCardProps) {
  return (
    <Link href={href} className="group block">
      <div className="h-[133px] w-full overflow-hidden rounded-[4px] bg-gray-100">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={imageAlt}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : null}
      </div>
      {publishedAt ? (
        <p className="bg-font-roboto mt-2 text-[10px] uppercase leading-[2.2] tracking-[0.08em] text-[#7c7975]">
          {publishedAt}
        </p>
      ) : null}
      <h3 className="bg-font-roboto-condensed mt-1 text-[20px] leading-[1.3] font-medium text-[#312e28] group-hover:underline">
        {title}
      </h3>
    </Link>
  );
}
