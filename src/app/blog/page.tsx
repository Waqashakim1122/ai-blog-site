import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedPosts } from "@/lib/posts";
import { PostGrid } from "@/components/PostGrid";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CATEGORIES, SITE_NAME } from "@/lib/constants";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
  description: `All articles from ${SITE_NAME} — new AI models, tools, research, and industry news.`,
  alternates: { canonical: "/blog" },
};

export default async function BlogIndexPage() {
  const posts = await getPublishedPosts();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }]} />

      <h1 className="text-3xl font-bold tracking-tight">All articles</h1>
      <p className="mt-2 text-muted">{posts.length} articles and counting.</p>

      <div className="mt-6 mb-10 flex flex-wrap gap-2">
        <span className="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground">
          All
        </span>
        {CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            href={`/category/${c.slug}`}
            className="rounded-full border border-border px-4 py-1.5 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
          >
            {c.name}
          </Link>
        ))}
      </div>

      <PostGrid posts={posts} />
    </div>
  );
}
