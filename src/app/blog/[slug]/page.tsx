import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPublishedSlugs, getPostBySlug, getRelatedPosts } from "@/lib/posts";
import { renderTiptapToSafeHtml, estimateReadingTime } from "@/lib/tiptap";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { PostGrid } from "@/components/PostGrid";
import { FadeIn } from "@/components/FadeIn";
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
  const html = renderTiptapToSafeHtml(post.content);
  const readingTime = estimateReadingTime(post.content);
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

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <JsonLd data={articleJsonLd} />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
          ...(category ? [{ label: category.name, href: `/category/${category.slug}` }] : []),
          { label: post.title, href: `/blog/${post.slug}` },
        ]}
      />

      <header className="mb-8">
        {category && (
          <Link
            href={`/category/${category.slug}`}
            className="text-xs font-semibold uppercase tracking-wide text-accent"
          >
            {category.name}
          </Link>
        )}
        <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          {post.title}
        </h1>
        <p className="mt-4 text-lg text-muted">{post.excerpt}</p>

        <div className="mt-6 flex items-center gap-3 border-y border-border py-4 text-sm text-muted">
          {post.author.avatar ? (
            <Image
              src={post.author.avatar}
              alt={post.author.name}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground"
              aria-hidden="true"
            >
              {post.author.name.charAt(0)}
            </div>
          )}
          <div>
            <p className="font-medium text-foreground">{post.author.name}</p>
            <p>
              {post.publishedAt && <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>}
              {" · "}
              {readingTime} min read
            </p>
          </div>
        </div>
      </header>

      <div className="relative mb-10 aspect-[1200/630] w-full overflow-hidden rounded-xl bg-surface">
        <Image
          src={post.coverImage}
          alt={post.coverImageAlt}
          fill
          sizes="(min-width: 768px) 768px, 100vw"
          className="object-cover"
          priority
        />
      </div>

      <div className="prose-article" dangerouslySetInnerHTML={{ __html: html }} />

      {post.tags.length > 0 && (
        <div className="mt-10 flex flex-wrap gap-2 border-t border-border pt-6">
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
        <FadeIn className="mt-16">
          <h2 className="mb-6 text-xl font-bold tracking-tight">Related articles</h2>
          <PostGrid posts={related} />
        </FadeIn>
      )}
    </article>
  );
}
