import { connectToDatabase } from "@/lib/db";
import Author from "@/models/Author";
import type { AuthorPlain } from "@/types";
import type { Types } from "mongoose";

interface LeanAuthor {
  _id: Types.ObjectId;
  name: string;
  email: string;
  bio?: string;
  avatar?: string;
  role: "admin" | "author";
}

function serialize(a: LeanAuthor): AuthorPlain {
  return {
    id: a._id.toString(),
    name: a.name,
    email: a.email,
    bio: a.bio || "",
    avatar: a.avatar || "",
    role: a.role,
  };
}

export async function getAllAuthors(): Promise<AuthorPlain[]> {
  await connectToDatabase();
  const docs = await Author.find({}).sort({ name: 1 }).lean<LeanAuthor[]>();
  return docs.map(serialize);
}

export async function getAuthorById(id: string): Promise<AuthorPlain | null> {
  await connectToDatabase();
  const doc = await Author.findById(id).lean<LeanAuthor | null>();
  return doc ? serialize(doc) : null;
}

export async function getAuthorByEmail(email: string): Promise<AuthorPlain | null> {
  await connectToDatabase();
  const doc = await Author.findOne({ email: email.toLowerCase() }).lean<LeanAuthor | null>();
  return doc ? serialize(doc) : null;
}
