"use client";

import { useState, useRef, useEffect } from "react";
import { TMDB_IMAGE_BASE } from "@/lib/constants";

interface TMDBResult {
  id: number;
  name: string;
  poster_path: string | null;
  first_air_date: string;
  overview: string;
}

interface ShowSearchProps {
  onSelect: (show: TMDBResult) => void;
}

export default function ShowSearch({ onSelect }: ShowSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TMDBResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSearch(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(value)}`);
        const data = await res.json();
        setResults(data.results || []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }

  function handleSelect(show: TMDBResult) {
    onSelect(show);
    setQuery("");
    setResults([]);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
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
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search for a TV show..."
          className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all"
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 top-full mt-2 w-full glass-strong rounded-xl border border-white/10 shadow-2xl max-h-80 overflow-y-auto">
          {results.map((show) => (
            <button
              key={show.id}
              onClick={() => handleSelect(show)}
              className="flex items-center gap-3 w-full px-4 py-3 hover:bg-white/10 transition-colors text-left border-b border-white/5 last:border-0"
            >
              <div className="w-10 h-14 rounded overflow-hidden bg-white/5 shrink-0">
                {show.poster_path ? (
                  <img
                    src={`${TMDB_IMAGE_BASE}/w92${show.poster_path}`}
                    alt={show.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
                    N/A
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-white truncate">
                  {show.name}
                </p>
                <p className="text-xs text-gray-500">
                  {show.first_air_date
                    ? new Date(show.first_air_date).getFullYear()
                    : "Unknown year"}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {open && query.length >= 2 && results.length === 0 && !loading && (
        <div className="absolute z-50 top-full mt-2 w-full glass-strong rounded-xl border border-white/10 shadow-2xl p-6 text-center">
          <p className="text-gray-500 text-sm">No shows found for &ldquo;{query}&rdquo;</p>
        </div>
      )}
    </div>
  );
}
