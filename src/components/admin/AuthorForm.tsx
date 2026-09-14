"use client";

import { useActionState } from "react";
import { createAuthor, updateAuthor, type ActionResult } from "@/lib/actions/authors";
import type { AuthorPlain } from "@/types";

export function AuthorForm({ mode, author }: { mode: "create" | "edit"; author?: AuthorPlain }) {
  const action = async (
    _prevState: ActionResult | undefined,
    formData: FormData
  ): Promise<ActionResult> => {
    return mode === "create" ? createAuthor(formData) : updateAuthor(author!.id, formData);
  };

  const [state, formAction, isPending] = useActionState<ActionResult | undefined, FormData>(
    action,
    undefined
  );

  const fieldError = (name: string) => state?.fieldErrors?.[name];

  if (state?.ok) {
    return (
      <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">
        {mode === "create" ? "Author created." : "Author updated."}
      </div>
    );
  }

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-5">
      {state?.error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
          Name
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={author?.name}
          className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
        />
        {fieldError("name") && <p className="mt-1 text-xs text-red-500">{fieldError("name")}</p>}
      </div>

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          defaultValue={author?.email}
          className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
        />
        {fieldError("email") && <p className="mt-1 text-xs text-red-500">{fieldError("email")}</p>}
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
          {mode === "create" ? "Password" : "New password (leave blank to keep current)"}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required={mode === "create"}
          minLength={8}
          className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
        />
        {fieldError("password") && (
          <p className="mt-1 text-xs text-red-500">{fieldError("password")}</p>
        )}
      </div>

      <div>
        <label htmlFor="role" className="mb-1.5 block text-sm font-medium">
          Role
        </label>
        <select
          id="role"
          name="role"
          defaultValue={author?.role || "author"}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
        >
          <option value="author">Author</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div>
        <label htmlFor="bio" className="mb-1.5 block text-sm font-medium">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={3}
          defaultValue={author?.bio}
          maxLength={500}
          className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
        />
      </div>

      <div>
        <label htmlFor="avatar" className="mb-1.5 block text-sm font-medium">
          Avatar URL
        </label>
        <input
          id="avatar"
          name="avatar"
          defaultValue={author?.avatar}
          placeholder="https://…"
          className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-fit rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {isPending ? "Saving…" : mode === "create" ? "Create author" : "Save changes"}
      </button>
    </form>
  );
}
