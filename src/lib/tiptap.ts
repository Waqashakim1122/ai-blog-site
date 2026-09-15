import type { JSONContent } from "@tiptap/core";
import { generateHTML } from "@tiptap/html/server";
import sanitizeHtml from "sanitize-html";
import { getTiptapExtensions } from "@/lib/tiptap-extensions";
import { countWords } from "@/lib/seo-checklist";

const TEXT_ALIGN_VALUES = [/^left$/, /^right$/, /^center$/, /^justify$/];

/**
 * Renders Tiptap JSON to HTML and sanitizes it before it ever reaches a
 * page. This is the one place a solo-author blog is still exposed to XSS —
 * the JSON itself came from an authenticated editor, but sanitizing the
 * rendered output is cheap, correct hygiene regardless of who's trusted.
 */
export function renderTiptapToSafeHtml(doc: JSONContent): string {
  const rawHtml = generateHTML(doc, getTiptapExtensions());

  return sanitizeHtml(rawHtml, {
    allowedTags: [
      "h2", "h3", "p", "a", "ul", "ol", "li", "strong", "em", "s",
      "blockquote", "code", "pre", "img", "hr", "br",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "title", "loading"],
      p: ["style"],
      h2: ["style"],
      h3: ["style"],
    },
    allowedStyles: {
      p: { "text-align": TEXT_ALIGN_VALUES },
      h2: { "text-align": TEXT_ALIGN_VALUES },
      h3: { "text-align": TEXT_ALIGN_VALUES },
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
    },
  });
}

export function estimateReadingTime(doc: JSONContent): number {
  return Math.max(1, Math.round(countWords(doc) / 225));
}
