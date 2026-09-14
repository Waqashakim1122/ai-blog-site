import { config as loadEnv } from "dotenv";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

for (const file of [".env.local", ".env"]) {
  const path = resolve(process.cwd(), file);
  if (existsSync(path)) loadEnv({ path });
}

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Author from "@/models/Author";
import Post from "@/models/Post";
import { seedPosts } from "./posts-data";
import { coverImageForSlug } from "@/lib/covers";

const MONGODB_URI = process.env.MONGODB_URI;
const SEED_PASSWORD = process.env.SEED_PASSWORD || "ChangeMe123!";

const SEED_AUTHORS = [
  {
    name: "Elena Voss",
    email: "elena.voss@syntharaai.com",
    role: "admin" as const,
    bio: "Editor-in-chief at Synthara AI, covering frontier model releases and AI policy.",
    avatar: "",
  },
  {
    name: "Marcus Chen",
    email: "marcus.chen@syntharaai.com",
    role: "author" as const,
    bio: "Staff writer focused on developer tools, coding assistants, and applied AI.",
    avatar: "",
  },
  {
    name: "Priya Raman",
    email: "priya.raman@syntharaai.com",
    role: "author" as const,
    bio: "Staff writer covering AI research, open-source models, and industry funding trends.",
    avatar: "",
  },
];

async function main() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not set. Add it to .env.local before seeding.");
  }

  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB.");

  const authorIdByEmail = new Map<string, string>();

  for (const seedAuthor of SEED_AUTHORS) {
    const passwordHash = await bcrypt.hash(SEED_PASSWORD, 12);
    const doc = await Author.findOneAndUpdate(
      { email: seedAuthor.email },
      {
        $set: {
          name: seedAuthor.name,
          bio: seedAuthor.bio,
          avatar: seedAuthor.avatar,
          role: seedAuthor.role,
        },
        $setOnInsert: { email: seedAuthor.email, passwordHash },
      },
      { upsert: true, new: true }
    );
    authorIdByEmail.set(seedAuthor.email, doc._id.toString());
    console.log(`Author ready: ${seedAuthor.email} (${seedAuthor.role})`);
  }

  let created = 0;
  let updated = 0;

  for (const post of seedPosts) {
    const authorId = authorIdByEmail.get(post.authorEmail);
    if (!authorId) {
      console.warn(`Skipping "${post.title}" — unknown authorEmail ${post.authorEmail}`);
      continue;
    }

    const existed = await Post.exists({ slug: post.slug });

    await Post.findOneAndUpdate(
      { slug: post.slug },
      {
        $set: {
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          coverImage: coverImageForSlug(post.slug),
          coverImageAlt: post.coverImageAlt,
          category: post.category,
          tags: post.tags,
          author: authorId,
          metaTitle: post.metaTitle,
          metaDescription: post.metaDescription,
          status: "published",
          publishedAt: new Date(post.publishedAt),
        },
      },
      { upsert: true, new: true }
    );

    if (existed) {
      updated++;
    } else {
      created++;
    }
  }

  console.log(`Posts: ${created} created, ${updated} updated.`);
  console.log("\nSeed accounts (email / password):");
  for (const a of SEED_AUTHORS) {
    console.log(`  ${a.email} / ${SEED_PASSWORD}`);
  }
  console.log("\nChange these passwords after first login (set SEED_PASSWORD to customize).");

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
