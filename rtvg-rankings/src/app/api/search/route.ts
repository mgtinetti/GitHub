import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: shows, error } = await supabase
    .from("shows")
    .select("id, title, poster_url, network, genres")
    .ilike("title", `%${q}%`)
    .limit(10);

  if (error || !shows || shows.length === 0) {
    return NextResponse.json({ results: [] });
  }

  const showIds = shows.map((s) => s.id);

  const [rankingsResult, usersResult] = await Promise.all([
    supabase
      .from("ranking_entries")
      .select(
        `
        id,
        user_id,
        year,
        rank_position,
        score,
        tier,
        seasons!inner (
          season_number,
          show_id
        )
      `
      )
      .in("seasons.show_id", showIds)
      .order("year", { ascending: false })
      .order("rank_position", { ascending: true }),
    supabase.from("users").select("id, display_name, avatar_url"),
  ]);

  const rankings = (rankingsResult.data as any[]) || [];
  const users = usersResult.data || [];

  const userMap = new Map(users.map((u) => [u.id, u]));

  const results = shows.map((show) => {
    const showRankings = rankings
      .filter((r) => r.seasons?.show_id === show.id)
      .map((r) => ({
        user_id: r.user_id,
        user_name: userMap.get(r.user_id)?.display_name || "Unknown",
        avatar_url: userMap.get(r.user_id)?.avatar_url || null,
        year: r.year,
        rank_position: r.rank_position,
        score: r.score ? parseFloat(r.score) : null,
        tier: r.tier,
        season_number: r.seasons.season_number,
      }));

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
