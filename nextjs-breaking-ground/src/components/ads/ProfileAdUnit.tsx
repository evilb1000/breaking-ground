// Sponsor slot for member profile and project profile articles.
// Separate component so profile sponsor artwork can be managed independently
// from other article types, news feed, and data insights placements.
export default function ProfileAdUnit() {
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
