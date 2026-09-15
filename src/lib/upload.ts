"use client";

// Shared by the featured-image picker and the Tiptap editor's inline image
// button — both upload through the same /api/upload route.
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/upload", { method: "POST", body: formData });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.error || "Upload failed.");
  }

  return data.url as string;
}
