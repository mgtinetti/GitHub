import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { USERS, ALL_TIME_RANKINGS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { username } = await params;
  const user = USERS.find(
    (u) => u.display_name.toLowerCase() === username.toLowerCase()
  );
  if (!user) return { title: "Not Found" };
  return {
    title: `${user.display_name}'s All-Time Rankings`,
    description: `${user.display_name}'s top TV seasons of all time`,
  };
}

export default async function UserAllTimePage({ params }: Props) {
  const { username } = await params;
  const user = USERS.find(
    (u) => u.display_name.toLowerCase() === username.toLowerCase()
  );
  if (!user) notFound();

  const entries = ALL_TIME_RANKINGS[user.id] || [];

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12 animate-fade-in">
      <div className="mb-10">
        <Link
          href="/all-time"
          className="text-sm text-gray-500 hover:text-amber-500 transition-colors mb-4 block"
        >
          &larr; All Users
        </Link>
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-amber-500/50">
            <Image
              src={user.avatar_url}
              alt={user.display_name}
              fill
              className="object-cover"
              sizes="56px"
            />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">
              {user.display_name}&apos;s{" "}
              <span className="text-amber-500">All-Time</span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Top {entries.length} TV seasons of all time
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className={cn(
              "flex items-center gap-4 p-4 rounded-2xl glass border border-white/5 hover:border-amber-500/20 transition-all group",
              entry.rank_position <= 3 && "accent-glow"
            )}
          >
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black shrink-0",
                entry.rank_position <= 3
                  ? "rank-badge-top3 text-black"
                  : "bg-white/5 text-gray-400"
              )}
            >
              {entry.rank_position}
            </div>

            <div className="relative w-14 h-20 rounded-lg overflow-hidden shrink-0">
              <Image
                src={entry.show?.poster_url || "/placeholder-poster.svg"}
                alt={entry.show?.title || ""}
                fill
                className="object-cover"
                sizes="56px"
              />
            </div>

            <div className="flex-grow min-w-0">
              <h3 className="font-bold text-white text-lg group-hover:text-amber-500 transition-colors truncate">
                {entry.show?.title}
              </h3>
              <p className="text-sm text-gray-400">
                Season {entry.season?.season_number} &middot;{" "}
                {entry.show?.network}
              </p>
            </div>

            <div className="flex flex-wrap gap-1 shrink-0 hidden sm:flex">
              {entry.show?.genres.map((g) => (
                <span
                  key={g}
                  className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-gray-400 uppercase"
                >
                  {g}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {entries.length === 0 && (
        <div className="glass rounded-3xl p-12 text-center">
          <p className="text-gray-500 text-lg">No all-time rankings yet.</p>
        </div>
      )}
    </div>
  );
}
