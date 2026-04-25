import Link from "next/link";

// Canonical text masthead. This keeps the masthead visual available without
// reintroducing the retired pre-Figma duplicate section navigation.
export default function Masthead({ homeHref }: { homeHref?: string } = {}) {
  const title = (
    <span className="font-serif text-4xl font-bold uppercase tracking-[0.06em] md:text-5xl">
      Breaking Ground
    </span>
  );

  return (
    <header className="sticky top-0 z-50 bg-white/75 px-6 py-4 text-center shadow-[0_10px_30px_-24px_rgba(0,0,0,0.45)] backdrop-blur-md">
      <h1>
        {homeHref ? (
          <Link href={homeHref} className="cursor-pointer transition-opacity hover:opacity-70">
            {title}
          </Link>
        ) : (
          title
        )}
      </h1>
      <p className="mt-4 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
        Construction • Industry • Power • Western PA
      </p>
    </header>
  );
}
