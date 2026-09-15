"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { approvePost, rejectPost } from "@/lib/actions/posts";

export function ReviewActions({ postId }: { postId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  function handleApprove() {
    setError("");
    startTransition(async () => {
      const result = await approvePost(postId);
      if (!result.ok) {
        setError(result.error || "Failed to approve post.");
        return;
      }
      router.refresh();
    });
  }

  function handleReject() {
    setError("");
    startTransition(async () => {
      const result = await rejectPost(postId, note);
      if (!result.ok) {
        setError(result.error || "Failed to reject post.");
        return;
      }
      setRejecting(false);
      setNote("");
      router.refresh();
    });
  }

  return (
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
      <p className="mb-3 text-sm font-semibold text-amber-600 dark:text-amber-400">
        Awaiting your review
      </p>

      {error && <p className="mb-3 text-sm text-red-500">{error}</p>}

      {!rejecting ? (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleApprove}
            disabled={isPending}
            className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {isPending ? "Approving…" : "Approve & publish"}
          </button>
          <button
            type="button"
            onClick={() => setRejecting(true)}
            disabled={isPending}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-surface disabled:opacity-60"
          >
            Reject
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <label htmlFor="reviewNote" className="text-xs font-medium text-muted">
            Tell the author what needs to change
          </label>
          <textarea
            id="reviewNote"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleReject}
              disabled={isPending || !note.trim()}
              className="rounded-md bg-red-500 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {isPending ? "Rejecting…" : "Confirm reject"}
            </button>
            <button
              type="button"
              onClick={() => {
                setRejecting(false);
                setNote("");
                setError("");
              }}
              disabled={isPending}
              className="rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-surface"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
