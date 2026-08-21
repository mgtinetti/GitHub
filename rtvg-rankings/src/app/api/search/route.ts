import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const supabase = createServerClient();

  const { data: shows, error } = await supabase
    .from("shows")
    .select("id, title, poster_url, network, genres")
    .ilike("title", `%${q}%`)
    .limit(10);

  if (error || !shows || shows.length === 0) {
    return NextResponse.json({ results: [] });
  }

  const showIds = shows.map((s) => s.id);

  const [seasonsResult, usersResult] = await Promise.all([
    supabase
      .from("seasons")
      .select("id, show_id, season_number")
      .in("show_id", showIds),
    supabase.from("users").select("id, display_name, avatar_url"),
  ]);

  const seasons = seasonsResult.data || [];
  const users = usersResult.data || [];
  const userMap = new Map(users.map((u) => [u.id, u]));

  let rankings: any[] = [];
  if (seasons.length > 0) {
    const seasonIds = seasons.map((s) => s.id);
    const { data } = await supabase
      .from("ranking_entries")
      .select("id, user_id, season_id, year, rank_position, score, tier")
      .in("season_id", seasonIds)
      .order("year", { ascending: false })
      .order("rank_position", { ascending: true });
    rankings = data || [];
  }

  const seasonMap = new Map(seasons.map((s) => [s.id, s]));

  const results = shows.map((show) => {
    const showSeasonIds = seasons
      .filter((s) => s.show_id === show.id)
      .map((s) => s.id);

    const showRankings = rankings
      .filter((r) => showSeasonIds.includes(r.season_id))
      .map((r) => {
        const season = seasonMap.get(r.season_id);
        return {
          user_id: r.user_id,
          user_name: userMap.get(r.user_id)?.display_name || "Unknown",
          avatar_url: userMap.get(r.user_id)?.avatar_url || null,
          year: r.year,
          rank_position: r.rank_position,
          score: r.score ? parseFloat(r.score) : null,
          tier: r.tier,
          season_number: season?.season_number || 1,
        };
      });

    return {
      id: show.id,
      title: show.title,
      poster_url: show.poster_url,
      network: show.network || "Unknown",
      genres: show.genres || [],
      rankings: showRankings,
    };
  });

  results.sort((a, b) => b.rankings.length - a.rankings.length);

  return NextResponse.json({ results });
}
