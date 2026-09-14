import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedPosts } from "@/lib/posts";
import { PostGrid } from "@/components/PostGrid";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CATEGORIES, getCategoryBySlug } from "@/lib/constants";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return {};

  return {
    title: category.name,
    description: `${category.description} Browse the latest ${category.name.toLowerCase()} articles.`,
    alternates: { canonical: `/category/${category.slug}` },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const posts = await getPublishedPosts({ category: category.slug });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: category.name, href: `/category/${category.slug}` },
        ]}
      />

      <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
      <p className="mt-2 max-w-2xl text-muted">{category.description}</p>

      <div className="mt-6 mb-10 flex flex-wrap gap-2">
        <Link
          href="/blog"
          className="rounded-full border border-border px-4 py-1.5 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
        >
          All
        </Link>
        {CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            href={`/category/${c.slug}`}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              c.slug === category.slug
                ? "bg-accent text-accent-foreground"
                : "border border-border hover:border-accent hover:text-accent"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      <PostGrid posts={posts} />
    </div>
  );
}
