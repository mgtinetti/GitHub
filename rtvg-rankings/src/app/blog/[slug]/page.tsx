import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { BLOG_POSTS } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) return { title: "Not Found" };
  return {
    title: post.title,
    description: post.body.replace(/[#*\[\]`]/g, "").slice(0, 160),
  };
}

function renderMarkdown(text: string): string {
  return text
    .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold text-white mt-8 mb-3">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold text-white mt-10 mb-4">$1</h2>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/\n\n/g, '</p><p class="text-gray-300 leading-relaxed mb-4">')
    .replace(/^/, '<p class="text-gray-300 leading-relaxed mb-4">')
    .replace(/$/, "</p>");
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 md:py-12 animate-fade-in">
      <Link
        href="/blog"
        className="text-sm text-gray-500 hover:text-amber-500 transition-colors mb-6 block"
      >
        &larr; All Posts
      </Link>

      <article>
        <header className="mb-10">
          {post.is_pinned && (
            <span className="inline-block text-[10px] font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase tracking-widest mb-4 border border-amber-500/20">
              Pinned
            </span>
          )}
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            {post.author && (
              <div className="flex items-center gap-2">
                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-amber-500/30">
                  <Image
                    src={post.author.avatar_url}
                    alt={post.author.display_name}
                    fill
                    className="object-cover"
                    sizes="32px"
                  />
                </div>
                <span className="font-medium text-white">
                  {post.author.display_name}
                </span>
              </div>
            )}
            <span className="text-gray-600">&middot;</span>
            <span>{formatDate(post.published_at)}</span>
          </div>
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
        </header>

        <div
          className="prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(post.body) }}
        />
      </article>
    </div>
  );
}
