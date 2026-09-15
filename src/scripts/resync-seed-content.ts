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
import { isValidTiptapDoc, extractHeadings } from "@/lib/headings";

// Supersedes fix-malformed-content.ts: that script only touched posts whose
// content FAILED isValidTiptapDoc's top-level shape check. It turned out
// live content can pass that check (a real {type:"doc", content:[...]}
// object) while still having the wrong node types internally -- e.g. a
// node that should be a "heading" stored as "paragraph", producing a body
// that visually renders but a TOC with missing/wrong entries. That failure
// mode can't be distinguished from "this post genuinely has fewer/no
// headings" without a source of truth to compare against.
//
// So for any post whose slug matches a seed post, this unconditionally
// regenerates content from that post's markdown source in posts-data.ts
// and overwrites the DB's content field -- verified correct for all 16
// seed posts (matching heading count, no leaked markdown, no fallback
// triggered) before this script was written. It only ever touches
// `content` via $set; status/publishedAt/publishedBy/etc. are untouched,
// so it can't clobber a live edit to those fields.
//
// A post with malformed OR heading-mismatched content but no matching seed
// slug (admin-authored, not seeded) is reported, not touched -- there's no
// source markdown to regenerate it from.

const MONGODB_URI = process.env.MONGODB_URI;

function markdownToTiptapJson(markdown: string) {
  return generateJSON(markdownToSafeHtml(markdown), getTiptapExtensions());
}

function expectedHeadingCount(markdown: string): number {
  return (markdown.match(/^##\s/gm) || []).length;
}

async function main() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not set. Add it to .env.local before running this.");
  }

  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB.\n");

  const seedBySlug = new Map(seedPosts.map((p) => [p.slug, p]));
  const allPosts = await Post.find({}).select("slug content").lean();
  console.log(`Scanning ${allPosts.length} post(s)...\n`);

  let resyncedCount = 0;
  let alreadyCorrectCount = 0;
  let needsManualAttentionCount = 0;

  for (const post of allPosts) {
    const seedSource = seedBySlug.get(post.slug);

    if (seedSource) {
      const freshContent = markdownToTiptapJson(seedSource.content);
      const expectedHeadings = expectedHeadingCount(seedSource.content);
      if (!isValidTiptapDoc(freshContent) || extractHeadings(freshContent).length !== expectedHeadings) {
        // Should be unreachable (verified against all 16 seed posts before
        // this script was written) -- but if today's converter itself
        // regresses for some source markdown, don't silently write bad
        // data over whatever's currently live.
        needsManualAttentionCount++;
        console.log(
          `NEEDS CODE FIX: "${post.slug}" -- re-converting from source markdown does not produce a valid/complete document today. Not touched.`
        );
        continue;
      }

      const currentValid = isValidTiptapDoc(post.content);
      const currentHeadingCount = currentValid ? extractHeadings(post.content).length : -1;
      const matches = currentValid && currentHeadingCount === expectedHeadings;

      if (matches) {
        alreadyCorrectCount++;
        console.log(`OK: "${post.slug}" -- already matches source (${expectedHeadings} heading(s)), not touched.`);
        continue;
      }

      await Post.updateOne({ _id: post._id }, { $set: { content: freshContent } });
      resyncedCount++;
      console.log(
        `RESYNCED: "${post.slug}" -- was ${currentValid ? `valid but had ${currentHeadingCount} heading(s), expected ${expectedHeadings}` : `not valid Tiptap JSON (${typeof post.content}${Array.isArray(post.content) ? " array" : ""})`}. Replaced content with a freshly-converted, verified-correct document (${expectedHeadings} heading(s)). No other field touched.`
      );
      continue;
    }

    // No seed source for this slug -- report only, never touched.
    const valid = isValidTiptapDoc(post.content);
    if (!valid) {
      needsManualAttentionCount++;
      console.log(
        `NEEDS MANUAL FIX: "${post.slug}" -- content is not valid Tiptap JSON and has no seed source to regenerate from (admin-authored). Not touched.`
      );
    } else {
      const count = extractHeadings(post.content).length;
      console.log(`(unaudited) "${post.slug}" -- valid shape, ${count} heading(s) found. No source to compare against, not touched.`);
    }
  }

  console.log(
    `\nScanned: ${allPosts.length} | Resynced: ${resyncedCount} | Already correct: ${alreadyCorrectCount} | Needs manual attention: ${needsManualAttentionCount}`
  );

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
