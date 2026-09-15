"use server";

import type { JSONContent } from "@tiptap/core";
import { renderTiptapToSafeHtml } from "@/lib/tiptap";

// Renders unsaved editor content to the same sanitized HTML the live
// /blog/[slug] page would produce, so PostPreviewModal can show it before
// publishing without needing a full round-trip through the database.
export async function previewPostContent(doc: JSONContent): Promise<string> {
  return renderTiptapToSafeHtml(doc);
}
