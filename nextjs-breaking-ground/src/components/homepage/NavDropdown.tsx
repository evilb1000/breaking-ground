"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export type NavDropdownItem = { label: string; href: string };

// Reusable hover/click-driven nav dropdown used by the top ribbons. Server
// components can compose it freely; the dropdown itself is fully client-side
// and self-manages open state, outside-click, escape-to-close, and a small
// hover-out grace period so the menu doesn't snap shut while the cursor is
// crossing the gap between the button and the panel.
export default function NavDropdown({
  label,
  items,
  buttonClassName = "bg-type-nav whitespace-nowrap text-[#312e28]",
}: {
  label: string;
  items: NavDropdownItem[];
  buttonClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  return (
    <div
      ref={containerRef}
      className="relative inline-flex cursor-pointer items-center"
      onMouseEnter={() => {
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex cursor-pointer items-center gap-[2px] ${buttonClassName}`}
      >
        <span>{label}</span>
        <span
          className="inline-flex h-[24px] w-[24px] items-center justify-center"
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" className="h-[24px] w-[24px] opacity-80">
            <path
              d="M7 10l5 5 5-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute left-0 top-full z-50 mt-[8px] min-w-[180px] rounded-[4px] border border-[#d8d8d8] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
        >
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block cursor-pointer whitespace-nowrap bg-font-roboto px-[16px] py-[10px] text-[14px] text-[#312e28] hover:bg-[#f5f3f0]"
            >
              {item.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
