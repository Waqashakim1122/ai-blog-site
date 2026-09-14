"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Author from "@/models/Author";
import Post from "@/models/Post";
import { AuthorCreateSchema, AuthorInputSchema } from "@/lib/validation";
import type { ActionResult } from "@/lib/actions/posts";

export type { ActionResult };

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Admin access required");
  }
  return session;
}

function extractBase(formData: FormData) {
  return {
    name: String(formData.get("name") || ""),
    email: String(formData.get("email") || ""),
    bio: String(formData.get("bio") || ""),
    avatar: String(formData.get("avatar") || ""),
    role: String(formData.get("role") || "author"),
  };
}

export async function createAuthor(formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const parsed = AuthorCreateSchema.safeParse({
    ...extractBase(formData),
    password: String(formData.get("password") || ""),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { ok: false, error: "Please fix the errors below.", fieldErrors };
  }

  await connectToDatabase();

  const existing = await Author.findOne({ email: parsed.data.email.toLowerCase() }).lean();
  if (existing) {
    return { ok: false, error: "An author with this email already exists.", fieldErrors: { email: "Email already in use" } };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  await Author.create({
    name: parsed.data.name,
    email: parsed.data.email.toLowerCase(),
    bio: parsed.data.bio,
    avatar: parsed.data.avatar,
    role: parsed.data.role,
    passwordHash,
  });

  revalidatePath("/admin/authors");
  return { ok: true };
}

export async function updateAuthor(authorId: string, formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const parsed = AuthorInputSchema.safeParse(extractBase(formData));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { ok: false, error: "Please fix the errors below.", fieldErrors };
  }

  await connectToDatabase();
  const existingAuthor = await Author.findById(authorId);
  if (!existingAuthor) return { ok: false, error: "Author not found." };

  const emailOwner = await Author.findOne({ email: parsed.data.email.toLowerCase() }).lean();
  if (emailOwner && emailOwner._id.toString() !== authorId) {
    return { ok: false, error: "An author with this email already exists.", fieldErrors: { email: "Email already in use" } };
  }

  existingAuthor.set({
    name: parsed.data.name,
    email: parsed.data.email.toLowerCase(),
    bio: parsed.data.bio,
    avatar: parsed.data.avatar,
    role: parsed.data.role,
  });

  const newPassword = String(formData.get("password") || "").trim();
  if (newPassword) {
    if (newPassword.length < 8) {
      return {
        ok: false,
        error: "Please fix the errors below.",
        fieldErrors: { password: "Password must be at least 8 characters" },
      };
    }
    existingAuthor.passwordHash = await bcrypt.hash(newPassword, 12);
  }

  await existingAuthor.save();

  revalidatePath("/admin/authors");
  return { ok: true };
}

export async function deleteAuthor(authorId: string): Promise<ActionResult> {
  const session = await requireAdmin();

  if (session.user.id === authorId) {
    return { ok: false, error: "You cannot delete your own account while logged in." };
  }

  await connectToDatabase();

  const postCount = await Post.countDocuments({ author: authorId });
  if (postCount > 0) {
    return {
      ok: false,
      error: `This author has ${postCount} post(s). Reassign or delete those posts first.`,
    };
  }

  await Author.findByIdAndDelete(authorId);

  revalidatePath("/admin/authors");
  return { ok: true };
}
