import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getPostByIdForAdmin } from "@/lib/posts";
import { getAllAuthors } from "@/lib/authors";
import { PostForm } from "@/components/admin/PostForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit Post",
  robots: { index: false, follow: false },
};

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const post = await getPostByIdForAdmin(id);
  if (!post) notFound();

  if (session!.user.role === "author" && post.author.id !== session!.user.id) {
    redirect("/admin/dashboard");
  }

  const authors = session!.user.role === "admin" ? await getAllAuthors() : [];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Edit post</h1>
      <PostForm
        mode="edit"
        post={post}
        authors={authors}
        currentUser={{ id: session!.user.id, role: session!.user.role }}
      />
    </div>
  );
}
