import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

marked.setOptions({ gfm: true, breaks: false });

// Only used by the seed script now, to convert the seed articles' markdown
// source into HTML on the way to Tiptap JSON (see src/scripts/seed.ts). The
// live editor and post pages use Tiptap JSON directly — see lib/tiptap.ts.
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
