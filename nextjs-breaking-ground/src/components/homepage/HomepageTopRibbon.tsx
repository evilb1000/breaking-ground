import Link from "next/link";

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
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-3 md:px-6">
        <Link href="/" className="inline-flex items-center">
          <span className="bg-font-roboto-flex text-[36px] leading-[0.9] font-semibold uppercase tracking-tight text-[#1f1d1a]">
            Breaking
            <br />
            Ground
          </span>
        </Link>

        <nav className="bg-font-roboto hidden lg:flex items-center gap-6 text-[12px] font-semibold text-[#2a2825]">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className="hover:opacity-70 transition-opacity">
              {item.label}
            </Link>
          ))}
          <Link href="/news-feed" className="hover:opacity-70 transition-opacity">
            News Feed
          </Link>
        </nav>
      </div>
    </header>
  );
}
