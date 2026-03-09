"use client";

import { useRef } from "react";
import Link from "next/link";

type StoryCard = {
  _id: string;
  slug?: { current?: string };
  title: string;
  dek?: string;
  category?: string;
  authorName?: string;
  imageAlt: string;
  imageSrc?: string;
};

type Props = {
  stories: StoryCard[];
};

export default function MoreStoriesCarousel({ stories }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollByPage = (direction: "left" | "right") => {
    const el = trackRef.current;
    if (!el) return;
    const distance = Math.max(320, Math.floor(el.clientWidth * 0.9));
    el.scrollBy({ left: direction === "left" ? -distance : distance, behavior: "smooth" });
  };

  return (
    <div className="relative" aria-label="More stories carousel">
      <div
        ref={trackRef}
        className="overflow-x-auto overscroll-x-contain scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex gap-4 md:gap-8 snap-x snap-mandatory">
          {stories.map((article) => (
            <Link
              href={`/${article.slug?.current ?? ""}`}
              className="group flex flex-col snap-start shrink-0 w-[85%] sm:w-[70%] md:w-[48%] lg:w-[32%]"
              key={article._id}
            >
              <div className="w-full h-[280px] md:h-[390px] overflow-hidden rounded-md mb-4 bg-gray-100">
                {article.imageSrc ? (
                  <img
                    src={article.imageSrc}
                    alt={article.imageAlt}
                    className="w-full h-full object-cover object-center transition-transform duration-300 ease-out group-hover:scale-[1.03] group-hover:opacity-95"
                  />
                ) : null}
              </div>
              <div className="flex flex-col flex-1">
                <h4 className="font-serif text-2xl md:text-4xl font-semibold leading-snug group-hover:underline line-clamp-2 min-h-[calc(2*1.375em)]">
                  {article.title}
                </h4>
                <p className="text-gray-600 text-lg md:text-2xl leading-relaxed mt-2 line-clamp-2">
                  {article.dek || "\u00A0"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute left-0 right-0 top-0 h-[280px] md:h-[390px] z-10 hidden md:block">
        <button
          type="button"
          onClick={() => scrollByPage("left")}
          className="pointer-events-auto absolute -left-12 top-0 h-full w-10 border border-gray-400/45 bg-gray-700/18 backdrop-blur-md text-white text-2xl leading-none hover:bg-gray-700/28 transition-colors flex items-center justify-center"
          aria-label="Scroll more stories left"
        >
          ←
        </button>
        <button
          type="button"
          onClick={() => scrollByPage("right")}
          className="pointer-events-auto absolute -right-12 top-0 h-full w-10 border border-gray-400/45 bg-gray-700/18 backdrop-blur-md text-white text-2xl leading-none hover:bg-gray-700/28 transition-colors flex items-center justify-center"
          aria-label="Scroll more stories right"
        >
          →
        </button>
      </div>
    </div>
  );
}
