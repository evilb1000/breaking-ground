import Link from "next/link";
import NavDropdown, { NavDropdownItem } from "./NavDropdown";

const FIGMA_HEADER_LOGO = "/figma-assets/bg-logo.png";

type NavItem = {
  label: string;
  href?: string;
  chevron?: boolean;
  external?: boolean;
  children?: NavDropdownItem[];
};

const NAV_ITEMS: NavItem[] = [
  { label: "Features", href: "/sections/features", chevron: false },
  {
    label: "Profiles",
    chevron: true,
    children: [
      { label: "Project Profiles", href: "/sections/project-profiles" },
      { label: "Member Profiles", href: "/sections/member-profiles" },
    ],
  },
  { label: "News", href: "/news", chevron: false },
  { label: "Perspectives", href: "/sections/perspectives", chevron: false },
  {
    label: "Trends",
    chevron: true,
    children: [
      { label: "Local", href: "/sections/local" },
      { label: "National", href: "/sections/national" },
    ],
  },
  { label: "Pricing Insights", href: "/sections/data-insights", chevron: true },
  {
    label: "Issues",
    href: "https://www.mbawpa.org/news/breaking-ground-magazine/",
    external: true,
  },
  { label: "About", href: "/about", chevron: true },
];

export default function HomepageTopRibbon() {
  return (
    <header className="w-full border-b border-[#d8d8d8] bg-[#f5f3f0] lg:bg-[#f6f6f6]">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-[20px] pb-[28px] pt-[42px] lg:hidden">
        <Link href="/" className="inline-flex h-[43px] w-[176px] items-center">
          <img
            src={FIGMA_HEADER_LOGO}
            alt="Breaking Ground"
            className="h-full w-full object-cover"
          />
        </Link>

        <div className="flex items-center gap-[12px] text-[#312e28]">
          <button
            type="button"
            aria-label="Search"
            className="inline-flex h-[36px] w-[36px] items-center justify-center"
          >
            <svg viewBox="0 0 24 24" className="h-[24px] w-[24px]" aria-hidden="true">
              <path
                d="M10.5 18a7.5 7.5 0 1 1 5.303-12.803A7.5 7.5 0 0 1 10.5 18Zm5.25-2.25L21 21"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <details className="relative">
            <summary
              aria-label="Open menu"
              className="inline-flex h-[36px] w-[36px] list-none items-center justify-center [&::-webkit-details-marker]:hidden"
            >
              <svg viewBox="0 0 24 24" className="h-[24px] w-[24px]" aria-hidden="true">
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </summary>
            <nav className="absolute right-0 top-[46px] z-50 w-[260px] rounded-[4px] border border-[#d8d8d8] bg-white p-[16px] shadow-[0_8px_24px_rgba(0,0,0,0.14)]">
              <div className="flex flex-col gap-[12px] bg-font-roboto text-[14px] text-[#312e28]">
                {NAV_ITEMS.map((item) => (
                  <div key={item.label} className="flex flex-col gap-[7px]">
                    {item.external ? (
                      <a href={item.href} target="_blank" rel="noopener noreferrer" className="font-bold">
                        {item.label}
                      </a>
                    ) : item.href ? (
                      <Link href={item.href} className="font-bold">
                        {item.label}
                      </Link>
                    ) : (
                      <p className="font-bold">{item.label}</p>
                    )}
                    {item.children?.map((child) => (
                      <Link key={child.href} href={child.href} className="pl-[12px] text-[#595959]">
                        {child.label}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            </nav>
          </details>
        </div>
      </div>

      <div className="mx-auto hidden max-w-[1440px] items-center justify-between px-4 pb-[28px] pt-[24px] md:px-[26px] md:pt-[32px] lg:flex">
        <Link href="/" className="inline-flex h-[65px] w-[266px] items-center">
          <img
            src={FIGMA_HEADER_LOGO}
            alt="Breaking Ground"
            className="h-full w-full object-cover"
          />
        </Link>

        <nav className="flex cursor-pointer items-center gap-6 text-[#312e28]">
          {NAV_ITEMS.map((item) => {
            if (item.children && item.children.length > 0) {
              return (
                <NavDropdown
                  key={item.label}
                  label={item.label}
                  items={item.children}
                  buttonClassName="cursor-pointer bg-type-nav whitespace-nowrap text-[#312e28]"
                />
              );
            }
            const chevronNode = item.chevron ? (
              <span
                className="bg-type-nav leading-none opacity-80 -mt-[1px]"
                aria-hidden="true"
              >
                ▾
              </span>
            ) : null;
            const linkClass =
              "inline-flex cursor-pointer items-center gap-[2px] bg-type-nav whitespace-nowrap";
            return (
              <span key={item.href ?? item.label} className="inline-flex cursor-pointer items-center">
                {item.external ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass}
                  >
                    <span>{item.label}</span>
                    {chevronNode}
                  </a>
                ) : (
                  <Link href={item.href ?? "#"} className={linkClass}>
                    <span>{item.label}</span>
                    {chevronNode}
                  </Link>
                )}
              </span>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
