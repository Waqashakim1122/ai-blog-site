export interface AuthorPlain {
  id: string;
  name: string;
  email: string;
  bio: string;
  avatar: string;
  role: "admin" | "author";
}

export type PostStatus = "draft" | "pending_review" | "published" | "rejected";

export interface PostPlain {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  coverImageAlt: string;
  category: string;
  tags: string[];
  author: AuthorPlain;
  metaTitle: string;
  metaDescription: string;
  status: PostStatus;
  publishedAt: string | null;
  publishedBy: Pick<AuthorPlain, "id" | "name"> | null;
  reviewNote: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  coverImageAlt: string;
  category: string;
  tags: string[];
  author: Pick<AuthorPlain, "id" | "name" | "avatar">;
  status: PostStatus;
  publishedAt: string | null;
}
