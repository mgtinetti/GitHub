import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createServerClient();
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [rankingsRes, watchingRes, usersRes] = await Promise.all([
    supabase
      .from("ranking_entries")
      .select(`
        id, user_id, rank_position, created_at, updated_at,
        seasons!inner(
          season_number,
          shows!inner(title)
        )
      `)
      .gte("updated_at", since)
      .order("updated_at", { ascending: false })
      .limit(100),
    supabase
      .from("currently_watching")
      .select(`
        id, user_id, season_number, added_at,
        shows!inner(title)
      `)
      .gte("added_at", since)
      .order("added_at", { ascending: false })
      .limit(10),
    supabase.from("users").select("id, display_name"),
  ]);

  const users = (usersRes.data || []).map((u: any) => ({
    id: u.id,
    name: u.display_name,
  }));

  const userMap = new Map(users.map((u: any) => [u.id, u.name]));

  const rankingsByUser: Record<string, number> = {};
  for (const r of (rankingsRes.data || []) as any[]) {
    const name = userMap.get(r.user_id) || `unknown(${r.user_id})`;
    rankingsByUser[name] = (rankingsByUser[name] || 0) + 1;
  }

  const watchingByUser: Record<string, number> = {};
  for (const w of (watchingRes.data || []) as any[]) {
    const name = userMap.get(w.user_id) || `unknown(${w.user_id})`;
    watchingByUser[name] = (watchingByUser[name] || 0) + 1;
  }

  return NextResponse.json({
    since,
    users,
    rankings: {
      total: rankingsRes.data?.length || 0,
      error: rankingsRes.error?.message || null,
      byUser: rankingsByUser,
      sample: (rankingsRes.data || []).slice(0, 3).map((r: any) => ({
        user: userMap.get(r.user_id),
        show: r.seasons?.shows?.title,
        rank: r.rank_position,
        created_at: r.created_at,
        updated_at: r.updated_at,
      })),
    },
    watching: {
      total: watchingRes.data?.length || 0,
      error: watchingRes.error?.message || null,
      byUser: watchingByUser,
    },
  });
}
