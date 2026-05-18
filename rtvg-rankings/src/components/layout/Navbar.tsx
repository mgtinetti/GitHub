"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { YEARS } from "@/lib/constants";
import { fetchActiveYears } from "@/lib/supabase/queries";
import { useAuth } from "@/hooks/useAuth";

export default function Navbar() {
  const pathname = usePathname();
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [years, setYears] = useState<number[]>([...YEARS]);

  useEffect(() => {
    fetchActiveYears().then((activeYears) => {
      if (activeYears.length > 0) {
        const merged = [...new Set([...activeYears, ...YEARS])].sort((a, b) => b - a);
        setYears(merged);
      }
    });
  }, []);

  const latestYear = years[0] || 2025;

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + "/");

  return (
    <nav className="sticky top-0 z-50 glass-strong border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center font-black text-black text-sm shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
              R
            </div>
            <span className="font-bold text-lg tracking-tight hidden sm:inline">
              RTVG <span className="text-amber-500">RANKINGS</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              href={`/${latestYear}`}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                years.some((y) => pathname.startsWith(`/${y}`))
                  ? "text-amber-500"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Rankings
            </Link>

            <Link
              href="/watching"
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive("/watching")
                  ? "text-emerald-500"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Watching
            </Link>

            <Link
              href={`/awards/${latestYear}`}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive("/awards")
                  ? "text-amber-500"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Awards
            </Link>

            <Link
              href={`/episodes/${latestYear}`}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive("/episodes") || isActive("/performances") || isActive("/non-rankable")
                  ? "text-amber-500"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Lists
            </Link>

            <Link
              href={`/insights`}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive("/insights")
                  ? "text-purple-500"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Insights
            </Link>

            <Link
              href="/blog"
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive("/blog")
                  ? "text-amber-500"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Blog
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {!loading && (
              user ? (
                <div className="hidden md:flex items-center gap-3">
                  <Link
                    href="/admin"
                    className="text-xs text-gray-400 hover:text-amber-500 font-semibold transition-colors"
                  >
                    Manage
                  </Link>
                  <button
                    onClick={signOut}
                    className="bg-white/5 hover:bg-white/10 px-4 py-1.5 rounded-full text-xs font-semibold border border-white/10 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={signInWithGoogle}
                  className="hidden md:block bg-white/5 hover:bg-white/10 px-4 py-1.5 rounded-full text-xs font-semibold border border-white/10 transition-colors"
                >
                  Sign In
                </button>
              )
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 text-gray-400 hover:text-white"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden glass-strong border-t border-white/5 px-4 py-4 space-y-1 animate-slide-up">
          <Link
            href={`/${latestYear}`}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white"
            onClick={() => setMenuOpen(false)}
          >
            Rankings
          </Link>
          <Link
            href="/watching"
            className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white"
            onClick={() => setMenuOpen(false)}
          >
            Currently Watching
          </Link>
          <Link
            href={`/awards/${latestYear}`}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white"
            onClick={() => setMenuOpen(false)}
          >
            Awards
          </Link>
          <div className="h-px bg-white/5 my-2" />
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 mb-1">
            Lists
          </p>
          <Link
            href={`/episodes/${latestYear}`}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white"
            onClick={() => setMenuOpen(false)}
          >
            Best Episodes
          </Link>
          <Link
            href={`/performances/${latestYear}`}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white"
            onClick={() => setMenuOpen(false)}
          >
            Best Performances
          </Link>
          <Link
            href={`/non-rankable/${latestYear}`}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white"
            onClick={() => setMenuOpen(false)}
          >
            Non-Rankable
          </Link>
          <div className="h-px bg-white/5 my-2" />
          <Link
            href="/insights"
            className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white"
            onClick={() => setMenuOpen(false)}
          >
            Insights
          </Link>
          <Link
            href="/blog"
            className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white"
            onClick={() => setMenuOpen(false)}
          >
            Blog
          </Link>
          <div className="h-px bg-white/5 my-2" />
          {user ? (
            <>
              <Link
                href="/admin"
                className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white"
                onClick={() => setMenuOpen(false)}
              >
                Manage Rankings
              </Link>
              <button
                onClick={() => { signOut(); setMenuOpen(false); }}
                className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white"
              >
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={() => { signInWithGoogle(); setMenuOpen(false); }}
              className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white"
            >
              Sign In
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
