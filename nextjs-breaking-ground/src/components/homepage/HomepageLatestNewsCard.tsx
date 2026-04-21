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
        <p className="bg-type-meta mt-2 uppercase tracking-[0.08em] text-[#7c7975]">
          {publishedAt}
        </p>
      ) : null}
      <h3 className="bg-type-h3 mt-1 text-[#312e28] group-hover:underline">
        {title}
      </h3>
    </Link>
  );
}
