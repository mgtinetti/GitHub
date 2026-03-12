import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { YEARS } from "@/lib/constants";
import { createServerClient } from "@/lib/supabase/server";

interface Props {
  params: Promise<{ year: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { year } = await params;
  return {
    title: `TV Awards & Superlatives ${year}`,
    description: `Our personal TV awards ceremony for ${year}. Votes cast, arguments had, and group winners declared.`,
  };
}

interface AwardPick {
  id: string;
  category_id: string;
  user_id: string;
  blurb: string | null;
  season_id: string;
  show_title: string;
  poster_url: string;
  season_number: number;
}

interface AwardCategory {
  id: string;
  name: string;
  picks: AwardPick[];
}

interface UserInfo {
  id: string;
  display_name: string;
  avatar_url: string;
}

export default async function AwardsPage({ params }: Props) {
  const { year: yearStr } = await params;
  const year = parseInt(yearStr, 10);
  if (isNaN(year) || year < 2000 || year > 2100) notFound();

  const supabase = createServerClient();

  // Fetch categories, picks, and users in parallel
  const [categoriesResult, picksResult, usersResult] = await Promise.all([
    supabase
      .from("award_categories")
      .select("id, name")
      .eq("year", year)
      .eq("approved", true)
      .order("is_preset", { ascending: false })
      .order("name", { ascending: true }),
    supabase
      .from("award_picks")
      .select(
        `id, category_id, user_id, blurb, season_id,
         seasons!inner(season_number, shows!inner(title, poster_url))`
      )
      .in(
        "category_id",
        // We'll filter after
        []
      ),
    supabase
      .from("users")
      .select("id, display_name, avatar_url")
      .order("created_at", { ascending: true }),
  ]);

  const rawCategories = categoriesResult.data || [];
  const users: UserInfo[] = (usersResult.data || []) as UserInfo[];

  // Now fetch picks for the actual category IDs
  const categoryIds = rawCategories.map((c: any) => c.id);
  const { data: rawPicks } = categoryIds.length > 0
    ? await supabase
        .from("award_picks")
        .select(
          `id, category_id, user_id, blurb, season_id,
           seasons!inner(season_number, shows!inner(title, poster_url))`
        )
        .in("category_id", categoryIds)
    : { data: [] };

  // Build pick objects
  const picks: AwardPick[] = ((rawPicks || []) as any[]).map((p) => ({
    id: p.id,
    category_id: p.category_id,
    user_id: p.user_id,
    blurb: p.blurb,
    season_id: p.season_id,
    show_title: p.seasons?.shows?.title || "Unknown",
    poster_url: p.seasons?.shows?.poster_url || "/placeholder-poster.svg",
    season_number: p.seasons?.season_number || 0,
  }));

  // Build categories with their picks
  const categories: AwardCategory[] = rawCategories.map((c: any) => ({
    id: c.id,
    name: c.name,
    picks: picks.filter((p) => p.category_id === c.id),
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-16">
        <span className="text-amber-500 font-mono uppercase tracking-[0.5em] text-xs mb-4 block">
          Year End Superlatives
        </span>
        <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-4 italic uppercase">
          {year} <span className="text-amber-500">Awards</span>
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto mb-6">
          Our personal TV awards ceremony. Votes cast, arguments had, and group
          winners declared.
        </p>

        {/* Year selector */}
        <div className="flex gap-2 justify-center flex-wrap">
          {YEARS.map((y) => (
            <Link
              key={y}
              href={`/awards/${y}`}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                y === year
                  ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                  : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10"
              }`}
            >
              {y}
            </Link>
          ))}
        </div>
      </div>

      {/* Award Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {categories.map((category) => {
          // Determine group winner (majority)
          const pickCounts: Record<string, number> = {};
          category.picks.forEach((p) => {
            if (p.season_id) {
              pickCounts[p.season_id] = (pickCounts[p.season_id] || 0) + 1;
            }
          });
          const winnerSeasonId = Object.entries(pickCounts).sort(
            (a, b) => b[1] - a[1]
          )[0]?.[0];
          const winnerPick = category.picks.find(
            (p) => p.season_id === winnerSeasonId
          );
          const isUnanimous =
            winnerSeasonId &&
            pickCounts[winnerSeasonId] === category.picks.length;

          return (
            <div
              key={category.id}
              className="relative group rounded-3xl glass p-6 md:p-8 overflow-hidden border border-white/5 hover:border-amber-500/30 transition-all"
            >
              {/* Unanimous badge */}
              {isUnanimous && (
                <div className="absolute top-4 right-4 bg-amber-500/20 text-amber-500 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-amber-500/30 animate-pulse-glow">
                  Unanimous
                </div>
              )}

              {/* Category Header */}
              <div className="mb-6">
                <span className="text-amber-500 text-3xl mb-3 block">
                  {category.name.includes("Disappointing") ||
                  category.name.includes("Overrated")
                    ? "😬"
                    : "🏆"}
                </span>
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight mb-2">
                  {category.name}
                </h2>
                <div className="h-0.5 w-12 bg-amber-500" />
              </div>

              {/* Group Winner */}
              {winnerPick && (
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 mb-4">
                  <span className="text-[10px] font-bold text-gray-500 uppercase block mb-3">
                    Group Winner
                  </span>
                  <div className="flex items-center gap-4">
                    <div className="relative w-14 h-20 rounded-lg overflow-hidden shadow-xl shrink-0">
                      <Image
                        src={winnerPick.poster_url}
                        alt={winnerPick.show_title}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">
                        {winnerPick.show_title}
                      </h4>
                      <p className="text-xs text-amber-500 font-bold uppercase tracking-widest">
                        Season {winnerPick.season_number}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Individual Picks */}
              <div className="space-y-2">
                {users.map((user) => {
                  const pick = category.picks.find(
                    (p) => p.user_id === user.id
                  );
                  return (
                    <div
                      key={user.id}
                      className="flex items-center justify-between text-sm px-4 py-2.5 rounded-xl bg-white/5 border border-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative w-6 h-6 rounded-full overflow-hidden">
                          <Image
                            src={user.avatar_url}
                            alt={user.display_name}
                            fill
                            className="object-cover"
                            sizes="24px"
                          />
                        </div>
                        <span className="text-gray-400 font-medium">
                          {user.display_name}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-gray-200">
                          {pick?.show_title || "—"}{" "}
                          {pick ? `S${pick.season_number}` : ""}
                        </span>
                        {pick?.blurb && (
                          <p className="text-[10px] text-gray-500 mt-0.5 italic max-w-[200px] text-right">
                            &ldquo;{pick.blurb}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {categories.length === 0 && (
        <div className="glass rounded-3xl p-12 text-center">
          <p className="text-gray-500 text-lg">
            No awards have been created for {year} yet.
          </p>
        </div>
      )}
    </div>
  );
}
