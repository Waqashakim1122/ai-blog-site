import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPublishedSlugs, getPostBySlug, getRelatedPosts } from "@/lib/posts";
import { TiptapContent } from "@/components/TiptapContent";
import { TableOfContents } from "@/components/TableOfContents";
import { extractHeadings } from "@/lib/headings";
import { countWords } from "@/lib/seo-checklist";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { PostGrid } from "@/components/PostGrid";
import { getCategoryBySlug, SITE_NAME, SITE_URL } from "@/lib/constants";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const slugs = await getAllPublishedSlugs().catch(() => []);
  return slugs.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  const url = `${SITE_URL}/blog/${post.slug}`;

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    authors: [{ name: post.author.name }],
    openGraph: {
      type: "article",
      url,
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      images: [{ url: post.coverImage, width: 1200, height: 630, alt: post.coverImageAlt }],
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: post.updatedAt,
      authors: [post.author.name],
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      images: [post.coverImage],
    },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const category = getCategoryBySlug(post.category);
  const headings = extractHeadings(post.content);
  const readingTime = Math.max(1, Math.round(countWords(post.content) / 225));
  const related = await getRelatedPosts(post, 3);
  const url = `${SITE_URL}/blog/${post.slug}`;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.metaDescription || post.excerpt,
    image: [post.coverImage.startsWith("http") ? post.coverImage : `${SITE_URL}${post.coverImage}`],
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Person",
      name: post.author.name,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.svg` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };

  const byline = (
    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted">
      {post.author.avatar ? (
        <Image
          src={post.author.avatar}
          alt=""
          width={20}
          height={20}
          className="rounded-full"
        />
      ) : (
        <span
          className="flex h-5 w-5 items-center justify-center rounded-full bg-surface text-[10px] font-medium"
          aria-hidden="true"
        >
          {post.author.name.charAt(0)}
        </span>
      )}
      <span>{post.author.name}</span>
      {post.publishedAt && (
        <>
          <span aria-hidden="true">·</span>
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
        </>
      )}
      <span aria-hidden="true">·</span>
      <span>{readingTime} min read</span>
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <JsonLd data={articleJsonLd} />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
          ...(category ? [{ label: category.name, href: `/category/${category.slug}` }] : []),
          { label: post.title, href: `/blog/${post.slug}` },
        ]}
      />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,700px)_1fr] lg:gap-16">
        <article className="min-w-0 max-w-2xl">
          <header className="mb-6">
            {category && (
              <Link
                href={`/category/${category.slug}`}
                className="inline-block w-fit rounded-full bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent transition-colors hover:bg-accent/15"
              >
                {category.name}
              </Link>
            )}
            <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              {post.title}
            </h1>
            <p className="mt-4 text-lg text-muted">{post.excerpt}</p>
            {byline}
          </header>

          <TableOfContents headings={headings} variant="mobile" />

          <div className="relative mb-10 aspect-[1200/630] w-full overflow-hidden rounded-xl bg-surface">
            <Image
              src={post.coverImage}
              alt={post.coverImageAlt}
              fill
              sizes="(min-width: 1024px) 700px, 100vw"
              className="object-cover"
              priority
            />
          </div>

          <TiptapContent doc={post.content} />

          <p className="mt-10 border-t border-border pt-6 text-xs text-muted">
            Written by {post.author.name}
            {post.publishedAt && <> · Published {formatDate(post.publishedAt)}</>}
          </p>

          {post.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {related.length > 0 && (
            <div className="mt-16 lg:hidden">
              <h2 className="mb-6 text-xl font-bold tracking-tight">Related articles</h2>
              <PostGrid posts={related} />
            </div>
          )}
        </article>

        <aside className="hidden lg:block">
          <div className="sticky top-24 flex flex-col gap-10">
            <TableOfContents headings={headings} variant="desktop" />

            {related.length > 0 && (
              <div>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
                  Related
                </h2>
                <div className="flex flex-col gap-4">
                  {related.map((r) => (
                    <Link key={r.id} href={`/blog/${r.slug}`} className="group flex gap-3">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-surface">
                        <Image
                          src={r.coverImage}
                          alt={r.coverImageAlt}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                      <p className="text-sm font-medium leading-snug transition-colors group-hover:text-accent">
                        {r.title}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
