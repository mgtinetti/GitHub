import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const supabase = createServerClient();

    const { data: shows, error } = await supabase
      .from("shows")
      .select(`
        id, title, poster_url, network, genres,
        seasons(
          id, season_number,
          ranking_entries(
            id, user_id, year, rank_position, score, tier,
            users(id, display_name, avatar_url)
          )
        )
      `)
      .ilike("title", `%${q}%`)
      .limit(10);

    if (error) {
      return NextResponse.json({ results: [], error: error.message });
    }

    if (!shows || shows.length === 0) {
      return NextResponse.json({ results: [] });
    }

    const results = shows.map((show: any) => {
      const allRankings: any[] = [];
      for (const season of show.seasons || []) {
        for (const entry of season.ranking_entries || []) {
          const user = entry.users;
          allRankings.push({
            user_id: entry.user_id,
            user_name: user?.display_name || "Unknown",
            avatar_url: user?.avatar_url || null,
            year: entry.year,
            rank_position: entry.rank_position,
            score: entry.score ? parseFloat(entry.score) : null,
            tier: entry.tier,
            season_number: season.season_number,
          });
        }
      }
      allRankings.sort((a: any, b: any) => b.year - a.year || a.rank_position - b.rank_position);

      return {
        id: show.id,
        title: show.title,
        poster_url: show.poster_url,
        network: show.network || "Unknown",
        genres: show.genres || [],
        rankings: allRankings,
      };
    });

    results.sort((a: any, b: any) => b.rankings.length - a.rankings.length);

    return NextResponse.json({ results });
  } catch (err: any) {
    return NextResponse.json(
      { results: [], error: err?.message || "Unknown server error" },
      { status: 500 }
    );
  }
}
