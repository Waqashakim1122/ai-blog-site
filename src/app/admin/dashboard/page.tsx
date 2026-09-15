import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getAllPostsForAdmin } from "@/lib/posts";
import { getCategoryBySlug } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { DeletePostButton } from "@/components/admin/DeletePostButton";
import type { PostStatus } from "@/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

const STATUS_BADGE_CLASSES: Record<PostStatus, string> = {
  draft: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  pending_review: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  published: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  rejected: "bg-red-500/15 text-red-600 dark:text-red-400",
};

const STATUS_LABELS: Record<PostStatus, string> = {
  draft: "Draft",
  pending_review: "Pending review",
  published: "Published",
  rejected: "Rejected",
};

function StatCard({
  label,
  value,
  highlighted = false,
}: {
  label: string;
  value: number;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        highlighted
          ? "border-accent bg-accent/5"
          : "border-border bg-background"
      }`}
    >
      <p
        className={`text-xs font-semibold uppercase tracking-wide ${
          highlighted ? "text-accent" : "text-muted"
        }`}
      >
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const session = await auth();
  const allPosts = await getAllPostsForAdmin();
  const posts =
    session?.user.role === "author"
      ? allPosts.filter((p) => p.author.id === session.user.id)
      : allPosts;

  const publishedCount = posts.filter((p) => p.status === "published").length;
  const draftCount = posts.filter((p) => p.status === "draft").length;
  const pendingCount = posts.filter((p) => p.status === "pending_review").length;

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

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total posts" value={posts.length} />
        <StatCard label="Published" value={publishedCount} />
        <StatCard label="Draft" value={draftCount} />
        <StatCard
          label="Pending review"
          value={pendingCount}
          highlighted={pendingCount > 0}
        />
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
                <th className="px-4 py-3.5 font-medium">Title</th>
                <th className="px-4 py-3.5 font-medium">Status</th>
                <th className="px-4 py-3.5 font-medium">Category</th>
                <th className="px-4 py-3.5 font-medium">Author</th>
                <th className="px-4 py-3.5 font-medium">Date</th>
                <th className="px-4 py-3.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => {
                const category = getCategoryBySlug(post.category);
                return (
                  <tr
                    key={post.id}
                    className="border-b border-border transition-colors last:border-0 hover:bg-surface/60"
                  >
                    <td className="max-w-[280px] truncate px-4 py-3.5 font-medium">
                      {post.title}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE_CLASSES[post.status]}`}
                      >
                        {STATUS_LABELS[post.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-muted">{category?.name || post.category}</td>
                    <td className="px-4 py-3.5 text-muted">{post.author.name}</td>
                    <td className="px-4 py-3.5 text-muted">
                      {post.publishedAt ? formatDate(post.publishedAt) : "—"}
                    </td>
                    <td className="px-4 py-3.5">
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
