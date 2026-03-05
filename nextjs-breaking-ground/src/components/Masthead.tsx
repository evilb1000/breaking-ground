"use client";

import { useEffect, useState } from "react";

const SECTION_ITEMS = [
  "News",
  "Project Profiles",
  "Member Profiles",
  "Features",
  "Perspectives",
];

export default function Masthead() {
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
        className={`font-serif font-bold tracking-tight transition-all duration-300 ${
          isCompact ? "text-3xl md:text-4xl" : "text-4xl md:text-5xl"
        }`}
      >
        Breaking Ground
      </h1>

      <div
        className={`overflow-hidden transition-all duration-300 ${
          isCompact ? "max-h-0 opacity-0 mt-0" : "max-h-16 opacity-100 mt-4"
        }`}
      >
        <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
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
          className="text-xs md:text-sm uppercase tracking-wide text-gray-600 flex items-center justify-center gap-4 md:gap-6"
        >
          {SECTION_ITEMS.map((item) => (
            <span key={item} className="whitespace-nowrap">
              {item}
            </span>
          ))}
        </nav>
      </div>
    </header>
  );
}
