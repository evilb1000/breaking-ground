"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

export type HomepageTabItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  imageSrc?: string | null;
  imageAlt: string;
};

type HomepageTabbedPanelProps = {
  profiles: HomepageTabItem[];
  issues: HomepageTabItem[];
  perspectives: HomepageTabItem[];
};

type TabKey = "profiles" | "issues" | "perspectives";

const TAB_LABELS: Record<TabKey, string> = {
  profiles: "Profiles",
  issues: "Issues",
  perspectives: "Perspectives",
};

export default function HomepageTabbedPanel({
  profiles,
  issues,
  perspectives,
}: HomepageTabbedPanelProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("profiles");

  const activeItems = useMemo(() => {
    if (activeTab === "issues") return issues;
    if (activeTab === "perspectives") return perspectives;
    return profiles;
  }, [activeTab, issues, perspectives, profiles]);

  return (
    <section className="bg-[#f5f3f0] rounded-[4px] p-7">
      <div className="flex items-center gap-2">
        {(Object.keys(TAB_LABELS) as TabKey[]).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`bg-font-roboto rounded px-3 py-2 text-[12px] font-bold uppercase tracking-[0.08em] transition-colors ${
                isActive
                  ? "bg-[#ff611d] text-white"
                  : "bg-[rgba(161,161,161,0.1)] text-[#595959] hover:bg-[rgba(161,161,161,0.22)]"
              }`}
            >
              {TAB_LABELS[tab]}
            </button>
          );
        })}
      </div>

      <h3 className="bg-type-h2 mt-6 text-[#312e28]">
        Breaking Ground {TAB_LABELS[activeTab]}
      </h3>

      <div className="mt-6 space-y-4">
        {activeItems.slice(0, 4).map((item) => (
          <Link
            key={`${activeTab}-${item.id}`}
            href={item.href}
            className="grid grid-cols-[140px_1fr] gap-[13px] items-center group"
          >
            <div className="h-[100px] overflow-hidden rounded-[4px] bg-gray-200">
              {item.imageSrc ? (
                <img
                  src={item.imageSrc}
                  alt={item.imageAlt}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              ) : null}
            </div>
            <div className="min-w-0 text-[#312e28]">
              <p className="bg-type-h3 group-hover:underline">
                {item.title}
              </p>
              <p className="bg-type-body mt-1 line-clamp-3">
                {item.description}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <button
        type="button"
        className="bg-font-roboto mt-6 inline-flex items-center justify-center rounded bg-[#113251] px-4 py-3 text-[12px] font-bold uppercase tracking-[0.08em] text-white"
      >
        View all {activeTab}
      </button>
    </section>
  );
}
