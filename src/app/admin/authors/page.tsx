import Link from "next/link";
import type { Metadata } from "next";
import { getAllAuthors } from "@/lib/authors";
import { DeleteAuthorButton } from "@/components/admin/DeleteAuthorButton";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Authors",
  robots: { index: false, follow: false },
};

export default async function AdminAuthorsPage() {
  const authors = await getAllAuthors();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Authors</h1>
          <p className="mt-1 text-sm text-muted">{authors.length} total</p>
        </div>
        <Link
          href="/admin/authors/new"
          className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
        >
          New author
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[520px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-surface text-left text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {authors.map((author) => (
              <tr key={author.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium">{author.name}</td>
                <td className="px-4 py-3 text-muted">{author.email}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-medium text-accent">
                    {author.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-3">
                    <Link
                      href={`/admin/authors/${author.id}/edit`}
                      className="font-medium text-accent hover:underline"
                    >
                      Edit
                    </Link>
                    <DeleteAuthorButton authorId={author.id} name={author.name} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
