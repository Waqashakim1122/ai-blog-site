import type { PostListItem } from "@/types";
import { PostCard } from "@/components/PostCard";

export function PostGrid({ posts }: { posts: PostListItem[] }) {
  if (posts.length === 0) {
    return (
      <p className="py-12 text-center text-muted">No posts found in this category yet.</p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post, i) => (
        <PostCard key={post.id} post={post} priority={i < 3} />
      ))}
    </div>
  );
}
