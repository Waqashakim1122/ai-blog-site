import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getAllAuthors } from "@/lib/authors";
import { PostForm } from "@/components/admin/PostForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "New Post",
  robots: { index: false, follow: false },
};

export default async function NewPostPage() {
  const session = await auth();
  const authors = session?.user.role === "admin" ? await getAllAuthors() : [];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">New post</h1>
      <PostForm
        mode="create"
        authors={authors}
        currentUser={{ id: session!.user.id, role: session!.user.role }}
      />
    </div>
  );
}
