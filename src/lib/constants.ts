export const SITE_NAME = "Synthara AI";
export const SITE_TAGLINE = "AI News, Models & Research — Explained Clearly";
export const SITE_DESCRIPTION =
  "Synthara AI covers the latest AI model releases, tools, research breakthroughs, and industry news — clear, original reporting on OpenAI, Anthropic, Google DeepMind, Meta, and the open-source AI ecosystem.";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";
export const TWITTER_HANDLE = "@syntharaai";

export interface Category {
  slug: string;
  name: string;
  description: string;
}

export const CATEGORIES: Category[] = [
  {
    slug: "new-models",
    name: "New Models",
    description: "Announcements and breakdowns of newly released AI models.",
  },
  {
    slug: "tools",
    name: "Tools",
    description: "AI-powered tools, products, and developer platforms worth knowing about.",
  },
  {
    slug: "research",
    name: "Research",
    description: "Notable AI research papers, benchmarks, and technical breakthroughs.",
  },
  {
    slug: "open-source",
    name: "Open Source",
    description: "Open-weight models, libraries, and community-driven AI projects.",
  },
  {
    slug: "industry-news",
    name: "Industry News",
    description: "Funding, partnerships, policy, and business news from the AI industry.",
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export const FOOTER_LINKS = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-of-service", label: "Terms of Service" },
  { href: "/disclaimer", label: "Disclaimer" },
];
