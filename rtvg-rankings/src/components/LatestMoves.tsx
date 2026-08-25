"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

interface MoveItem {
  id: string;
  userName: string;
  verb: string;
  showTitle: string;
  seasonNumber: number;
  detail: string | null;
  timestamp: string;
}

const USER_COLORS: Record<string, string> = {
  Tinetti: "var(--ticker-tinetti)",
  Chubbs: "var(--ticker-chubbs)",
  Poteete: "var(--ticker-poteete)",
};

function formatVerb(eventType: string, metadata: any): { verb: string; detail: string | null } {
  const category = metadata?.category;
  switch (eventType) {
    case "add":
      if (category === "watching") return { verb: "started", detail: null };
      if (category === "pipeline") return { verb: "queued", detail: null };
      if (category === "ranking") {
        const pos = metadata?.rank_position;
        return { verb: "ranked", detail: pos ? `#${pos}` : null };
      }
      return { verb: "added", detail: null };
    case "move":
      if (category === "ranking") {
        const from = metadata?.old_position;
        const to = metadata?.new_position;
        return { verb: "moved", detail: from && to ? `#${from} → #${to}` : null };
      }
      return { verb: "moved", detail: null };
    case "remove":
      return { verb: "dropped", detail: null };
    case "finalize":
      return { verb: "finished", detail: null };
    default:
      return { verb: eventType, detail: null };
  }
}

export default function LatestMoves() {
  const [items, setItems] = useState<MoveItem[]>([]);

  useEffect(() => {
    async function load() {
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const [eventsRes, watchingRes, pipelineRes, usersRes] = await Promise.all([
        supabase
          .from("activity_feed_events")
          .select("id, user_id, event_type, metadata, created_at")
          .gte("created_at", since)
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("currently_watching")
          .select(`id, user_id, season_number, added_at, shows!inner(title)`)
          .gte("added_at", since)
          .order("added_at", { ascending: false })
          .limit(20),
        supabase
          .from("pipeline")
          .select(`id, user_id, season_number, added_at, shows!inner(title)`)
          .gte("added_at", since)
          .order("added_at", { ascending: false })
          .limit(20),
        supabase.from("users").select("id, display_name"),
      ]);

      const userMap = new Map(
        (usersRes.data || []).map((u: any) => [u.id, u.display_name])
      );

      const moves: MoveItem[] = [];

      for (const ev of (eventsRes.data || []) as any[]) {
        const { verb, detail } = formatVerb(ev.event_type, ev.metadata);
        moves.push({
          id: `ev-${ev.id}`,
          userName: userMap.get(ev.user_id) || "Unknown",
          verb,
          showTitle: ev.metadata?.show_title || "Unknown",
          seasonNumber: ev.metadata?.season_number || 1,
          detail,
          timestamp: ev.created_at,
        });
      }

      for (const w of (watchingRes.data || []) as any[]) {
        moves.push({
          id: `w-${w.id}`,
          userName: userMap.get(w.user_id) || "Unknown",
          verb: "started",
          showTitle: w.shows?.title || "Unknown",
          seasonNumber: w.season_number,
          detail: null,
          timestamp: w.added_at,
        });
      }

      for (const p of (pipelineRes.data || []) as any[]) {
        moves.push({
          id: `p-${p.id}`,
          userName: userMap.get(p.user_id) || "Unknown",
          verb: "queued",
          showTitle: p.shows?.title || "Unknown",
          seasonNumber: p.season_number,
          detail: null,
          timestamp: p.added_at,
        });
      }

      moves.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      const seen = new Set<string>();
      const deduped = moves.filter((m) => {
        const key = `${m.userName}-${m.verb}-${m.showTitle}-S${m.seasonNumber}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

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
                {item.verb}
              </span>
              <span className="ticker-show">
                {item.showTitle}
                {item.seasonNumber > 1 ? ` S${item.seasonNumber}` : ""}
              </span>
              {item.detail && (
                <span className="ticker-rank">
                  {item.detail}
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
