"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Post from "@/models/Post";
import { PostInputSchema } from "@/lib/validation";
import { getCategoryBySlug } from "@/lib/constants";

export interface ActionResult {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
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

  const doc = await Post.create({
    ...parsed.data,
    author: parsed.data.authorId,
    publishedAt: parsed.data.status === "published" ? new Date() : null,
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

  const wasPublished = existingPost.status === "published";
  const willBePublished = parsed.data.status === "published";

  existingPost.set({
    ...parsed.data,
    author: parsed.data.authorId,
    publishedAt:
      willBePublished && !wasPublished
        ? new Date()
        : willBePublished
        ? existingPost.publishedAt || new Date()
        : existingPost.publishedAt,
  });

  await existingPost.save();

  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath(`/blog/${parsed.data.slug}`);
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
