"use client";

import { useEffect, useState } from "react";
import type { Heading } from "@/lib/headings";

interface TableOfContentsProps {
  headings: Heading[];
  variant: "desktop" | "mobile";
}

export function TableOfContents({ headings, variant }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    if (headings.length === 0) return;

    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  const list = (
    <ul className="flex flex-col gap-2 text-sm">
      {headings.map((h) => (
        <li key={h.id} className={h.level === 3 ? "pl-3" : ""}>
          <a
            href={`#${h.id}`}
            className={`block truncate transition-colors ${
              activeId === h.id ? "font-medium text-accent" : "text-muted hover:text-foreground"
            }`}
          >
            {h.text}
          </a>
        </li>
      ))}
    </ul>
  );

  if (variant === "mobile") {
    return (
      <details className="mb-8 rounded-lg border border-border p-3 lg:hidden">
        <summary className="cursor-pointer text-sm font-semibold">Contents</summary>
        <div className="mt-3">{list}</div>
      </details>
    );
  }

  return (
    <div>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Contents</h2>
      {list}
    </div>
  );
}
