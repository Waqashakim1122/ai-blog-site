// Single source of truth for the SEO checklist rules used by both the
// author/admin publish gate (Phase 1) and the live editor checklist panel
// (Phase 2). Tune thresholds here only — nothing else should hardcode these
// numbers inline.

export const SEO_CHECKLIST_CONFIG = {
  minWordCount: 600,
  metaTitleMaxLength: 60,
  metaDescriptionMinLength: 120,
  metaDescriptionMaxLength: 160,
  slugPattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
} as const;

/**
 * How many checklist items must pass for a post to be considered SEO-ready.
 * "all" = every item must pass (strict). A number between 0 and 1 would be
 * read as a fraction (e.g. 0.8 = 80% of items must pass). Kept as "all"
 * while the site is small and under AdSense review — change this one value
 * to relax it later.
 */
export type SeoPassingThreshold = "all" | number;

export const SEO_CHECKLIST_PASSING_THRESHOLD: SeoPassingThreshold = "all";

export function meetsSeoPassingThreshold(passedCount: number, totalCount: number): boolean {
  if (totalCount === 0) return true;
  if (SEO_CHECKLIST_PASSING_THRESHOLD === "all") {
    return passedCount === totalCount;
  }
  return passedCount / totalCount >= SEO_CHECKLIST_PASSING_THRESHOLD;
}
