"use client";

import Image from "next/image";
import { X } from "lucide-react";
import type { JSONContent } from "@tiptap/core";
import { TiptapContent } from "@/components/TiptapContent";
import { countWords } from "@/lib/seo-checklist";
import { getCategoryBySlug } from "@/lib/constants";

interface PostPreviewModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  excerpt: string;
  category: string;
  coverImage: string;
  coverImageAlt: string;
  tags: string[];
  content: JSONContent;
  authorName: string;
}

// Mirrors src/app/blog/[slug]/page.tsx's structure (column width, byline
// treatment, closing author/date line) so the preview is an honest
// approximation of the real page — same TiptapContent renderer too, so
// there's no risk of the preview and the live page disagreeing on how a
// given piece of content actually renders.
export function PostPreviewModal({
  open,
  onClose,
  title,
  excerpt,
  category,
  coverImage,
  coverImageAlt,
  tags,
  content,
  authorName,
}: PostPreviewModalProps) {
  if (!open) return null;

  const categoryInfo = getCategoryBySlug(category);
  const readingTime = Math.max(1, Math.round(countWords(content) / 225));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-background">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur sm:px-6">
        <p className="text-sm font-semibold">
          Preview — this is a draft view, not the live page
        </p>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border hover:bg-surface"
          aria-label="Close preview"
        >
          <X size={16} />
        </button>
      </div>

      <article className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
        <header className="mb-6">
          {categoryInfo && (
            <span className="text-xs font-semibold uppercase tracking-wide text-accent">
              {categoryInfo.name}
            </span>
          )}
          <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            {title || "Untitled post"}
          </h1>
          {excerpt && <p className="mt-4 text-lg text-muted">{excerpt}</p>}

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted">
            <span
              className="flex h-5 w-5 items-center justify-center rounded-full bg-surface text-[10px] font-medium"
              aria-hidden="true"
            >
              {authorName.charAt(0) || "?"}
            </span>
            <span>{authorName}</span>
            <span aria-hidden="true">·</span>
            <span>{readingTime} min read</span>
          </div>
        </header>

        {coverImage && (
          <div className="relative mb-10 aspect-[1200/630] w-full overflow-hidden rounded-xl bg-surface">
            <Image
              src={coverImage}
              alt={coverImageAlt}
              fill
              sizes="(min-width: 768px) 672px, 100vw"
              className="object-cover"
            />
          </div>
        )}

        <TiptapContent doc={content} />

        <p className="mt-10 border-t border-border pt-6 text-xs text-muted">
          Written by {authorName}
        </p>

        {tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </article>
    </div>
  );
}
