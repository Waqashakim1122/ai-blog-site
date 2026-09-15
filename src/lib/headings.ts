import type { JSONContent } from "@tiptap/core";
import { extractText } from "@/lib/seo-checklist";

// Isomorphic (no server-only imports) — used both to build the table of
// contents and, with the exact same traversal order, to assign matching
// ids to the h2/h3 elements TiptapContent renders.

export interface Heading {
  level: 2 | 3;
  text: string;
  id: string;
}

function slugifyHeadingText(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "section"
  );
}

export function extractHeadings(doc: JSONContent): Heading[] {
  const headings: Heading[] = [];
  const seen = new Map<string, number>();

  function assignId(base: string): string {
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}-${count + 1}`;
  }

  function walk(node: JSONContent) {
    const level = node.attrs?.level;
    if (node.type === "heading" && (level === 2 || level === 3)) {
      const text = extractText(node).trim();
      if (text) {
        headings.push({ level, text, id: assignId(slugifyHeadingText(text)) });
      }
    }
    (node.content ?? []).forEach(walk);
  }

  walk(doc);
  return headings;
}
