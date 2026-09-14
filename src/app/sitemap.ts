import type { MetadataRoute } from "next";
import { getAllPublishedSlugs } from "@/lib/posts";
import { CATEGORIES, SITE_URL } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/blog`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/contact`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/privacy-policy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/terms-of-service`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/disclaimer`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = CATEGORIES.map((c) => ({
    url: `${SITE_URL}/category/${c.slug}`,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  let postRoutes: MetadataRoute.Sitemap = [];
  try {
    const slugs = await getAllPublishedSlugs();
    postRoutes = slugs.map((s) => ({
      url: `${SITE_URL}/blog/${s.slug}`,
      lastModified: s.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch {
    postRoutes = [];
  }

  return [...staticRoutes, ...categoryRoutes, ...postRoutes];
}
