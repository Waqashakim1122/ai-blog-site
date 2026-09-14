"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deletePost } from "@/lib/actions/posts";

export function DeletePostButton({ postId, title }: { postId: string; title: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;

    startTransition(async () => {
      const result = await deletePost(postId);
      if (!result.ok) {
        window.alert(result.error || "Failed to delete post.");
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
