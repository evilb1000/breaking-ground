"use client";

import { useEffect, useRef, useState } from "react";

export default function RevealOnScroll({
  effect = "fade-up",
  children,
}: {
  effect?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-reveal={effect}
      data-visible={visible ? "true" : undefined}
    >
      {children}
    </div>
  );
}
