// Sponsor slot for member profile and project profile articles.
// Separate component so profile sponsor artwork can be managed independently
// from other article types, news feed, and data insights placements.
import type { AdCreative } from "@/lib/ads";

export default function ProfileAdUnit({ ad }: { ad?: AdCreative | null }) {
  return (
    <div className="my-[32px] flex w-full items-center justify-center bg-[#d9d9d9] h-[361px]">
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
