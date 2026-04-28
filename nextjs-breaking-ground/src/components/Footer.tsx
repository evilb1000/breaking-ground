import Link from "next/link";

// Site-wide footer, Figma-designed (dark #312e28 panel with logo, link
// columns, and social icons). Mounted globally in `src/app/layout.tsx`, so
// every page gets it automatically.
//
// This replaced the legacy pre-Figma footer in the same file on 2026-04-23.
// The prior version lived in this same module with a black bg and plain
// link grid; it was retired as part of the homepage-hero-v2 rollout.

const sectionLinksLeft = [
  { label: "Local", href: "/sections/local" },
  { label: "National", href: "/sections/national" },
  { label: "Project profiles", href: "/sections/project-profiles" },
  { label: "Member profiles", href: "/sections/member-profiles" },
];

const sectionLinksRight = [
  { label: "Features", href: "/sections/features" },
  { label: "Perspectives", href: "/sections/perspectives" },
  { label: "Pricing Insights", href: "/sections/data-insights" },
];

const aboutLinks = [
  { label: "About Breaking Ground", href: "/about" },
  { label: "Sponsors", href: "/sponsors" },
  { label: "Contact", href: "/contact" },
];

const socialLinks = [
  { href: "https://www.facebook.com/", icon: "/figma-assets/facebook-white.svg", label: "Facebook" },
  { href: "https://www.linkedin.com/", icon: "/figma-assets/linkedin-white.svg", label: "LinkedIn" },
  { href: "https://www.youtube.com/", icon: "/figma-assets/youtube-white.svg", label: "YouTube" },
  { href: "https://www.instagram.com/", icon: "/figma-assets/instagram-white.svg", label: "Instagram" },
];

export default function Footer() {
  const mobileSectionLinks = [...sectionLinksLeft, ...sectionLinksRight];

  return (
    <footer className="w-full bg-[#312e28] text-white">
      <div className="mx-auto w-full max-w-[1440px] px-[24px] py-[48px] md:px-[48px]">
        <div className="flex flex-col items-start gap-[45px] md:flex-row md:flex-wrap md:gap-[48px]">
          <div className="w-[240px] md:w-[373px]">
            <img
              src="/figma-assets/bg-logo.png"
              alt="Breaking Ground"
              className="h-[48px] w-[198px] object-contain [filter:brightness(0)_invert(1)] md:h-[58px] md:w-[240px]"
            />
            <p className="bg-font-roboto mt-[15px] text-[10px]">
              WESTERN PA • CONSTRUCTION • INDUSTRY • INFRASTRUCTURE
            </p>
          </div>

          <nav
            aria-label="Site sections"
            className="flex gap-[58px] bg-font-roboto text-[14px] md:hidden"
          >
            <ul className="w-[110px] space-y-[12px]">
              {mobileSectionLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="w-[145px] space-y-[12px]">
              {aboutLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav
            aria-label="Site sections"
            className="hidden w-[606px] gap-[58px] bg-font-roboto text-[14px] md:flex"
          >
            <ul className="space-y-[12px]">
              {sectionLinksLeft.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="transition-opacity hover:opacity-70">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="space-y-[12px]">
              {sectionLinksRight.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="transition-opacity hover:opacity-70">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="space-y-[12px]">
              {aboutLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="transition-opacity hover:opacity-70">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:ml-auto">
            <div className="flex items-center gap-[19px]">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="transition-opacity hover:opacity-70"
                >
                  <img src={s.icon} alt="" className="h-[36px] w-[36px]" />
                </a>
              ))}
            </div>
            <p className="bg-font-helvetica mt-[18px] text-[12px] md:mt-[14px]">
              © 2026 Breaking Ground &nbsp;&nbsp;&nbsp;
              <Link href="#" className="hover:opacity-70">Privacy</Link>
              &nbsp;&nbsp;&nbsp;
              <Link href="#" className="hover:opacity-70">Terms</Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
