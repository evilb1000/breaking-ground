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

        <nav className="hidden cursor-pointer lg:flex items-center gap-6 text-[#312e28]">
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
