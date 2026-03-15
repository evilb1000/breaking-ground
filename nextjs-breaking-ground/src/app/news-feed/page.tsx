import fs from "node:fs/promises";
import path from "node:path";
import Masthead from "@/components/Masthead";

type ManifestItem = {
  link?: string;
  source?: string;
  title?: string;
  pubDate?: string;
  headline?: string;
  blurb?: string;
  publicationAddedAt?: string;
};

type Manifest = {
  summaries?: ManifestItem[];
};

function itemDateValue(item: ManifestItem): number {
  const raw = item.pubDate || item.publicationAddedAt;
  if (!raw) return 0;
  const ts = new Date(raw).getTime();
  return Number.isNaN(ts) ? 0 : ts;
}

export default async function NewsFeedPage() {
  const manifestPath = path.join(
    process.cwd(),
    "..",
    "data",
    "page-json",
    "publication-summaries.manifest.json",
  );

  const raw = await fs.readFile(manifestPath, "utf8");
  const manifest = JSON.parse(raw) as Manifest;
  const items = [...(manifest.summaries || [])]
    .filter((item) => item.link && item.headline)
    .sort((a, b) => itemDateValue(b) - itemDateValue(a));

  return (
    <>
      <Masthead homeHref="/" />
      <main className="min-h-screen bg-white text-black px-4 md:px-12 lg:px-24 py-12">
        <h1 className="font-serif text-5xl md:text-6xl font-bold tracking-tight text-center">
          News Feed
        </h1>

        {items.length === 0 ? (
          <p className="mt-8 text-lg text-gray-500 text-center">
            No news feed entries found.
          </p>
        ) : (
          <div className="mt-12 max-w-5xl mx-auto space-y-10">
            {items.map((item) => (
              <article key={`${item.link}-${item.pubDate || item.publicationAddedAt || "na"}`}>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block"
                >
                  <h2 className="font-serif text-3xl md:text-4xl font-bold leading-tight group-hover:underline">
                    {item.headline}
                  </h2>
                </a>
                <p className="mt-2 text-sm text-gray-600">
                  {[item.source, item.pubDate].filter(Boolean).join(" • ")}
                </p>
                {item.blurb ? (
                  <p className="mt-3 text-lg leading-relaxed text-gray-800">{item.blurb}</p>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
