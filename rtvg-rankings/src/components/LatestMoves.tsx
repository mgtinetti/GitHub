"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

interface MoveItem {
  id: string;
  userName: string;
  action: "ranked" | "started";
  showTitle: string;
  seasonNumber: number;
  rankPosition?: number;
  timestamp: string;
}

const USER_COLORS: Record<string, string> = {
  Tinetti: "var(--ticker-tinetti)",
  Chubbs: "var(--ticker-chubbs)",
  Poteete: "var(--ticker-poteete)",
};

export default function LatestMoves() {
  const [items, setItems] = useState<MoveItem[]>([]);

  useEffect(() => {
    async function load() {
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const [rankingsRes, watchingRes, usersRes] = await Promise.all([
        supabase
          .from("ranking_entries")
          .select(`
            id, user_id, rank_position, updated_at,
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

      const userMap = new Map(
        (usersRes.data || []).map((u: any) => [u.id, u.display_name])
      );

      const moves: MoveItem[] = [];

      for (const r of (rankingsRes.data || []) as any[]) {
        moves.push({
          id: `r-${r.id}`,
          userName: userMap.get(r.user_id) || "Unknown",
          action: "ranked",
          showTitle: r.seasons?.shows?.title || "Unknown",
          seasonNumber: r.seasons?.season_number || 1,
          rankPosition: r.rank_position,
          timestamp: r.updated_at,
        });
      }

      for (const w of (watchingRes.data || []) as any[]) {
        moves.push({
          id: `w-${w.id}`,
          userName: userMap.get(w.user_id) || "Unknown",
          action: "started",
          showTitle: w.shows?.title || "Unknown",
          seasonNumber: w.season_number,
          timestamp: w.added_at,
        });
      }

      moves.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      // Deduplicate: keep one entry per user+show combination
      const seen = new Set<string>();
      const deduped = moves.filter((m) => {
        const key = `${m.userName}-${m.showTitle}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      // Ensure all active users are represented by interleaving
      const byUser = new Map<string, MoveItem[]>();
      for (const m of deduped) {
        const list = byUser.get(m.userName) || [];
        list.push(m);
        byUser.set(m.userName, list);
      }
      const interleaved: MoveItem[] = [];
      const cursors = new Map<string, number>();
      for (const name of byUser.keys()) cursors.set(name, 0);
      while (interleaved.length < 12) {
        let added = false;
        for (const [name, list] of byUser) {
          const idx = cursors.get(name)!;
          if (idx < list.length) {
            interleaved.push(list[idx]);
            cursors.set(name, idx + 1);
            added = true;
          }
        }
        if (!added) break;
      }

      setItems(interleaved.slice(0, 12));
    }
    load();
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="ticker-strip">
      <span className="ticker-label">Latest Moves</span>
      <div className="ticker-marquee-wrap">
        <div className="ticker-fade-l" />
        <div className="ticker-fade-r" />
        <div className="ticker-marquee">
          {[...items, ...items].map((item, i) => (
            <span key={`${item.id}-${i}`} className="ticker-item">
              <span
                className="ticker-avatar"
                style={{ color: USER_COLORS[item.userName] || "var(--ticker-muted)", borderColor: USER_COLORS[item.userName] || "var(--ticker-muted)" }}
              >
                {item.userName[0]}
              </span>
              <span
                className="ticker-user"
                style={{ color: USER_COLORS[item.userName] || "var(--ticker-muted)" }}
              >
                {item.userName}
              </span>
              <span className="ticker-verb">
                {item.action}
              </span>
              <span className="ticker-show">
                {item.showTitle}
                {item.seasonNumber > 1 ? ` S${item.seasonNumber}` : ""}
              </span>
              {item.action === "ranked" && item.rankPosition && (
                <span className={`ticker-rank ${item.rankPosition <= 3 ? "top" : ""}`}>
                  #{item.rankPosition}
                </span>
              )}
              {i < [...items, ...items].length - 1 && (
                <span className="ticker-sep">/</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
