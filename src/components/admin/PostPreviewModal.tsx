"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import type { JSONContent } from "@tiptap/core";
import { previewPostContent } from "@/lib/actions/preview";
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
  const [html, setHtml] = useState("");
  // Tracks which `content` the current `html` was rendered from, so
  // "loading" is derived rather than a separate piece of state that would
  // need setting synchronously at the top of the effect below.
  const [renderedFor, setRenderedFor] = useState<JSONContent | null>(null);
  const isLoading = open && renderedFor !== content;

  useEffect(() => {
    if (!open) return;
    previewPostContent(content).then((result) => {
      setHtml(result);
      setRenderedFor(content);
    });
  }, [open, content]);

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

      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <header className="mb-8">
          {categoryInfo && (
            <span className="text-xs font-semibold uppercase tracking-wide text-accent">
              {categoryInfo.name}
            </span>
          )}
          <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            {title || "Untitled post"}
          </h1>
          {excerpt && <p className="mt-4 text-lg text-muted">{excerpt}</p>}

          <div className="mt-6 flex items-center gap-3 border-y border-border py-4 text-sm text-muted">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground"
              aria-hidden="true"
            >
              {authorName.charAt(0) || "?"}
            </div>
            <div>
              <p className="font-medium text-foreground">{authorName}</p>
              <p>{readingTime} min read</p>
            </div>
          </div>
        </header>

        {coverImage && (
          <div className="relative mb-10 aspect-[1200/630] w-full overflow-hidden rounded-xl bg-surface">
            <Image
              src={coverImage}
              alt={coverImageAlt}
              fill
              sizes="(min-width: 768px) 768px, 100vw"
              className="object-cover"
            />
          </div>
        )}

        {isLoading ? (
          <p className="text-sm text-muted">Rendering preview…</p>
        ) : (
          <div className="prose-article" dangerouslySetInnerHTML={{ __html: html }} />
        )}

        {tags.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2 border-t border-border pt-6">
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
