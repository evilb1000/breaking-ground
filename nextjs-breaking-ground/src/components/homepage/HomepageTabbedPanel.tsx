"use client";

import { useState } from "react";
import Link from "next/link";

// Pre-resolved, serializable tab item — the server does the Sanity image URL
// resolution and hands us plain strings/numbers so this component stays lean
// and fully client-renderable.
export type TabItem = {
  id: string;
  href: string;
  imageUrl: string | null;
  title: string;
  publishedAt?: string;
  readingTime?: number;
};

type TabKey = "profiles" | "perspectives";

type TabConfig = {
  key: TabKey;
  label: string;
  heading: string;
  items: TabItem[];
  viewAllLabel: string;
  viewAllHref: string;
  emptyMessage: string;
};

const FALLBACK_IMG = "/figma-assets/rectangle-10.png";
const CLOCK_ICON = "/figma-assets/clock-dark.svg";
const REPLY_ICON = "/figma-assets/reply-dark.svg";

function formatDate(date?: string): string {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return d
    .toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    .toUpperCase();
}

export default function HomepageTabbedPanel({
  profiles,
  perspectives,
}: {
  profiles: TabItem[];
  perspectives: TabItem[];
}) {
  const [active, setActive] = useState<TabKey>("profiles");

  const tabs: TabConfig[] = [
    {
      key: "profiles",
      label: "Profiles",
      heading: "Construction Profiles",
      items: profiles,
      viewAllLabel: "View all profiles",
      viewAllHref: "/sections/project-profiles",
      emptyMessage: "New profile articles coming soon.",
    },
    {
      key: "perspectives",
      label: "Perspectives",
      heading: "Expert Perspectives",
      items: perspectives,
      viewAllLabel: "View all perspectives",
      viewAllHref: "/sections/perspectives",
      emptyMessage: "New perspectives coming soon.",
    },
  ];

  const current = tabs.find((t) => t.key === active) ?? tabs[0];
  const items = current.items.slice(0, 3);

  return (
    <div className="absolute left-[27px] top-[526px] h-[591px] w-[916px] pt-[32px]">
      <div className="flex items-center gap-[12px]">
        {tabs.map((t) => {
          const isActive = t.key === active;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setActive(t.key)}
              className={`rounded-[4px] px-[12px] py-[8px] bg-font-roboto text-[12px] font-bold transition-colors ${
                isActive
                  ? "bg-[#ff611d] text-white"
                  : "bg-[rgba(161,161,161,0.1)] text-[#595959] hover:bg-[rgba(161,161,161,0.18)]"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <h2 className="mt-[32px] bg-type-h2 text-[#312e28]">{current.heading}</h2>

      {items.length > 0 ? (
        <div className="mt-[20px] flex gap-[17px]">
          {items.map((entry) => (
            <Link
              key={entry.id}
              href={entry.href}
              className="group block w-[287px]"
            >
              <img
                src={entry.imageUrl || FALLBACK_IMG}
                alt=""
                className="h-[190px] w-[287px] rounded-[4px] object-cover"
              />
              <div className="mt-[13px] flex flex-col gap-[5px]">
                <div className="flex items-center gap-[12px]">
                  <p className="bg-font-roboto text-[10px] leading-[24px] font-normal text-[#312e28]">
                    {formatDate(entry.publishedAt)}
                  </p>
                  <div className="flex items-center gap-[4px]">
                    <img src={CLOCK_ICON} alt="" className="h-[12px] w-[12px]" />
                    <p className="bg-font-roboto text-[10px] leading-[24px] font-normal text-[#312e28]">
                      {entry.readingTime ? `${entry.readingTime} MIN READ` : "3 MIN READ"}
                    </p>
                  </div>
                  <img src={REPLY_ICON} alt="" className="h-[14px] w-[14px]" />
                </div>
                <p className="bg-font-roboto-condensed text-[20px] leading-[26px] font-medium text-[#312e28] group-hover:underline line-clamp-3">
                  {entry.title}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="mt-[20px] bg-font-roboto text-[14px] text-[#595959] italic">
          {current.emptyMessage}
        </p>
      )}

      <Link
        href={current.viewAllHref}
        className="mt-[32px] inline-flex min-w-[156px] items-center justify-center rounded-[4px] bg-[#113251] px-[16px] py-[12px] bg-font-roboto text-[12px] font-bold text-white whitespace-nowrap"
      >
        {current.viewAllLabel}
      </Link>
    </div>
  );
}
