import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { CATEGORIES } from "@/lib/constants";

const CATEGORY_SLUGS = CATEGORIES.map((c) => c.slug);

const PostSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    excerpt: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    coverImage: { type: String, required: true },
    coverImageAlt: { type: String, required: true },
    category: { type: String, required: true, enum: CATEGORY_SLUGS },
    tags: { type: [String], default: [] },
    author: { type: Schema.Types.ObjectId, ref: "Author", required: true },
    metaTitle: { type: String, required: true },
    metaDescription: { type: String, required: true },
    status: {
      type: String,
      enum: ["draft", "pending_review", "published", "rejected"],
      default: "draft",
      index: true,
    },
    publishedAt: { type: Date, default: null },
    publishedBy: { type: Schema.Types.ObjectId, ref: "Author", default: null },
    reviewNote: { type: String, default: "" },
  },
  { timestamps: true }
);

PostSchema.index({ status: 1, publishedAt: -1 });
PostSchema.index({ category: 1, status: 1, publishedAt: -1 });

export type PostDoc = InferSchemaType<typeof PostSchema>;

const Post: Model<PostDoc> = models.Post || model<PostDoc>("Post", PostSchema);

export default Post;
