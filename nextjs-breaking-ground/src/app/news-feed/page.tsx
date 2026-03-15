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

function formatDisplayDate(raw?: string): string | null {
  if (!raw) return null;
  const ymd = /^(\d{4})-(\d{2})-(\d{2})$/;
  const match = raw.match(ymd);
  if (match) {
    const [, y, m, d] = match;
    return `${m}/${d}/${y}`;
  }

  const dt = new Date(raw);
  if (Number.isNaN(dt.getTime())) return null;
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = String(dt.getUTCFullYear());
  return `${mm}/${dd}/${yyyy}`;
}

export default async function NewsFeedPage() {
  const ingestDir = path.join(
    process.cwd(),
    "..",
    "data",
    "news-feed-ingest",
  );

  const dirEntries = await fs.readdir(ingestDir, { withFileTypes: true });
  const jsonNames = dirEntries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".json"))
    .map((entry) => entry.name);

  if (jsonNames.length === 0) {
    return (
      <>
        <Masthead homeHref="/" />
        <main className="min-h-screen bg-white text-black px-4 md:px-12 lg:px-24 py-12">
          <h1 className="font-serif text-5xl md:text-6xl font-bold tracking-tight text-center">
            News Feed
          </h1>
          <p className="mt-8 text-lg text-gray-500 text-center">
            No JSON files found in the news feed ingest folder.
          </p>
        </main>
      </>
    );
  }

  const latestJsonName = (
    await Promise.all(
      jsonNames.map(async (name) => {
        const fullPath = path.join(ingestDir, name);
        const stats = await fs.stat(fullPath);
        return { name, mtimeMs: stats.mtimeMs };
      }),
    )
  )
    .sort((a, b) => b.mtimeMs - a.mtimeMs)[0]
    .name;

  const manifestPath = path.join(ingestDir, latestJsonName);
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
          <div className="mt-12 max-w-5xl mx-auto space-y-24 text-center">
            {items.map((item) => {
              const displayDate = formatDisplayDate(item.pubDate);
              return (
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
                  {item.source ? <span className="font-bold text-black">{item.source}</span> : null}
                  {item.source && displayDate ? <span> • </span> : null}
                  {displayDate ? <span className="font-bold text-black">{displayDate}</span> : null}
                </p>
                {item.blurb ? (
                  <p className="mt-3 mb-10 md:mb-12 text-xl md:text-2xl font-bold leading-relaxed text-gray-900">
                    {item.blurb}
                  </p>
                ) : null}
              </article>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
