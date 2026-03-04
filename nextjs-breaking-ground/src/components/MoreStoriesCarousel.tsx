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
        <div className="flex gap-8 snap-x snap-mandatory">
          {stories.map((article) => (
            <Link
              href={`/${article.slug?.current ?? ""}`}
              className="group block snap-start shrink-0 w-[85%] sm:w-[70%] md:w-[48%] lg:w-[32%]"
              key={article._id}
            >
              <div className="w-full h-[390px] overflow-hidden rounded-md mb-4 bg-gray-100">
                {article.imageSrc ? (
                  <img
                    src={article.imageSrc}
                    alt={article.imageAlt}
                    className="w-full h-full object-cover object-center transition-transform duration-300 ease-out group-hover:scale-[1.03] group-hover:opacity-95"
                  />
                ) : null}
              </div>
              <h4 className="font-serif text-4xl font-semibold leading-snug group-hover:underline">
                {article.title}
              </h4>
              {article.dek ? (
                <p className="text-gray-600 text-2xl leading-relaxed mt-2 line-clamp-2">{article.dek}</p>
              ) : null}
            </Link>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-0 right-0 z-10 hidden md:block">
        <button
          type="button"
          onClick={() => scrollByPage("left")}
          className="pointer-events-auto absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full border border-gray-300 bg-white/95 text-gray-700 shadow-sm hover:bg-white"
          aria-label="Scroll more stories left"
        >
          ←
        </button>
        <button
          type="button"
          onClick={() => scrollByPage("right")}
          className="pointer-events-auto absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full border border-gray-300 bg-white/95 text-gray-700 shadow-sm hover:bg-white"
          aria-label="Scroll more stories right"
        >
          →
        </button>
      </div>
    </div>
  );
}
