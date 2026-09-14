import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const AuthorSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    bio: { type: String, default: "" },
    avatar: { type: String, default: "" },
    role: { type: String, enum: ["admin", "author"], default: "author" },
  },
  { timestamps: true }
);

export type AuthorDoc = InferSchemaType<typeof AuthorSchema>;

const Author: Model<AuthorDoc> = models.Author || model<AuthorDoc>("Author", AuthorSchema);

export default Author;
