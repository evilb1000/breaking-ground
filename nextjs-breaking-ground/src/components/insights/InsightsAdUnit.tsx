import type { AdCreative } from "@/lib/ads";

export default function InsightsAdUnit({ ad }: { ad?: AdCreative | null }) {
  return (
    <div className="my-[32px] flex w-full justify-center">
      <div
        className="flex h-[361px] w-[728px] max-w-full shrink-0 items-center justify-center bg-[#d9d9d9]"
        aria-label="Advertisement"
      >
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
    </div>
  );
}
