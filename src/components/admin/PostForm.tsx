"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { JSONContent } from "@tiptap/core";
import { createPost, updatePost, type ActionResult } from "@/lib/actions/posts";
import { CATEGORIES } from "@/lib/constants";
import { slugify } from "@/lib/slug";
import { coverImageForSlug } from "@/lib/covers";
import { evaluateSeoChecklist } from "@/lib/seo-checklist";
import { formatDate } from "@/lib/format";
import { uploadImage } from "@/lib/upload";
import { ReviewActions } from "@/components/admin/ReviewActions";
import { SeoChecklistPanel } from "@/components/admin/SeoChecklistPanel";
import { TiptapEditor } from "@/components/admin/TiptapEditor";
import { PostPreviewModal } from "@/components/admin/PostPreviewModal";
import type { AuthorPlain, PostPlain, PostStatus } from "@/types";

const AUTOSAVE_INTERVAL_MS = 20_000;

const COVER_OPTIONS = Array.from({ length: 15 }, (_, i) => `/images/covers/cover-${i + 1}.svg`);

const EMPTY_DOC: JSONContent = { type: "doc", content: [{ type: "paragraph" }] };

const STATUS_LABELS: Record<PostStatus, string> = {
  draft: "Draft",
  pending_review: "Pending review",
  published: "Published",
  rejected: "Rejected",
};

interface PostFormProps {
  mode: "create" | "edit";
  post?: PostPlain;
  authors: AuthorPlain[];
  currentUser: { id: string; role: "admin" | "author" };
}

function parseTagsClient(raw: string): string[] {
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export function PostForm({ mode, post, authors, currentUser }: PostFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(post?.title || "");
  const [slug, setSlug] = useState(post?.slug || "");
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [coverImage, setCoverImage] = useState(post?.coverImage || "");
  const [coverImageAlt, setCoverImageAlt] = useState(post?.coverImageAlt || "");
  const [metaTitle, setMetaTitle] = useState(post?.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(post?.metaDescription || "");
  const [content, setContent] = useState<JSONContent>(post?.content || EMPTY_DOC);
  const [isCoverUploading, setIsCoverUploading] = useState(false);
  const [coverUploadError, setCoverUploadError] = useState("");
  const [slugNotice, setSlugNotice] = useState("");
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Snapshot of every field's value as of the last successful save (manual
  // or autosaved) — compared against the live DOM form to decide whether
  // there's anything worth autosaving or warning about on navigation.
  // Reading straight from the DOM (rather than mirroring every field into
  // React state) also covers the uncontrolled inputs (excerpt, category,
  // tags, authorId) without converting them.
  const lastSavedSnapshotRef = useRef<string>("");
  const [autosaveStatus, setAutosaveStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );
  const [isAutosaving, startAutosaveTransition] = useTransition();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewFields, setPreviewFields] = useState({ excerpt: "", category: "", tags: [] as string[] });

  function getFormSnapshot(): string {
    if (!formRef.current) return "";
    const fd = new FormData(formRef.current);
    const obj: Record<string, string> = {};
    for (const [key, value] of fd.entries()) {
      if (typeof value === "string") obj[key] = value;
    }
    return JSON.stringify(obj);
  }

  // Baseline snapshot once the form has actually mounted.
  useEffect(() => {
    lastSavedSnapshotRef.current = getFormSnapshot();
  }, []);

  // Unsaved-changes warning: covers tab close, refresh, and typing a new
  // URL. Re-reads the DOM fresh at the moment of navigation rather than a
  // stale piece of state, so it's always accurate.
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (getFormSnapshot() !== lastSavedSnapshotRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const action = async (
    _prevState: ActionResult | undefined,
    formData: FormData
  ): Promise<ActionResult> => {
    const snapshotBeforeSave = getFormSnapshot();
    const result =
      mode === "create" ? await createPost(formData) : await updatePost(post!.id, formData);

    if (result.ok) {
      lastSavedSnapshotRef.current = snapshotBeforeSave;
      if (result.resolvedSlug && result.resolvedSlug !== slug) {
        setSlug(result.resolvedSlug);
        setSlugNotice(`The slug "${slug}" was already taken — used "${result.resolvedSlug}" instead.`);
      } else {
        setSlugNotice("");
      }
      if (mode === "edit") router.refresh();
    }
    return result;
  };

  const [state, formAction, isPending] = useActionState<ActionResult | undefined, FormData>(
    action,
    undefined
  );

  // Autosave: edit mode only (never implicitly creates a post), always as
  // a draft update regardless of the Publish/Draft selector — autosave
  // must never trigger a publish attempt on its own.
  useEffect(() => {
    if (mode !== "edit" || !post) return;

    const interval = setInterval(() => {
      if (isPending || isAutosaving) return;

      const snapshot = getFormSnapshot();
      if (snapshot === lastSavedSnapshotRef.current) return;

      startAutosaveTransition(async () => {
        setAutosaveStatus("saving");
        const fd = new FormData(formRef.current!);
        fd.set("status", "draft");
        const result = await updatePost(post.id, fd);
        if (result.ok) {
          lastSavedSnapshotRef.current = snapshot;
          if (result.resolvedSlug && result.resolvedSlug !== slug) setSlug(result.resolvedSlug);
          setAutosaveStatus("saved");
          router.refresh();
        } else {
          setAutosaveStatus("error");
        }
      });
    }, AUTOSAVE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [mode, post, isPending, isAutosaving, slug, router]);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function handleCoverImageSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setCoverUploadError("");
    setIsCoverUploading(true);
    try {
      const url = await uploadImage(file);
      setCoverImage(url);
    } catch (err) {
      setCoverUploadError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setIsCoverUploading(false);
    }
  }

  function handleOpenPreview() {
    const fd = formRef.current ? new FormData(formRef.current) : null;
    setPreviewFields({
      excerpt: String(fd?.get("excerpt") || ""),
      category: String(fd?.get("category") || CATEGORIES[0].slug),
      tags: parseTagsClient(String(fd?.get("tags") || "")),
    });
    setIsPreviewOpen(true);
  }

  const fieldError = (name: string) => state?.fieldErrors?.[name];

  // Live checklist, recomputed on every render from the controlled form
  // state — updates as the author types, before anything is even saved.
  const liveChecklist = evaluateSeoChecklist({
    metaTitle,
    metaDescription,
    slug,
    content,
    coverImageAlt,
  });

  // Failed checklist items for a post currently sitting in pending_review —
  // recomputed live from the saved post rather than stored, so it always
  // reflects the post's current content (Phase 1: "so admin can see exactly
  // why it was held back").
  const failedChecklistItems =
    post && (post.status === "pending_review" || post.status === "rejected")
      ? evaluateSeoChecklist(post).items.filter((i) => !i.passed)
      : [];

  return (
    <>
      {post?.status === "pending_review" && (
        <div className="mb-6 rounded-lg border border-blue-500/30 bg-blue-500/5 p-4">
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
            Pending review
          </p>
          <p className="mt-1 text-sm text-muted">
            This post didn&apos;t pass the SEO checklist, so it was submitted for review instead
            of publishing.
          </p>
          {failedChecklistItems.length > 0 && (
            <ul className="mt-2 list-disc pl-5 text-sm text-muted">
              {failedChecklistItems.map((item) => (
                <li key={item.id}>{item.label}</li>
              ))}
            </ul>
          )}
          {currentUser.role === "admin" && (
            <div className="mt-4">
              <ReviewActions postId={post.id} />
            </div>
          )}
        </div>
      )}

      {post?.status === "rejected" && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/5 p-4">
          <p className="text-sm font-semibold text-red-600 dark:text-red-400">
            This post needs changes
          </p>
          {post.reviewNote && <p className="mt-1 text-sm text-foreground">{post.reviewNote}</p>}
          {failedChecklistItems.length > 0 && (
            <>
              <p className="mt-3 text-xs font-medium text-muted">
                It also didn&apos;t pass these checklist items:
              </p>
              <ul className="mt-1 list-disc pl-5 text-sm text-muted">
                {failedChecklistItems.map((item) => (
                  <li key={item.id}>{item.label}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      <form ref={formRef} action={formAction} className="flex flex-col gap-8">
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
            {slugNotice && <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">{slugNotice}</p>}
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
            <label className="mb-1.5 block text-sm font-medium">Content</label>
            <input type="hidden" name="content" value={JSON.stringify(content)} />
            <TiptapEditor content={content} onChange={setContent} />
            {fieldError("content") && (
              <p className="mt-1 text-xs text-red-500">{fieldError("content")}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-lg border border-border p-4">
            <h2 className="mb-3 text-sm font-semibold">Publish</h2>

            {post && (
              <p className="mb-1 text-xs text-muted">
                Currently: <span className="font-medium text-foreground">{STATUS_LABELS[post.status]}</span>
              </p>
            )}

            {mode === "edit" && (
              <p className="mb-3 text-xs text-muted" aria-live="polite">
                {autosaveStatus === "saving" && "Autosaving…"}
                {autosaveStatus === "saved" && "All changes saved"}
                {autosaveStatus === "error" && (
                  <span className="text-red-500">Autosave failed — your last manual save is still safe</span>
                )}
                {autosaveStatus === "idle" && " "}
              </p>
            )}

            <label htmlFor="status" className="mb-1.5 block text-xs font-medium text-muted">
              When you save, set this post to
            </label>
            <select
              id="status"
              name="status"
              defaultValue={post?.status === "published" ? "published" : "draft"}
              className="mb-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            >
              <option value="draft">Draft (just save)</option>
              <option value="published">Publish</option>
            </select>

            {currentUser.role === "author" && (
              <p className="mb-4 text-xs text-muted">
                Publishing only goes live immediately if it passes the SEO checklist below;
                otherwise it&apos;s sent to an admin for review.
              </p>
            )}
            {currentUser.role === "admin" && (
              <p className="mb-4 text-xs text-muted">
                As an admin, Publish always goes live immediately.
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {isPending ? "Saving…" : mode === "create" ? "Create post" : "Save changes"}
            </button>

            <button
              type="button"
              onClick={handleOpenPreview}
              className="mt-2 w-full rounded-md border border-border px-4 py-2.5 text-sm font-medium hover:bg-surface"
            >
              Preview
            </button>

            {post?.status === "published" && post.publishedBy && post.publishedAt && (
              <p className="mt-3 text-xs text-muted">
                Published by {post.publishedBy.name} on {formatDate(post.publishedAt)}
              </p>
            )}
          </div>

          <SeoChecklistPanel result={liveChecklist} />

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
            <label className="mb-1.5 block text-xs font-medium text-muted">Featured image</label>
            <input type="hidden" name="coverImage" value={coverImage} />
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => coverFileInputRef.current?.click()}
                disabled={isCoverUploading}
                className="rounded-md border border-border px-3 py-2 text-xs font-medium hover:bg-surface disabled:opacity-60"
              >
                {isCoverUploading ? "Uploading…" : "Upload image"}
              </button>
              <input
                ref={coverFileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleCoverImageSelected}
              />
              <button
                type="button"
                onClick={() => setCoverImage(coverImageForSlug(slug || title || "post"))}
                className="shrink-0 rounded-md border border-border px-3 py-2 text-xs font-medium hover:bg-surface"
              >
                Use a generated placeholder instead
              </button>
            </div>
            {coverUploadError && <p className="mb-3 text-xs text-red-500">{coverUploadError}</p>}
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
              value={coverImageAlt}
              onChange={(e) => setCoverImageAlt(e.target.value)}
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

      <PostPreviewModal
        open={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={title}
        excerpt={previewFields.excerpt}
        category={previewFields.category}
        coverImage={coverImage}
        coverImageAlt={coverImageAlt}
        tags={previewFields.tags}
        content={content}
        authorName={post?.author.name || "You"}
      />
    </>
  );
}
