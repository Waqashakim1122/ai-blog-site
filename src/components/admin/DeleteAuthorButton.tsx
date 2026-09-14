"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteAuthor } from "@/lib/actions/authors";

export function DeleteAuthorButton({ authorId, name }: { authorId: string; name: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (!window.confirm(`Delete author "${name}"?`)) return;

    startTransition(async () => {
      const result = await deleteAuthor(authorId);
      if (!result.ok) {
        window.alert(result.error || "Failed to delete author.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="font-medium text-red-500 hover:underline disabled:opacity-50"
    >
      {isPending ? "Deleting…" : "Delete"}
    </button>
  );
}
