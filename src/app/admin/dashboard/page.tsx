import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getAllPostsForAdmin } from "@/lib/posts";
import { getCategoryBySlug } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { DeletePostButton } from "@/components/admin/DeletePostButton";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
  const session = await auth();
  const allPosts = await getAllPostsForAdmin();
  const posts =
    session?.user.role === "author"
      ? allPosts.filter((p) => p.author.id === session.user.id)
      : allPosts;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Posts</h1>
          <p className="mt-1 text-sm text-muted">{posts.length} total</p>
        </div>
        <Link
          href="/admin/posts/new"
          className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
        >
          New post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted">
          No posts yet. Create your first one.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-surface text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Author</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => {
                const category = getCategoryBySlug(post.category);
                return (
                  <tr key={post.id} className="border-b border-border last:border-0">
                    <td className="max-w-[280px] truncate px-4 py-3 font-medium">{post.title}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          post.status === "published"
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {post.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted">{category?.name || post.category}</td>
                    <td className="px-4 py-3 text-muted">{post.author.name}</td>
                    <td className="px-4 py-3 text-muted">
                      {post.publishedAt ? formatDate(post.publishedAt) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-3">
                        <Link
                          href={`/admin/posts/${post.id}/edit`}
                          className="font-medium text-accent hover:underline"
                        >
                          Edit
                        </Link>
                        <DeletePostButton postId={post.id} title={post.title} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
