import fs from "node:fs/promises";
import path from "node:path";

export type NewsFeedItem = {
  link?: string;
  source?: string;
  title?: string;
  pubDate?: string;
  headline?: string;
  blurb?: string;
  publicationAddedAt?: string;
};

type NewsFeedManifest = {
  summaries?: NewsFeedItem[];
};

function itemDateValue(item: NewsFeedItem): number {
  const raw = item.pubDate || item.publicationAddedAt;
  if (!raw) return 0;
  const ts = new Date(raw).getTime();
  return Number.isNaN(ts) ? 0 : ts;
}

export function formatFeedDate(raw?: string): string {
  if (!raw) return "APRIL 15, 2026";
  const dt = new Date(raw);
  if (Number.isNaN(dt.getTime())) return "APRIL 15, 2026";
  return dt
    .toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();
}

export async function loadLatestNewsFeedItems(): Promise<NewsFeedItem[]> {
  const ingestDir = path.join(process.cwd(), "..", "data", "news-feed-ingest");

  const dirEntries = await fs.readdir(ingestDir, { withFileTypes: true });
  const jsonNames = dirEntries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".json"))
    .map((entry) => entry.name);

  if (jsonNames.length === 0) return [];

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
  const manifest = JSON.parse(raw) as NewsFeedManifest;

  return [...(manifest.summaries || [])]
    .filter((item) => item.link && (item.headline || item.title))
    .sort((a, b) => itemDateValue(b) - itemDateValue(a));
}
