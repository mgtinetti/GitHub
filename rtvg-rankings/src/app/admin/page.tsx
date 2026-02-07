"use client";

import Link from "next/link";
import { USERS } from "@/lib/mock-data";
import { YEARS } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";

export default function AdminPage() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-12 animate-fade-in">
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-3">
          Admin <span className="text-amber-500">Dashboard</span>
        </h1>
        <p className="text-gray-400">
          Manage users, rankings, and site settings.
          {!user && " Sign in required."}
        </p>
      </div>

      {/* Auth state */}
      {loading ? (
        <div className="glass rounded-3xl p-12 text-center border border-white/5">
          <p className="text-gray-400">Loading...</p>
        </div>
      ) : !user ? (
        <div className="glass rounded-3xl p-8 md:p-12 text-center mb-10 border border-white/5">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Sign in to manage rankings</h2>
          <p className="text-gray-400 max-w-md mx-auto mb-6 text-sm">
            Connect with Google to access ranking management, awards, and blog
            editing. Only whitelisted contributors can sign in.
          </p>
          <button
            onClick={signInWithGoogle}
            className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-8 py-3 rounded-xl transition-colors shadow-lg shadow-amber-500/20"
          >
            Sign in with Google
          </button>
        </div>
      ) : (
        <>
          {/* Signed in state */}
          <div className="glass rounded-2xl p-6 mb-10 border border-amber-500/20 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 font-bold">
                {user.email?.[0]?.toUpperCase() || "?"}
              </div>
              <div>
                <p className="font-bold text-white">{user.email}</p>
                <p className="text-xs text-emerald-400">Signed in</p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="text-xs text-gray-400 hover:text-white bg-white/5 px-4 py-2 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>

          {/* Admin panels */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="glass rounded-xl p-6 border border-white/5">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                Contributors
              </h3>
              <div className="space-y-3">
                {USERS.map((u) => (
                  <div key={u.id} className="flex items-center gap-3">
                    <img
                      src={u.avatar_url}
                      alt={u.display_name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <p className="text-sm font-medium text-white">
                        {u.display_name}
                      </p>
                      <p className="text-[10px] text-gray-500 uppercase">
                        {u.role}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-xl p-6 border border-white/5">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                Years Active
              </h3>
              <div className="space-y-2">
                {YEARS.map((year) => (
                  <Link
                    key={year}
                    href={`/${year}`}
                    className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <span className="text-sm font-medium">{year}</span>
                    <span className="text-xs text-gray-500">View &rarr;</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="glass rounded-xl p-6 border border-white/5">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <p className="text-xs text-gray-500 italic">
                  Ranking management coming soon. Use the rankings pages to view current data.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
