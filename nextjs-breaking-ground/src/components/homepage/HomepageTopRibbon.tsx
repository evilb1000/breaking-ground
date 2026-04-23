import Link from "next/link";

const FIGMA_HEADER_LOGO = "/figma-assets/bg-logo.png";

type NavItem = {
  label: string;
  href: string;
  chevron?: boolean;
  external?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Features", href: "/sections/features", chevron: false },
  { label: "Profiles", href: "/sections/project-profiles", chevron: true },
  { label: "News", href: "/news", chevron: false },
  { label: "Perspectives", href: "/sections/perspectives", chevron: false },
  { label: "Region", href: "/sections/local", chevron: true },
  { label: "Insights", href: "/sections/data-insights", chevron: true },
  {
    label: "Issues",
    href: "https://www.mbawpa.org/news/breaking-ground-magazine/",
    external: true,
  },
  { label: "About", href: "/about", chevron: true },
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

        <nav className="hidden lg:flex items-center gap-6 text-[#312e28]">
          {NAV_ITEMS.map((item) => (
            <span key={item.href} className="inline-flex items-center gap-[2px]">
              {item.external ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-type-nav hover:opacity-70 transition-opacity whitespace-nowrap"
                >
                  {item.label}
                </a>
              ) : (
                <Link href={item.href} className="bg-type-nav hover:opacity-70 transition-opacity whitespace-nowrap">
                  {item.label}
                </Link>
              )}
              {item.chevron ? (
                <span className="bg-type-nav leading-none opacity-80 -mt-[1px]" aria-hidden="true">▾</span>
              ) : null}
            </span>
          ))}
          <span className="text-[18px] leading-none ml-1" aria-hidden="true">⌕</span>
        </nav>
      </div>
    </header>
  );
}
