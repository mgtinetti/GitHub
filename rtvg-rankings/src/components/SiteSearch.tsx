"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
interface SearchRanking {
  user_id: string;
  user_name: string;
  avatar_url: string | null;
  year: number;
  rank_position: number;
  score: number | null;
  tier: string | null;
  season_number: number;
}

interface SearchResult {
  id: string;
  title: string;
  poster_url: string | null;
  network: string;
  genres: string[];
  rankings: SearchRanking[];
}

const USER_COLORS: Record<string, string> = {
  Tinetti: "text-amber-500",
  Chubbs: "text-rose-400",
  Poteete: "text-sky-400",
};

export default function SiteSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function searchShows(q: string): Promise<SearchResult[]> {
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
    if (!res.ok) {
      console.error("[Search] API error:", res.status, await res.text());
      return [];
    }
    const json = await res.json();
    return json.results || [];
  }

  function handleChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await searchShows(value.trim());
        setResults(data);
        setOpen(true);
      } catch (err) {
        console.error("[Search] unexpected error:", err);
        setResults([]);
      }
      setLoading(false);
    }, 300);
  }

  function groupByYear(rankings: SearchRanking[]) {
    const map = new Map<number, SearchRanking[]>();
    for (const r of rankings) {
      const arr = map.get(r.year) || [];
      arr.push(r);
      map.set(r.year, arr);
    }
    return [...map.entries()].sort((a, b) => b[0] - a[0]);
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search for a show..."
          className="w-full pl-12 pr-4 py-3.5 rounded-xl glass border border-white/10 focus:border-amber-500/50 focus:outline-none text-white placeholder-gray-500 text-sm transition-colors"
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 glass rounded-xl border border-white/10 shadow-2xl shadow-black/50 max-h-[70vh] overflow-y-auto">
          {results.map((result) => {
            const isExpanded = expandedId === result.id;
            const yearGroups = groupByYear(result.rankings);

            return (
              <div
                key={result.id}
                className="border-b border-white/5 last:border-b-0"
              >
                <div
                  className="flex items-center gap-3 p-4 hover:bg-white/5 cursor-pointer transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : result.id)}
                >
                  <div className="relative w-12 h-[72px] rounded-lg overflow-hidden shrink-0">
                    <Image
                      src={result.poster_url || "/placeholder-poster.svg"}
                      alt={result.title}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="font-bold text-sm truncate">{result.title}</p>
                    <p className="text-xs text-gray-500">{result.network}</p>
                    {result.rankings.length > 0 ? (
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {(() => {
                          const seen = new Set<string>();
                          return result.rankings
                            .filter((r) => {
                              if (seen.has(r.user_name)) return false;
                              seen.add(r.user_name);
                              return true;
                            })
                            .map((r) => (
                              <span
                                key={r.user_id}
                                className={`text-[10px] font-bold uppercase tracking-wider ${USER_COLORS[r.user_name] || "text-gray-400"}`}
                              >
                                {r.user_name}
                              </span>
                            ));
                        })()}
                        <span className="text-[10px] text-gray-600">
                          {result.rankings.length} ranking{result.rankings.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    ) : (
                      <p className="text-[10px] text-gray-600 mt-1">Not ranked yet</p>
                    )}
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <Link
                      href={`/show/${result.id}`}
                      className="text-[10px] text-gray-500 hover:text-amber-500 transition-colors font-bold uppercase tracking-wider px-2 py-1 rounded hover:bg-white/5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Details
                    </Link>
                    {result.rankings.length > 0 && (
                      <svg
                        className={`w-4 h-4 text-gray-600 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </div>
                </div>

                {isExpanded && result.rankings.length > 0 && (
                  <div className="px-4 pb-4">
                    {yearGroups.map(([year, rankings]) => (
                      <div key={year} className="mb-3 last:mb-0">
                        <p className="text-xs font-black text-amber-500 mb-1.5">{year}</p>
                        <div className="space-y-1">
                          {rankings.map((r, i) => (
                            <div
                              key={`${r.user_id}-${r.year}-${r.season_number}-${i}`}
                              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5"
                            >
                              {r.avatar_url ? (
                                <div className="relative w-6 h-6 rounded-full overflow-hidden shrink-0 border border-white/20">
                                  <Image src={r.avatar_url} alt={r.user_name} fill className="object-cover" sizes="24px" />
                                </div>
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 font-bold text-[10px] shrink-0">
                                  {r.user_name[0]}
                                </div>
                              )}
                              <span className={`text-xs font-bold w-16 shrink-0 ${USER_COLORS[r.user_name] || "text-gray-300"}`}>
                                {r.user_name}
                              </span>
                              <span className="text-[10px] text-gray-500 shrink-0">S{r.season_number}</span>
                              <div className={`px-2 py-0.5 rounded text-xs font-black shrink-0 ${
                                r.rank_position <= 3
                                  ? "rank-badge-top3 text-black"
                                  : "bg-white/10 text-gray-300"
                              }`}>
                                #{r.rank_position}
                              </div>
                              {r.score && (
                                <span className="text-xs text-amber-500 font-bold shrink-0">
                                  {r.score}
                                </span>
                              )}
                              {r.tier && (
                                <span className="text-[10px] text-gray-500 shrink-0">{r.tier}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {open && !loading && query.trim().length >= 2 && results.length === 0 && (
        <div className="absolute z-50 w-full mt-2 glass rounded-xl border border-white/10 shadow-2xl shadow-black/50 p-6 text-center">
          <p className="text-gray-500 text-sm">No shows found for &ldquo;{query}&rdquo;</p>
        </div>
      )}
    </div>
  );
}
