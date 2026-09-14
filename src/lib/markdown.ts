import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

marked.setOptions({ gfm: true, breaks: false });

export function markdownToSafeHtml(markdown: string): string {
  const rawHtml = marked.parse(markdown, { async: false }) as string;

  return sanitizeHtml(rawHtml, {
    allowedTags: [
      "h1", "h2", "h3", "h4", "p", "a", "ul", "ol", "li", "strong", "em",
      "blockquote", "code", "pre", "img", "hr", "br", "table", "thead",
      "tbody", "tr", "th", "td", "del", "sup", "sub",
    ],
    allowedAttributes: {
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "title", "loading"],
      code: ["class"],
      pre: ["class"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
    },
  });
}

export function estimateReadingTime(markdown: string): number {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 225));
}

export function wordCount(markdown: string): number {
  return markdown.trim().split(/\s+/).filter(Boolean).length;
}
