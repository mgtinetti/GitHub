import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8">
        <span className="text-4xl font-black text-gray-600">404</span>
      </div>
      <h1 className="text-3xl font-black tracking-tight mb-4">
        Page Not Found
      </h1>
      <p className="text-gray-400 mb-8">
        This page doesn&apos;t exist. Maybe the season hasn&apos;t aired yet?
      </p>
      <Link
        href="/"
        className="inline-block bg-amber-500 hover:bg-amber-400 text-black font-bold px-6 py-3 rounded-xl transition-colors"
      >
        Back to Rankings
      </Link>
    </div>
  );
}
