import Link from "next/link";
import Image from "next/image";
import { BLOG_POSTS } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "Blog",
  description: "Writeups, year-end reviews, and TV discussion from the RTVG crew",
};

export default function BlogPage() {
  const posts = [...BLOG_POSTS].sort(
    (a, b) =>
      new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
  );

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12 animate-fade-in">
      <div className="mb-10">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-3">
          <span className="text-amber-500">Blog</span>
        </h1>
        <p className="text-gray-400">
          Writeups, year-end reviews, and TV discussion.
        </p>
      </div>

      <div className="space-y-6">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="block glass rounded-2xl p-6 border border-white/5 hover:border-amber-500/20 transition-all group"
          >
            {post.is_pinned && (
              <span className="inline-block text-[10px] font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase tracking-widest mb-3 border border-amber-500/20">
                Pinned
              </span>
            )}
            <h2 className="text-xl md:text-2xl font-bold group-hover:text-amber-500 transition-colors mb-2">
              {post.title}
            </h2>
            <div className="flex items-center gap-3 text-sm text-gray-400 mb-4">
              {post.author && (
                <div className="flex items-center gap-2">
                  <div className="relative w-5 h-5 rounded-full overflow-hidden">
                    <Image
                      src={post.author.avatar_url}
                      alt={post.author.display_name}
                      fill
                      className="object-cover"
                      sizes="20px"
                    />
                  </div>
                  <span className="font-medium">{post.author.display_name}</span>
                </div>
              )}
              <span className="text-gray-600">&middot;</span>
              <span>{formatDate(post.published_at)}</span>
            </div>
            <p className="text-gray-400 text-sm line-clamp-3">
              {post.body.replace(/[#*\[\]`]/g, "").slice(0, 250)}...
            </p>
            <div className="flex gap-2 mt-4">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-gray-400 uppercase tracking-wider"
                >
                  {tag}
                </span>
              ))}
            </div>
          </Link>
        ))}

        {posts.length === 0 && (
          <div className="glass rounded-3xl p-12 text-center">
            <p className="text-gray-500 text-lg">No blog posts yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
