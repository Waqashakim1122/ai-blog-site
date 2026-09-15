import type { JSONContent } from "@tiptap/core";
import { SEO_CHECKLIST_CONFIG, meetsSeoPassingThreshold } from "@/lib/seo-checklist.config";

// Pure, isomorphic (no server-only imports; @tiptap/core is a type-only
// import here, erased at compile time) so it can run both in a server
// action (the publish gate) and directly in a client component (the live
// editor checklist panel).

export interface SeoChecklistInput {
  metaTitle: string;
  metaDescription: string;
  slug: string;
  content: JSONContent; // Tiptap document JSON
  coverImageAlt: string;
}

export interface SeoChecklistItemResult {
  id: string;
  label: string;
  passed: boolean;
}

export interface SeoChecklistResult {
  items: SeoChecklistItemResult[];
  passedCount: number;
  totalCount: number;
  score: number; // 0-100
  passes: boolean;
}

function extractText(node: JSONContent): string {
  const own = node.text ?? "";
  const children = (node.content ?? []).map(extractText).join(" ");
  return children ? `${own} ${children}` : own;
}

export function countWords(doc: JSONContent): number {
  return extractText(doc).trim().split(/\s+/).filter(Boolean).length;
}

function hasH2Heading(node: JSONContent): boolean {
  if (node.type === "heading" && node.attrs?.level === 2) return true;
  return (node.content ?? []).some(hasH2Heading);
}

function everyImageHasAlt(doc: JSONContent, coverImageAlt: string): boolean {
  if (!coverImageAlt.trim()) return false;

  function walk(node: JSONContent): boolean {
    if (node.type === "image" && !String(node.attrs?.alt ?? "").trim()) {
      return false;
    }
    return (node.content ?? []).every(walk);
  }

  return walk(doc);
}

export function evaluateSeoChecklist(input: SeoChecklistInput): SeoChecklistResult {
  const c = SEO_CHECKLIST_CONFIG;

  const items: SeoChecklistItemResult[] = [
    {
      id: "metaTitle",
      label: `Meta title present, under ${c.metaTitleMaxLength} characters`,
      passed:
        input.metaTitle.trim().length > 0 && input.metaTitle.trim().length <= c.metaTitleMaxLength,
    },
    {
      id: "metaDescription",
      label: `Meta description present, ${c.metaDescriptionMinLength}–${c.metaDescriptionMaxLength} characters`,
      passed:
        input.metaDescription.trim().length >= c.metaDescriptionMinLength &&
        input.metaDescription.trim().length <= c.metaDescriptionMaxLength,
    },
    {
      id: "slug",
      label: "Slug is clean (lowercase, hyphenated, no special characters)",
      passed: c.slugPattern.test(input.slug.trim()),
    },
    {
      id: "hasH2",
      label: "At least one H2 heading in the body",
      passed: hasH2Heading(input.content),
    },
    {
      id: "imageAlt",
      label: "Every image has alt text",
      passed: everyImageHasAlt(input.content, input.coverImageAlt),
    },
    {
      id: "wordCount",
      label: `Minimum word count (${c.minWordCount} words)`,
      passed: countWords(input.content) >= c.minWordCount,
    },
  ];

  const passedCount = items.filter((i) => i.passed).length;
  const totalCount = items.length;

  return {
    items,
    passedCount,
    totalCount,
    score: totalCount === 0 ? 100 : Math.round((passedCount / totalCount) * 100),
    passes: meetsSeoPassingThreshold(passedCount, totalCount),
  };
}
