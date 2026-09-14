import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getFeaturedPost, getPublishedPosts } from "@/lib/posts";
import { PostGrid } from "@/components/PostGrid";
import { FadeIn } from "@/components/FadeIn";
import { CATEGORIES, SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/constants";
import { getCategoryBySlug } from "@/lib/constants";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `${SITE_NAME} — ${SITE_TAGLINE}`,
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const featured = await getFeaturedPost();
  const latest = await getPublishedPosts({ limit: 10 });
  const rest = featured ? latest.filter((p) => p.id !== featured.id) : latest;
  const category = featured ? getCategoryBySlug(featured.category) : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <section className="mb-14">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Latest in AI</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Clear, original reporting on new AI models, developer tools, research, and the
          business of artificial intelligence.
        </p>
      </section>

      {featured && (
        <section className="mb-16" aria-label="Featured post">
          <Link
            href={`/blog/${featured.slug}`}
            className="group grid grid-cols-1 gap-6 overflow-hidden rounded-2xl border border-border bg-background transition-shadow hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/30 lg:grid-cols-2"
          >
            <div className="relative aspect-[1200/630] w-full overflow-hidden bg-surface lg:aspect-auto">
              <Image
                src={featured.coverImage}
                alt={featured.coverImageAlt}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                priority
              />
            </div>
            <div className="flex flex-col justify-center gap-4 p-6 sm:p-10">
              {category && (
                <span className="w-fit text-xs font-semibold uppercase tracking-wide text-accent">
                  {category.name}
                </span>
              )}
              <h2 className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
                {featured.title}
              </h2>
              <p className="text-muted">{featured.excerpt}</p>
              <div className="flex items-center gap-2 text-sm text-muted">
                <span>{featured.author.name}</span>
                {featured.publishedAt && (
                  <>
                    <span aria-hidden="true">·</span>
                    <time dateTime={featured.publishedAt}>
                      {formatDate(featured.publishedAt)}
                    </time>
                  </>
                )}
              </div>
            </div>
          </Link>
        </section>
      )}

      <section className="mb-14">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
          Browse by category
        </h2>
        <div className="flex flex-wrap gap-2">
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
      </section>

      <section>
        <FadeIn>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight">Latest posts</h2>
            <Link href="/blog" className="text-sm font-medium text-accent hover:underline">
              View all →
            </Link>
          </div>
        </FadeIn>
        <PostGrid posts={rest.slice(0, 9)} />
      </section>
    </div>
  );
}
