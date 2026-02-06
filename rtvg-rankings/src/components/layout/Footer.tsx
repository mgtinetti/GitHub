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
            <p className="text-sm text-gray-500 leading-relaxed">
              The definitive record of our television journey.
            </p>
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
            </div>
          </div>

          {/* More */}
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
              More
            </h4>
            <div className="space-y-2">
              <Link href="/blog" className="block text-sm text-gray-500 hover:text-white transition-colors">
                Blog
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 text-center">
          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} RTVG Rankings. Built for Matt,
            Mike &amp; Jake.
          </p>
        </div>
      </div>
    </footer>
  );
}
