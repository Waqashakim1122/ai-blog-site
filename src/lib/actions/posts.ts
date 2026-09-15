"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Post from "@/models/Post";
import { PostInputSchema } from "@/lib/validation";
import { getCategoryBySlug } from "@/lib/constants";
import { evaluateSeoChecklist } from "@/lib/seo-checklist";
import type { PostStatus } from "@/types";

export interface ActionResult {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

/**
 * Resolves what a save actually does to a post's status, given who's saving,
 * what they asked for (the "draft"/"published" intent from the form), and
 * whether it passes the SEO checklist gate.
 *
 * Rules (Phase 1):
 * - "draft" intent always just saves as draft, for any role, no gate, and
 *   never touches reviewNote — a draft save (including Phase 3b's future
 *   autosave) is not the author "acting on" rejection feedback, so it must
 *   not silently wipe it before they've even read it.
 * - Admin "published" intent always publishes immediately, no exceptions.
 * - Author "published" intent publishes only if the checklist passes;
 *   otherwise it's routed to pending_review instead of publishing.
 * - reviewNote only clears on an explicit "published" intent (a real
 *   resubmission click), regardless of the outcome of that attempt.
 */
function resolveStatusOnSave(params: {
  role: "admin" | "author";
  requestedIntent: "draft" | "published";
  checklistPasses: boolean;
}): { status: PostStatus; clearReviewNote: boolean } {
  const { role, requestedIntent, checklistPasses } = params;

  if (requestedIntent === "draft") {
    return { status: "draft", clearReviewNote: false };
  }

  if (role === "admin") {
    return { status: "published", clearReviewNote: true };
  }

  const nextStatus: PostStatus = checklistPasses ? "published" : "pending_review";
  return { status: nextStatus, clearReviewNote: true };
}

function parseTags(raw: string): string[] {
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 10);
}

async function requireSession() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Not authenticated");
  }
  return session;
}

function extractInput(formData: FormData) {
  return {
    title: String(formData.get("title") || ""),
    slug: String(formData.get("slug") || ""),
    excerpt: String(formData.get("excerpt") || ""),
    content: String(formData.get("content") || ""),
    coverImage: String(formData.get("coverImage") || ""),
    coverImageAlt: String(formData.get("coverImageAlt") || ""),
    category: String(formData.get("category") || ""),
    tags: parseTags(String(formData.get("tags") || "")),
    authorId: String(formData.get("authorId") || ""),
    metaTitle: String(formData.get("metaTitle") || ""),
    metaDescription: String(formData.get("metaDescription") || ""),
    status: String(formData.get("status") || "draft"),
  };
}

export async function createPost(formData: FormData): Promise<ActionResult> {
  const session = await requireSession();
  const raw = extractInput(formData);

  if (session.user.role === "author") {
    raw.authorId = session.user.id;
  }

  const parsed = PostInputSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { ok: false, error: "Please fix the errors below.", fieldErrors };
  }

  if (!getCategoryBySlug(parsed.data.category)) {
    return { ok: false, error: "Invalid category." };
  }

  await connectToDatabase();

  const existing = await Post.findOne({ slug: parsed.data.slug }).lean();
  if (existing) {
    return { ok: false, error: "A post with this slug already exists.", fieldErrors: { slug: "Slug already in use" } };
  }

  const checklistPasses =
    parsed.data.status === "published"
      ? evaluateSeoChecklist(parsed.data).passes
      : true;

  const { status } = resolveStatusOnSave({
    role: session.user.role,
    requestedIntent: parsed.data.status,
    checklistPasses,
  });

  const doc = await Post.create({
    ...parsed.data,
    author: parsed.data.authorId,
    status,
    publishedAt: status === "published" ? new Date() : null,
    publishedBy: status === "published" ? session.user.id : null,
  });

  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/admin/dashboard");
  redirect(`/admin/posts/${doc._id.toString()}/edit`);
}

export async function updatePost(postId: string, formData: FormData): Promise<ActionResult> {
  const session = await requireSession();
  const raw = extractInput(formData);

  await connectToDatabase();
  const existingPost = await Post.findById(postId);
  if (!existingPost) {
    return { ok: false, error: "Post not found." };
  }

  if (session.user.role === "author" && existingPost.author.toString() !== session.user.id) {
    return { ok: false, error: "You can only edit your own posts." };
  }

  if (session.user.role === "author") {
    raw.authorId = existingPost.author.toString();
  }

  const parsed = PostInputSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { ok: false, error: "Please fix the errors below.", fieldErrors };
  }

  const slugOwner = await Post.findOne({ slug: parsed.data.slug }).lean();
  if (slugOwner && slugOwner._id.toString() !== postId) {
    return { ok: false, error: "A post with this slug already exists.", fieldErrors: { slug: "Slug already in use" } };
  }

  const currentStatus = existingPost.status;

  const checklistPasses =
    parsed.data.status === "published"
      ? evaluateSeoChecklist(parsed.data).passes
      : true;

  const { status, clearReviewNote } = resolveStatusOnSave({
    role: session.user.role,
    requestedIntent: parsed.data.status,
    checklistPasses,
  });

  const enteringPublished = status === "published" && currentStatus !== "published";

  existingPost.set({
    ...parsed.data,
    author: parsed.data.authorId,
    status,
    publishedAt: enteringPublished ? new Date() : existingPost.publishedAt,
    publishedBy: enteringPublished ? session.user.id : existingPost.publishedBy,
    reviewNote: clearReviewNote ? "" : existingPost.reviewNote,
  });

  await existingPost.save();

  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath(`/blog/${parsed.data.slug}`);
  revalidatePath("/admin/dashboard");

  return { ok: true };
}

export async function approvePost(postId: string): Promise<ActionResult> {
  const session = await requireSession();
  if (session.user.role !== "admin") {
    return { ok: false, error: "Only admins can approve posts." };
  }

  await connectToDatabase();
  const existingPost = await Post.findById(postId);
  if (!existingPost) return { ok: false, error: "Post not found." };
  if (existingPost.status !== "pending_review") {
    return { ok: false, error: "This post isn't awaiting review." };
  }

  existingPost.set({
    status: "published",
    publishedAt: new Date(),
    publishedBy: session.user.id,
    reviewNote: "",
  });
  await existingPost.save();

  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath(`/blog/${existingPost.slug}`);
  revalidatePath("/admin/dashboard");

  return { ok: true };
}

export async function rejectPost(postId: string, reviewNote: string): Promise<ActionResult> {
  const session = await requireSession();
  if (session.user.role !== "admin") {
    return { ok: false, error: "Only admins can reject posts." };
  }

  const trimmedNote = reviewNote.trim();
  if (!trimmedNote) {
    return { ok: false, error: "Add a note explaining what needs to change." };
  }

  await connectToDatabase();
  const existingPost = await Post.findById(postId);
  if (!existingPost) return { ok: false, error: "Post not found." };
  if (existingPost.status !== "pending_review") {
    return { ok: false, error: "This post isn't awaiting review." };
  }

  existingPost.status = "rejected";
  existingPost.reviewNote = trimmedNote;
  await existingPost.save();

  revalidatePath("/admin/dashboard");

  return { ok: true };
}

export async function deletePost(postId: string): Promise<ActionResult> {
  const session = await requireSession();
  await connectToDatabase();

  const existingPost = await Post.findById(postId);
  if (!existingPost) return { ok: false, error: "Post not found." };

  if (session.user.role === "author" && existingPost.author.toString() !== session.user.id) {
    return { ok: false, error: "You can only delete your own posts." };
  }

  await existingPost.deleteOne();

  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/admin/dashboard");

  return { ok: true };
}
