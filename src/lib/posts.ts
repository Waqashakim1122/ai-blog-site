import { connectToDatabase } from "@/lib/db";
import Post from "@/models/Post";
import "@/models/Author";
import type { PostPlain, PostListItem, AuthorPlain } from "@/types";
import type { Types } from "mongoose";

interface LeanAuthor {
  _id: Types.ObjectId;
  name: string;
  email: string;
  bio?: string;
  avatar?: string;
  role: "admin" | "author";
}

interface LeanPost {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  coverImageAlt: string;
  category: string;
  tags: string[];
  author: LeanAuthor;
  metaTitle: string;
  metaDescription: string;
  status: "draft" | "published";
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

function serializeAuthor(a: LeanAuthor): AuthorPlain {
  return {
    id: a._id.toString(),
    name: a.name,
    email: a.email,
    bio: a.bio || "",
    avatar: a.avatar || "",
    role: a.role,
  };
}

function serializePost(p: LeanPost): PostPlain {
  return {
    id: p._id.toString(),
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    content: p.content,
    coverImage: p.coverImage,
    coverImageAlt: p.coverImageAlt,
    category: p.category,
    tags: p.tags || [],
    author: serializeAuthor(p.author),
    metaTitle: p.metaTitle,
    metaDescription: p.metaDescription,
    status: p.status,
    publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

function toListItem(p: PostPlain): PostListItem {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    coverImage: p.coverImage,
    coverImageAlt: p.coverImageAlt,
    category: p.category,
    tags: p.tags,
    author: { id: p.author.id, name: p.author.name, avatar: p.author.avatar },
    status: p.status,
    publishedAt: p.publishedAt,
  };
}

export async function getPublishedPosts(opts?: {
  category?: string;
  limit?: number;
  skip?: number;
}): Promise<PostListItem[]> {
  await connectToDatabase();
  const query: Record<string, unknown> = { status: "published" };
  if (opts?.category) query.category = opts.category;

  let q = Post.find(query).sort({ publishedAt: -1 }).populate("author").lean<LeanPost[]>();
  if (opts?.skip) q = q.skip(opts.skip);
  if (opts?.limit) q = q.limit(opts.limit);

  const docs = await q;
  return docs.map((d) => toListItem(serializePost(d)));
}

export async function getFeaturedPost(): Promise<PostListItem | null> {
  const [latest] = await getPublishedPosts({ limit: 1 });
  return latest || null;
}

export async function getPostBySlug(slug: string): Promise<PostPlain | null> {
  await connectToDatabase();
  const doc = await Post.findOne({ slug, status: "published" })
    .populate("author")
    .lean<LeanPost | null>();
  return doc ? serializePost(doc) : null;
}

export async function getPostBySlugForAdmin(slug: string): Promise<PostPlain | null> {
  await connectToDatabase();
  const doc = await Post.findOne({ slug }).populate("author").lean<LeanPost | null>();
  return doc ? serializePost(doc) : null;
}

export async function getPostByIdForAdmin(id: string): Promise<PostPlain | null> {
  await connectToDatabase();
  const doc = await Post.findById(id).populate("author").lean<LeanPost | null>();
  return doc ? serializePost(doc) : null;
}

export async function getRelatedPosts(post: PostPlain, limit = 3): Promise<PostListItem[]> {
  await connectToDatabase();
  const docs = await Post.find({
    status: "published",
    slug: { $ne: post.slug },
    $or: [{ category: post.category }, { tags: { $in: post.tags } }],
  })
    .sort({ publishedAt: -1 })
    .limit(limit)
    .populate("author")
    .lean<LeanPost[]>();

  if (docs.length < limit) {
    const existingIds = docs.map((d) => d._id.toString());
    const fallback = await Post.find({
      status: "published",
      slug: { $ne: post.slug },
      _id: { $nin: existingIds },
    })
      .sort({ publishedAt: -1 })
      .limit(limit - docs.length)
      .populate("author")
      .lean<LeanPost[]>();
    docs.push(...fallback);
  }

  return docs.map((d) => toListItem(serializePost(d)));
}

export async function getAllPostsForAdmin(): Promise<PostListItem[]> {
  await connectToDatabase();
  const docs = await Post.find({})
    .sort({ createdAt: -1 })
    .populate("author")
    .lean<LeanPost[]>();
  return docs.map((d) => toListItem(serializePost(d)));
}

export async function getAllPublishedSlugs(): Promise<{ slug: string; updatedAt: string }[]> {
  await connectToDatabase();
  const docs = await Post.find({ status: "published" })
    .select("slug updatedAt")
    .lean<{ slug: string; updatedAt: Date }[]>();
  return docs.map((d) => ({ slug: d.slug, updatedAt: d.updatedAt.toISOString() }));
}

export async function countPublishedInCategory(category: string): Promise<number> {
  await connectToDatabase();
  return Post.countDocuments({ status: "published", category });
}
