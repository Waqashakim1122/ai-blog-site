import { config as loadEnv } from "dotenv";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

for (const file of [".env.local", ".env"]) {
  const path = resolve(process.cwd(), file);
  if (existsSync(path)) loadEnv({ path });
}

import mongoose from "mongoose";
import { generateJSON } from "@tiptap/html/server";
import Post from "@/models/Post";
import { seedPosts } from "./posts-data";
import { markdownToSafeHtml } from "@/lib/markdown";
import { getTiptapExtensions } from "@/lib/tiptap-extensions";
import { isValidTiptapDoc } from "@/lib/headings";

// One-off repair for the "public article body renders blank" bug: some
// posts' `content` field is not a well-formed {type:"doc", content:[...]}
// Tiptap document (TiptapContent's isValidTiptapDoc guard now detects this
// and shows a fallback message instead of a silent blank — see
// src/components/TiptapContent.tsx). This scans every post in the database,
// and for any with malformed content that matches a seed post's slug,
// re-runs today's markdown->Tiptap-JSON conversion (verified correct for
// all 16 seed posts) and replaces ONLY the content field via $set — status,
// publishedAt, publishedBy, and every other field are left untouched, so
// this can't clobber a live edit made after seeding.
//
// A post with malformed content but no matching seed slug (i.e. it was
// authored through the admin UI, not seeded) is reported, not touched —
// there's no source markdown to regenerate it from, and the admin editor's
// own save path already validates content shape via Zod (PostInputSchema
// in src/lib/validation.ts), so this shouldn't occur, but the script never
// invents content.

const MONGODB_URI = process.env.MONGODB_URI;

function markdownToTiptapJson(markdown: string) {
  return generateJSON(markdownToSafeHtml(markdown), getTiptapExtensions());
}

async function main() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not set. Add it to .env.local before running this.");
  }

  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB.\n");

  const seedBySlug = new Map(seedPosts.map((p) => [p.slug, p]));
  const allPosts = await Post.find({}).select("slug content").lean();
  console.log(`Scanning ${allPosts.length} post(s) for malformed content...\n`);

  let brokenCount = 0;
  let fixedCount = 0;
  let unfixableCount = 0;

  for (const post of allPosts) {
    if (isValidTiptapDoc(post.content)) continue;

    brokenCount++;
    const shapeDesc = Array.isArray(post.content) ? "array" : typeof post.content;
    console.log(`BROKEN: "${post.slug}" — content is ${shapeDesc}`);

    const seedSource = seedBySlug.get(post.slug);
    if (!seedSource) {
      unfixableCount++;
      console.log(
        "  -> no matching seed source for this slug (likely authored via the admin UI, not seeded) — needs a manual fix, not touched."
      );
      continue;
    }

    const freshContent = markdownToTiptapJson(seedSource.content);
    if (!isValidTiptapDoc(freshContent)) {
      unfixableCount++;
      console.log(
        "  -> re-running today's conversion ALSO produced invalid content — this is a live converter bug, not stale data. Needs a code fix. Not touched."
      );
      continue;
    }

    await Post.updateOne({ _id: post._id }, { $set: { content: freshContent } });
    fixedCount++;
    console.log(
      `  -> fixed: content replaced with a freshly-converted, verified-valid document (${(freshContent.content ?? []).length} top-level nodes). No other field touched.`
    );
  }

  console.log(
    `\nScanned: ${allPosts.length} | Broken: ${brokenCount} | Fixed: ${fixedCount} | Needs manual attention: ${unfixableCount}`
  );

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
