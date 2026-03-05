import Link from "next/link";

const sectionLinks = [
  { label: "Features", href: "#" },
  { label: "Project Profiles", href: "#" },
  { label: "Member Profiles", href: "#" },
  { label: "News", href: "#" },
  { label: "Perspectives", href: "#" },
  { label: "Opinion", href: "#" },
];

const aboutLinks = [
  { label: "About Breaking Ground", href: "#" },
  { label: "Sponsors", href: "#" },
  { label: "Contact", href: "#" },
  { label: "Submit a Story", href: "#" },
];

export default function Footer() {
  return (
    <footer className="w-full bg-black text-white mt-10 md:mt-20">
      <div className="w-full px-4 md:px-12 lg:px-24 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-12">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight">Breaking Ground</h2>
            <p className="mt-4 text-sm uppercase tracking-wide text-white/80">
              Construction • Industry • Power • Western PA
            </p>
          </div>

          <div>
            <h3 className="font-serif text-xl font-semibold">Sections</h3>
            <ul className="mt-5 space-y-3">
              {sectionLinks.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="font-sans text-sm tracking-wide hover:opacity-70 transition-opacity">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-xl font-semibold">About</h3>
            <ul className="mt-5 space-y-3">
              {aboutLinks.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="font-sans text-sm tracking-wide hover:opacity-70 transition-opacity">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/20 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-[11px] uppercase tracking-wide text-white/80">
          <p>© 2026 Breaking Ground</p>
          <div className="flex items-center gap-3">
            <Link href="#" className="hover:opacity-70 transition-opacity">
              Privacy Policy
            </Link>
            <span aria-hidden="true">|</span>
            <Link href="#" className="hover:opacity-70 transition-opacity">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
