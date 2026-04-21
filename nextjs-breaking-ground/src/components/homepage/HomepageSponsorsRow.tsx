type HomepageSponsorsRowProps = {
  sponsors: string[];
};

export default function HomepageSponsorsRow({ sponsors }: HomepageSponsorsRowProps) {
  return (
    <section className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-8">
      <div className="bg-[#f5f3f0] rounded-sm px-8 py-10">
        <div className="flex flex-wrap items-center gap-4 md:gap-6 justify-center">
          {sponsors.map((sponsor) => (
            <span
              key={sponsor}
              className="bg-font-roboto inline-flex items-center justify-center rounded-full border border-[#d0ccc6] px-4 py-2 text-xs md:text-sm font-bold text-[#57534e]"
            >
              {sponsor}
            </span>
          ))}
        </div>
        <h3 className="bg-font-roboto-flex mt-8 text-center text-[36px] leading-[1.2] font-semibold text-[#312e28]">
          Our sponsors
        </h3>
        <p className="bg-font-crimson mt-3 text-center text-[#5f5b55] leading-relaxed">
          Text about how to become a sponsor or who to contact to learn more.
        </p>
      </div>

      <div className="rounded-sm bg-[#d6d6d6] min-h-[280px] flex items-center justify-center">
        <p className="text-4xl font-bold text-[#a0a0a0]">Ad space</p>
      </div>
    </section>
  );
}
