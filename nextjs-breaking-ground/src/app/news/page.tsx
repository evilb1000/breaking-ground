import FigmaLandingTemplate, { type LandingItem } from "@/components/landing/FigmaLandingTemplate";
import { formatFeedDate, loadLatestNewsFeedItems } from "@/lib/newsFeed";

export const revalidate = 0;

export default async function NewsPage() {
  const feed = await loadLatestNewsFeedItems();
  const mapped: LandingItem[] = feed.map((item, idx) => ({
    id: `${item.link || "news"}-${idx}`,
    title: item.headline || item.title || "Untitled",
    summary: item.blurb || undefined,
    sourceLabel: item.source || undefined,
    href: item.link || "#",
    dateLabel: formatFeedDate(item.pubDate || item.publicationAddedAt),
    readTimeLabel: "3 MIN READ",
    external: true,
  }));

  return (
    <FigmaLandingTemplate
      pageTitle="Latest news"
      breadcrumbCurrent="News"
      tiles={mapped}
      currentListLabel="Current news"
      variant="newsFeed"
    />
  );
}
