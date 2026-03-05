"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const SECTION_ITEMS = [
  "News",
  "Project Profiles",
  "Member Profiles",
  "Features",
  "Perspectives",
];

export default function Masthead({ homeHref }: { homeHref?: string } = {}) {
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    // Prevent browser restoring prior scroll position on hard refresh.
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    const navEntry = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;
    if (navEntry?.type === "reload") {
      requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" }));
    }

    return () => {
      window.history.scrollRestoration = previous;
    };
  }, []);

  useEffect(() => {
    const quickFoldPx = 14;

    const onScroll = () => {
      setIsCompact(window.scrollY > quickFoldPx);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/75 backdrop-blur-md text-center px-6 py-4 shadow-[0_10px_30px_-24px_rgba(0,0,0,0.45)] transition-all duration-300">
      <h1
        className={`font-serif font-bold uppercase tracking-[0.06em] transition-all duration-300 ${
          isCompact ? "text-3xl md:text-4xl" : "text-4xl md:text-5xl"
        }`}
      >
        {homeHref ? (
          <Link href={homeHref} className="hover:opacity-70 transition-opacity">
            Breaking Ground
          </Link>
        ) : (
          "Breaking Ground"
        )}
      </h1>

      <div
        className={`overflow-hidden transition-all duration-300 ${
          isCompact ? "max-h-0 opacity-0 mt-0" : "max-h-16 opacity-100 mt-4"
        }`}
      >
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
          Construction • Industry • Power • Western PA
        </p>
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 ${
          isCompact ? "max-h-16 opacity-100 mt-3" : "max-h-0 opacity-0 mt-0"
        }`}
      >
        <nav
          aria-label="Section navigation"
          className="text-xs md:text-sm font-semibold uppercase tracking-wide text-gray-600 flex items-center justify-center"
        >
          {SECTION_ITEMS.map((item, idx) => (
            <span key={item} className="inline-flex items-center whitespace-nowrap">
              {idx > 0 ? <span className="mx-4 md:mx-5 text-gray-500" aria-hidden="true">•</span> : null}
              <span>{item}</span>
            </span>
          ))}
        </nav>
      </div>
    </header>
  );
}
