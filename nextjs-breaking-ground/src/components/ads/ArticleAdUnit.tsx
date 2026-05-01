// Sponsor slot for all non-profile article types (features, perspectives,
// local, national, data insights articles, etc).
// Separate component so article sponsor artwork can be managed independently
// from profile, news feed, and data insights placements.
import type { AdCreative } from "@/lib/ads";

export default function ArticleAdUnit({ ad }: { ad?: AdCreative | null }) {
  return (
    <div className="my-[32px] flex aspect-[686/361] w-full items-center justify-center overflow-hidden bg-[#d9d9d9] lg:aspect-auto lg:h-[361px]">
      {ad?.imageUrl && ad.clickUrl ? (
        <a href={ad.clickUrl} target="_blank" rel="noopener noreferrer" className="block h-full w-full">
          <img src={ad.imageUrl} alt={ad.altText || ad.title || ""} className="h-full w-full object-cover" />
        </a>
      ) : (
        <span
          className="bg-font-roboto text-[13px] font-semibold tracking-[0.08em] uppercase"
          style={{ color: "#adadad" }}
        >
          Advertisement
        </span>
      )}
    </div>
  );
}
