import { SEO_CHECKLIST_CONFIG, meetsSeoPassingThreshold } from "@/lib/seo-checklist.config";

// Pure, isomorphic (no server-only imports) so it can run both in a server
// action (the publish gate) and directly in a client component (the live
// editor checklist panel, added in Phase 2).

export interface SeoChecklistInput {
  metaTitle: string;
  metaDescription: string;
  slug: string;
  content: string; // markdown
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

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function hasH2Heading(markdown: string): boolean {
  return /^##\s+\S/m.test(markdown);
}

function everyImageHasAlt(markdown: string, coverImageAlt: string): boolean {
  if (!coverImageAlt.trim()) return false;

  const imagePattern = /!\[([^\]]*)\]\([^)]*\)/g;
  let match: RegExpExecArray | null;
  while ((match = imagePattern.exec(markdown)) !== null) {
    if (!match[1].trim()) return false;
  }
  return true;
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
