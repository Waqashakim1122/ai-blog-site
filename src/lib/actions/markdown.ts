"use server";

import { markdownToSafeHtml } from "@/lib/markdown";

export async function previewMarkdown(markdown: string): Promise<string> {
  return markdownToSafeHtml(markdown);
}
