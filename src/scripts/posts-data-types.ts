export interface SeedPost {
  title: string; // compelling, specific, under ~70 chars
  slug: string; // kebab-case, derived from title, unique
  excerpt: string; // 1-2 sentences, ~140-170 chars, used as card teaser
  content: string; // MARKDOWN string, 650-850 words, well-structured with 3-5 "## " subheadings, at least one bullet or numbered list somewhere across the set, no images/tables needed
  coverImageAlt: string; // descriptive alt text for a generated abstract cover graphic, e.g. "Abstract geometric illustration representing large language model architecture"
  category: "new-models" | "tools" | "research" | "open-source" | "industry-news";
  tags: string[]; // 2-5 tags, e.g. ["OpenAI", "GPT", "LLM"] or ["Anthropic", "Claude", "AI Safety"] — use real org/topic names
  authorEmail: string; // one of: "elena.voss@syntharaai.com" | "marcus.chen@syntharaai.com" | "priya.raman@syntharaai.com"
  metaTitle: string; // <= 60 chars, SEO title, can differ slightly from title
  metaDescription: string; // <= 155 chars, SEO description, compelling and accurate
  publishedAt: string; // ISO 8601 date string (e.g. "2026-06-12T09:00:00.000Z"), spread across Sept 2025 through Sept 2026, no two posts on the exact same date, roughly chronological order in the array (oldest first)
}
