"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createPost, updatePost, type ActionResult } from "@/lib/actions/posts";
import { previewMarkdown } from "@/lib/actions/markdown";
import { CATEGORIES } from "@/lib/constants";
import { slugify } from "@/lib/slug";
import { coverImageForSlug } from "@/lib/covers";
import type { AuthorPlain, PostPlain } from "@/types";

const COVER_OPTIONS = Array.from({ length: 15 }, (_, i) => `/images/covers/cover-${i + 1}.svg`);

interface PostFormProps {
  mode: "create" | "edit";
  post?: PostPlain;
  authors: AuthorPlain[];
  currentUser: { id: string; role: "admin" | "author" };
}

export function PostForm({ mode, post, authors, currentUser }: PostFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(post?.title || "");
  const [slug, setSlug] = useState(post?.slug || "");
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [coverImage, setCoverImage] = useState(post?.coverImage || "");
  const [metaTitle, setMetaTitle] = useState(post?.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(post?.metaDescription || "");
  const [content, setContent] = useState(post?.content || "");
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [previewHtml, setPreviewHtml] = useState("");
  const [isPreviewPending, startPreviewTransition] = useTransition();

  const action = async (
    _prevState: ActionResult | undefined,
    formData: FormData
  ): Promise<ActionResult> => {
    const result =
      mode === "create" ? await createPost(formData) : await updatePost(post!.id, formData);
    if (result.ok && mode === "edit") {
      router.refresh();
    }
    return result;
  };

  const [state, formAction, isPending] = useActionState<ActionResult | undefined, FormData>(
    action,
    undefined
  );

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function handlePreview() {
    startPreviewTransition(async () => {
      const html = await previewMarkdown(content);
      setPreviewHtml(html);
      setTab("preview");
    });
  }

  const fieldError = (name: string) => state?.fieldErrors?.[name];

  return (
    <form action={formAction} className="flex flex-col gap-8">
      {state?.error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {state.error}
        </div>
      )}

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div>
            <label htmlFor="title" className="mb-1.5 block text-sm font-medium">
              Title
            </label>
            <input
              id="title"
              name="title"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
            />
            {fieldError("title") && <p className="mt-1 text-xs text-red-500">{fieldError("title")}</p>}
          </div>

          <div>
            <label htmlFor="slug" className="mb-1.5 block text-sm font-medium">
              Slug
            </label>
            <input
              id="slug"
              name="slug"
              required
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(slugify(e.target.value));
              }}
              className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-sm font-mono outline-none focus:border-accent"
            />
            <p className="mt-1 text-xs text-muted">/blog/{slug || "your-post-slug"}</p>
            {fieldError("slug") && <p className="mt-1 text-xs text-red-500">{fieldError("slug")}</p>}
          </div>

          <div>
            <label htmlFor="excerpt" className="mb-1.5 block text-sm font-medium">
              Excerpt
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              required
              rows={2}
              defaultValue={post?.excerpt}
              maxLength={300}
              className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
            />
            {fieldError("excerpt") && (
              <p className="mt-1 text-xs text-red-500">{fieldError("excerpt")}</p>
            )}
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="content" className="block text-sm font-medium">
                Content (Markdown)
              </label>
              <div className="flex overflow-hidden rounded-md border border-border text-xs">
                <button
                  type="button"
                  onClick={() => setTab("write")}
                  className={`px-3 py-1.5 font-medium ${tab === "write" ? "bg-accent text-accent-foreground" : "hover:bg-surface"}`}
                >
                  Write
                </button>
                <button
                  type="button"
                  onClick={handlePreview}
                  disabled={isPreviewPending}
                  className={`px-3 py-1.5 font-medium ${tab === "preview" ? "bg-accent text-accent-foreground" : "hover:bg-surface"}`}
                >
                  {isPreviewPending ? "Rendering…" : "Preview"}
                </button>
              </div>
            </div>

            {tab === "write" ? (
              <textarea
                id="content"
                name="content"
                required
                rows={20}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 font-mono text-sm outline-none focus:border-accent"
              />
            ) : (
              <>
                <textarea name="content" value={content} readOnly hidden />
                <div
                  className="prose-article max-h-[520px] overflow-y-auto rounded-md border border-border bg-surface px-5 py-4"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              </>
            )}
            {fieldError("content") && (
              <p className="mt-1 text-xs text-red-500">{fieldError("content")}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-lg border border-border p-4">
            <h2 className="mb-3 text-sm font-semibold">Publish</h2>

            <label htmlFor="status" className="mb-1.5 block text-xs font-medium text-muted">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={post?.status || "draft"}
              className="mb-4 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {isPending ? "Saving…" : mode === "create" ? "Create post" : "Save changes"}
            </button>
          </div>

          <div className="rounded-lg border border-border p-4">
            <h2 className="mb-3 text-sm font-semibold">Category &amp; tags</h2>

            <label htmlFor="category" className="mb-1.5 block text-xs font-medium text-muted">
              Category
            </label>
            <select
              id="category"
              name="category"
              defaultValue={post?.category || CATEGORIES[0].slug}
              className="mb-4 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            >
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>

            <label htmlFor="tags" className="mb-1.5 block text-xs font-medium text-muted">
              Tags (comma separated)
            </label>
            <input
              id="tags"
              name="tags"
              defaultValue={post?.tags.join(", ")}
              placeholder="OpenAI, GPT, LLM"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>

          {currentUser.role === "admin" ? (
            <div className="rounded-lg border border-border p-4">
              <h2 className="mb-3 text-sm font-semibold">Author</h2>
              <select
                name="authorId"
                defaultValue={post?.author.id || currentUser.id}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
              >
                {authors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
              {fieldError("authorId") && (
                <p className="mt-1 text-xs text-red-500">{fieldError("authorId")}</p>
              )}
            </div>
          ) : (
            <input type="hidden" name="authorId" value={currentUser.id} />
          )}
        </div>
      </section>

      <section className="rounded-lg border border-border p-4">
        <h2 className="mb-3 text-sm font-semibold">Cover image</h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <label htmlFor="coverImage" className="mb-1.5 block text-xs font-medium text-muted">
              Image URL
            </label>
            <div className="mb-3 flex gap-2">
              <input
                id="coverImage"
                name="coverImage"
                required
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="/images/covers/cover-1.svg or https://…"
                className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
              />
              <button
                type="button"
                onClick={() => setCoverImage(coverImageForSlug(slug || title || "post"))}
                className="shrink-0 rounded-md border border-border px-3 py-2 text-xs font-medium hover:bg-surface"
              >
                Auto-pick
              </button>
            </div>
            {fieldError("coverImage") && (
              <p className="mb-3 text-xs text-red-500">{fieldError("coverImage")}</p>
            )}

            <label htmlFor="coverImageAlt" className="mb-1.5 block text-xs font-medium text-muted">
              Alt text <span className="text-red-500">(required)</span>
            </label>
            <input
              id="coverImageAlt"
              name="coverImageAlt"
              required
              defaultValue={post?.coverImageAlt}
              placeholder="Describe the image for screen readers and SEO"
              className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
            />
            {fieldError("coverImageAlt") && (
              <p className="mt-1 text-xs text-red-500">{fieldError("coverImageAlt")}</p>
            )}

            <p className="mt-4 mb-2 text-xs font-medium text-muted">Or pick a generated cover</p>
            <div className="grid grid-cols-5 gap-2">
              {COVER_OPTIONS.map((src) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setCoverImage(src)}
                  className={`relative aspect-[1200/630] overflow-hidden rounded-md border-2 ${
                    coverImage === src ? "border-accent" : "border-transparent"
                  }`}
                >
                  <Image src={src} alt="" fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-medium text-muted">Preview</p>
            <div className="relative aspect-[1200/630] w-full overflow-hidden rounded-md border border-border bg-surface">
              {coverImage && (
                <Image src={coverImage} alt="" fill sizes="320px" className="object-cover" />
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-border p-4">
        <h2 className="mb-3 text-sm font-semibold">SEO metadata</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="metaTitle" className="mb-1.5 block text-xs font-medium text-muted">
              Meta title
            </label>
            <input
              id="metaTitle"
              name="metaTitle"
              required
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              maxLength={70}
              className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
            />
            <p className="mt-1 text-xs text-muted">{metaTitle.length}/70</p>
            {fieldError("metaTitle") && (
              <p className="mt-1 text-xs text-red-500">{fieldError("metaTitle")}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="metaDescription"
              className="mb-1.5 block text-xs font-medium text-muted"
            >
              Meta description
            </label>
            <textarea
              id="metaDescription"
              name="metaDescription"
              required
              rows={3}
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              maxLength={170}
              className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
            />
            <p className="mt-1 text-xs text-muted">{metaDescription.length}/170</p>
            {fieldError("metaDescription") && (
              <p className="mt-1 text-xs text-red-500">{fieldError("metaDescription")}</p>
            )}
          </div>
        </div>
      </section>
    </form>
  );
}
