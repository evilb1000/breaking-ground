// Sponsor slot for all non-profile article types (features, perspectives,
// local, national, data insights articles, etc).
// Separate component so article sponsor artwork can be managed independently
// from profile, news feed, and data insights placements.
export default function ArticleAdUnit() {
  return (
    <div className="my-[32px] flex w-full items-center justify-center bg-[#d9d9d9] h-[361px]">
      <span
        className="bg-font-roboto text-[13px] font-semibold tracking-[0.08em] uppercase"
        style={{ color: "#adadad" }}
      >
        Advertisement
      </span>
    </div>
  );
}
