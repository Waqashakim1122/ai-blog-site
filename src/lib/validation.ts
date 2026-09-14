import { z } from "zod";
import { CATEGORIES } from "@/lib/constants";

const CATEGORY_SLUGS = CATEGORIES.map((c) => c.slug) as [string, ...string[]];

export const PostInputSchema = z.object({
  title: z.string().trim().min(3, "Title is required").max(160),
  slug: z
    .string()
    .trim()
    .min(3, "Slug is required")
    .max(160)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase, kebab-case"),
  excerpt: z.string().trim().min(20, "Excerpt should be at least 20 characters").max(300),
  content: z.string().trim().min(200, "Content should be at least 200 characters"),
  coverImage: z.string().trim().min(1, "Cover image is required"),
  coverImageAlt: z.string().trim().min(5, "Alt text is required for accessibility and SEO"),
  category: z.enum(CATEGORY_SLUGS),
  tags: z.array(z.string().trim().min(1)).max(10),
  authorId: z.string().trim().min(1, "Author is required"),
  metaTitle: z.string().trim().min(10, "Meta title is required").max(70),
  metaDescription: z.string().trim().min(20, "Meta description is required").max(170),
  status: z.enum(["draft", "published"]),
});

export type PostInput = z.infer<typeof PostInputSchema>;

export const AuthorInputSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(200),
  bio: z.string().trim().max(500).optional().default(""),
  avatar: z.string().trim().max(500).optional().default(""),
  role: z.enum(["admin", "author"]),
});

export type AuthorInput = z.infer<typeof AuthorInputSchema>;

export const AuthorCreateSchema = AuthorInputSchema.extend({
  password: z.string().min(8, "Password must be at least 8 characters").max(200),
});
