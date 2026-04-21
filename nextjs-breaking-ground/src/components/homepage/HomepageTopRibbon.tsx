import Link from "next/link";

const FIGMA_HEADER_LOGO =
  "https://www.figma.com/api/mcp/asset/961e793c-d56e-4301-a43b-7c3d4b349e0e";

const NAV_ITEMS = [
  { label: "Region", href: "/sections/local" },
  { label: "Profiles", href: "/sections/project-profiles" },
  { label: "Features", href: "/sections/features" },
  { label: "Perspectives", href: "/sections/perspectives" },
  { label: "Insights", href: "/sections/data-insights" },
  { label: "About", href: "/about" },
];

export default function HomepageTopRibbon() {
  return (
    <header className="w-full border-b border-[#d8d8d8] bg-[#f6f6f6]">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 pb-[28px] pt-[24px] md:px-[26px] md:pt-[32px]">
        <Link href="/" className="inline-flex h-[65px] w-[266px] items-center">
          <img
            src={FIGMA_HEADER_LOGO}
            alt="Breaking Ground"
            className="h-full w-full object-cover"
          />
        </Link>

        <nav
          className="bg-font-roboto-flex hidden lg:flex items-center gap-6 text-[14px] leading-[20px] text-[#312e28]"
          style={{
            fontVariationSettings:
              "'GRAD' 0, 'XOPQ' 96, 'XTRA' 468, 'YOPQ' 79, 'YTAS' 750, 'YTDE' -203, 'YTFI' 738, 'YTLC' 514, 'YTUC' 712, 'wdth' 151",
            fontWeight: 838 as any,
          }}
        >
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className="hover:opacity-70 transition-opacity whitespace-nowrap">
              {item.label}
            </Link>
          ))}
          <Link href="/news-feed" className="hover:opacity-70 transition-opacity whitespace-nowrap">
            News Feed
          </Link>
        </nav>
      </div>
    </header>
  );
}
