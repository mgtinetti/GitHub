"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface GenreFilterProps {
  genres: string[];
  year: number;
  activeGenre?: string;
}

export default function GenreFilter({ genres, year, activeGenre }: GenreFilterProps) {
  const pathname = usePathname();

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <Link
        href={`/${year}`}
        className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
          !activeGenre
            ? "bg-amber-500 text-black"
            : "bg-white/5 text-gray-400 hover:text-white border border-white/10"
        }`}
      >
        All
      </Link>
      {genres.map((genre) => (
        <Link
          key={genre}
          href={`/${year}/genre/${genre.toLowerCase()}`}
          className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
            activeGenre?.toLowerCase() === genre.toLowerCase()
              ? "bg-amber-500 text-black"
              : "bg-white/5 text-gray-400 hover:text-white border border-white/10"
          }`}
        >
          {genre}
        </Link>
      ))}
    </div>
  );
}
