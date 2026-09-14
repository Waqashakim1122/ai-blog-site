import type { Metadata } from "next";
import { AuthorForm } from "@/components/admin/AuthorForm";

export const metadata: Metadata = {
  title: "New Author",
  robots: { index: false, follow: false },
};

export default function NewAuthorPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">New author</h1>
      <AuthorForm mode="create" />
    </div>
  );
}
