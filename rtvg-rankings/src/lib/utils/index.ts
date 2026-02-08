import { type RankingEntry, type ConsensusEntry, type DisagreementEntry } from "@/types";

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function generateConsensusRankings(
  allRankings: Record<string, RankingEntry[]>
): ConsensusEntry[] {
  const showMap = new Map<
    string,
    {
      show: RankingEntry["show"];
      season: RankingEntry["season"];
      ranks: Record<string, number>;
      total: number;
      count: number;
    }
  >();

  const userIds = Object.keys(allRankings);

  for (const userId of userIds) {
    const entries = allRankings[userId] || [];
    for (const entry of entries) {
      if (!entry.show || !entry.season) continue;
      const key = entry.season_id;
      if (!showMap.has(key)) {
        showMap.set(key, {
          show: entry.show,
          season: entry.season,
          ranks: {},
          total: 0,
          count: 0,
        });
      }
      const data = showMap.get(key)!;
      data.ranks[userId] = entry.rank_position;
      data.total += entry.rank_position;
      data.count += 1;
    }
  }

  // Require at least 2/3 of users to have ranked a show
  const minRankers = Math.ceil((userIds.length * 2) / 3);

  const entries = Array.from(showMap.values())
    .filter((data) => data.count >= minRankers)
    .map((data) => ({
      show: data.show!,
      season: data.season!,
      average_rank: data.total / data.count,
      consensus_position: 0,
      user_ranks: data.ranks,
      ranked_by_count: data.count,
    }))
    .sort((a, b) => {
      // Shows ranked by more users come first if averages are close
      if (Math.abs(a.average_rank - b.average_rank) < 0.5) {
        return b.ranked_by_count - a.ranked_by_count;
      }
      return a.average_rank - b.average_rank;
    });

  entries.forEach((e, i) => (e.consensus_position = i + 1));

  return entries;
}

export function generateDisagreements(
  allRankings: Record<string, RankingEntry[]>
): DisagreementEntry[] {
  const showMap = new Map<
    string,
    {
      show: RankingEntry["show"];
      season: RankingEntry["season"];
      ranks: Record<string, number>;
    }
  >();

  for (const [userId, entries] of Object.entries(allRankings)) {
    for (const entry of entries) {
      if (!entry.show || !entry.season) continue;
      const key = entry.season_id;
      if (!showMap.has(key)) {
        showMap.set(key, { show: entry.show, season: entry.season, ranks: {} });
      }
      showMap.get(key)!.ranks[userId] = entry.rank_position;
    }
  }

  return Array.from(showMap.values())
    .filter((d) => Object.keys(d.ranks).length >= 2)
    .map((d) => {
      const values = Object.values(d.ranks);
      const spread = Math.max(...values) - Math.min(...values);
      return {
        show: d.show!,
        season: d.season!,
        user_ranks: d.ranks,
        spread,
      };
    })
    .sort((a, b) => b.spread - a.spread);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
