import Link from "next/link";
import { YEARS } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 mt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center font-black text-black text-sm">
                R
              </div>
              <span className="font-bold text-lg tracking-tight">
                RTVG
              </span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              The definitive record of our television journey.
            </p>
            <a
              href="https://instagram.com/realtvguys"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-amber-500 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
              @realtvguys
            </a>
          </div>

          {/* Rankings */}
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
              Rankings
            </h4>
            <div className="space-y-2">
              {YEARS.map((year) => (
                <Link
                  key={year}
                  href={`/${year}`}
                  className="block text-sm text-gray-500 hover:text-white transition-colors"
                >
                  {year}
                </Link>
              ))}
            </div>
          </div>

          {/* Lists */}
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
              Lists
            </h4>
            <div className="space-y-2">
              <Link href="/awards/2025" className="block text-sm text-gray-500 hover:text-white transition-colors">
                Awards
              </Link>
              <Link href="/episodes/2025" className="block text-sm text-gray-500 hover:text-white transition-colors">
                Episodes
              </Link>
              <Link href="/performances/2025" className="block text-sm text-gray-500 hover:text-white transition-colors">
                Performances
              </Link>
              <Link href="/all-time" className="block text-sm text-gray-500 hover:text-white transition-colors">
                All-Time
              </Link>
              <Link href="/non-rankable/2025" className="block text-sm text-gray-500 hover:text-white transition-colors">
                Non-Rankable
              </Link>
            </div>
          </div>

          {/* More */}
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
              More
            </h4>
            <div className="space-y-2">
              <Link href="/browse" className="block text-sm text-gray-500 hover:text-white transition-colors">
                Browse by Service
              </Link>
              <Link href="/insights" className="block text-sm text-gray-500 hover:text-white transition-colors">
                Insights
              </Link>
              <Link href="/blog" className="block text-sm text-gray-500 hover:text-white transition-colors">
                Blog
              </Link>
              <a
                href="https://instagram.com/realtvguys"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-gray-500 hover:text-white transition-colors"
              >
                Instagram
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 text-center">
          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} RTVG Rankings. Built for Tinetti,
            Chubbs &amp; Poteete.
          </p>
        </div>
      </div>
    </footer>
  );
}
