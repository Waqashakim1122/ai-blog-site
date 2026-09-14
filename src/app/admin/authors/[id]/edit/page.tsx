import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAuthorById } from "@/lib/authors";
import { AuthorForm } from "@/components/admin/AuthorForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit Author",
  robots: { index: false, follow: false },
};

export default async function EditAuthorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const author = await getAuthorById(id);
  if (!author) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Edit author</h1>
      <AuthorForm mode="edit" author={author} />
    </div>
  );
}
