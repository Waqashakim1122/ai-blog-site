import Image from "next/image";
import Link from "next/link";
import type { PostListItem } from "@/types";
import { getCategoryBySlug } from "@/lib/constants";
import { formatDate } from "@/lib/format";

export function PostCard({
  post,
  priority = false,
}: {
  post: PostListItem;
  priority?: boolean;
}) {
  const category = getCategoryBySlug(post.category);

  return (
    <article className="group h-full">
      <Link
        href={`/blog/${post.slug}`}
        className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-background transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/30"
      >
        <div className="relative aspect-[1200/630] w-full overflow-hidden bg-surface">
          <Image
            src={post.coverImage}
            alt={post.coverImageAlt}
            fill
            sizes="(min-width: 1024px) 380px, (min-width: 640px) 45vw, 92vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            priority={priority}
          />
        </div>
        <div className="flex flex-1 flex-col gap-2.5 p-5">
          {category && (
            <span className="text-xs font-semibold uppercase tracking-wide text-accent">
              {category.name}
            </span>
          )}
          <h3 className="text-lg font-semibold leading-snug text-foreground">{post.title}</h3>
          <p className="line-clamp-2 flex-1 text-sm text-muted">{post.excerpt}</p>
          <div className="mt-2 flex items-center gap-2 text-xs text-muted">
            <span>{post.author.name}</span>
            {post.publishedAt && (
              <>
                <span aria-hidden="true">·</span>
                <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
              </>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
