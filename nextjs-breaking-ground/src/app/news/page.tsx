import FigmaLandingTemplate, { type LandingItem } from "@/components/landing/FigmaLandingTemplate";
import { formatFeedDate, loadLatestNewsFeedItems } from "@/lib/newsFeed";

export const revalidate = 0;
const NEWS_PER_PAGE = 10;

type NewsPageProps = {
  searchParams?: Promise<{
    page?: string;
  }>;
};

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const feed = await loadLatestNewsFeedItems();
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const rawPage = Number.parseInt(resolvedSearchParams.page || "1", 10);
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
  const totalPages = Math.max(1, Math.ceil(mapped.length / NEWS_PER_PAGE));
  const currentPage = Number.isFinite(rawPage) ? Math.min(Math.max(rawPage, 1), totalPages) : 1;
  const start = (currentPage - 1) * NEWS_PER_PAGE;
  const pagedItems = mapped.slice(start, start + NEWS_PER_PAGE);
  const buildPageHref = (page: number) => (page === 1 ? "/news" : `/news?page=${page}`);

  return (
    <FigmaLandingTemplate
      pageTitle=""
      breadcrumbCurrent="News"
      tiles={pagedItems}
      currentListLabel="Latest Construction and Development News"
      variant="newsFeed"
      adSurface="news"
      pagination={{
        currentPage,
        totalPages,
        buildHref: buildPageHref,
      }}
    />
  );
}
