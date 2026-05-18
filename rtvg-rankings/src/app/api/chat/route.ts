import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createServerClient } from "@/lib/supabase/server";
import { YEARS } from "@/lib/constants";

const anthropic = new Anthropic();

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

async function fetchRankingsContext(): Promise<string> {
  const supabase = createServerClient();

  const [usersRes, rankingsRes, allTimeRes, consensusYears] = await Promise.all(
    [
      supabase
        .from("users")
        .select("id, display_name")
        .order("created_at", { ascending: true }),
      supabase
        .from("ranking_entries")
        .select(
          `user_id, year, rank_position, score, rewatchability, review,
         seasons!inner(season_number, shows!inner(title, genres, network))`
        )
        .order("year", { ascending: false })
        .order("rank_position", { ascending: true }),
      supabase
        .from("all_time_entries")
        .select(
          `user_id, rank_position, shows!inner(title, network, genres)`
        )
        .order("rank_position", { ascending: true }),
      supabase
        .from("award_categories")
        .select(
          `name, year, award_picks(user_id, blurb, seasons!inner(season_number, shows!inner(title)))`
        )
        .eq("approved", true),
    ]
  );

  const users = usersRes.data || [];
  const rankings = rankingsRes.data || [];
  const allTime = allTimeRes.data || [];
  const awards = consensusYears.data || [];

  const userMap: Record<string, string> = {};
  for (const u of users) {
    userMap[u.id] = u.display_name;
  }

  let context = "=== USERS ===\n";
  context += users.map((u: any) => `${u.display_name} (id: ${u.id})`).join(", ");
  context += "\n\n";

  const byYear: Record<number, Record<string, any[]>> = {};
  for (const r of rankings as any[]) {
    const year = r.year;
    if (!byYear[year]) byYear[year] = {};
    const userName = userMap[r.user_id] || r.user_id;
    if (!byYear[year][userName]) byYear[year][userName] = [];
    byYear[year][userName].push({
      rank: r.rank_position,
      show: r.seasons?.shows?.title || "Unknown",
      season: r.seasons?.season_number,
      score: r.score,
      rewatchability: r.rewatchability,
      review: r.review,
      genres: r.seasons?.shows?.genres || [],
      network: r.seasons?.shows?.network || "Unknown",
    });
  }

  for (const year of Object.keys(byYear)
    .map(Number)
    .sort((a, b) => b - a)) {
    context += `=== ${year} RANKINGS ===\n`;
    for (const [userName, entries] of Object.entries(byYear[year])) {
      context += `\n${userName}:\n`;
      for (const e of entries) {
        context += `  #${e.rank} ${e.show} S${e.season}`;
        if (e.score) context += ` | Score: ${e.score}/10`;
        if (e.rewatchability) context += ` | Rewatch: ${e.rewatchability}`;
        if (e.review) context += ` | Review: "${e.review}"`;
        context += ` | ${e.network} | ${e.genres.join(", ")}`;
        context += "\n";
      }
    }
    context += "\n";
  }

  const allTimeByUser: Record<string, any[]> = {};
  for (const r of allTime as any[]) {
    const userName = userMap[r.user_id] || r.user_id;
    if (!allTimeByUser[userName]) allTimeByUser[userName] = [];
    allTimeByUser[userName].push({
      rank: r.rank_position,
      show: r.shows?.title || "Unknown",
      network: r.shows?.network || "Unknown",
      genres: r.shows?.genres || [],
    });
  }

  if (Object.keys(allTimeByUser).length > 0) {
    context += "=== ALL-TIME RANKINGS ===\n";
    for (const [userName, entries] of Object.entries(allTimeByUser)) {
      context += `\n${userName}:\n`;
      for (const e of entries) {
        context += `  #${e.rank} ${e.show} | ${e.network} | ${e.genres.join(", ")}\n`;
      }
    }
    context += "\n";
  }

  if (awards.length > 0) {
    context += "=== AWARDS / SUPERLATIVES ===\n";
    for (const cat of awards as any[]) {
      context += `\n${cat.name} (${cat.year}):\n`;
      for (const pick of cat.award_picks || []) {
        const userName = userMap[pick.user_id] || pick.user_id;
        const show = pick.seasons?.shows?.title || "Unknown";
        const season = pick.seasons?.season_number;
        context += `  ${userName}: ${show} S${season}`;
        if (pick.blurb) context += ` — "${pick.blurb}"`;
        context += "\n";
      }
    }
  }

  return context;
}

const GUY_SYSTEM_PROMPT = `You are "Guy" — the resident TV expert and trash-talking commentator for RTVG Rankings, a TV season ranking website run by three friends: Tinetti, Chubbs, and Poteete.

Your personality:
- You're hilarious, opinionated, and love talking shit (in a fun, friendly way)
- You roast people's rankings when they deserve it, especially questionable placements
- You have strong opinions about TV shows and aren't afraid to share them
- You call out bad takes, celebrate good ones, and love pointing out when the group disagrees
- You talk like a buddy on the couch watching TV with the group — casual, funny, a little obnoxious
- You reference specific data from the rankings to back up your trash talk
- If someone ranked a show way too high or low compared to the others, you WILL mention it
- You use phrases like "look...", "I'm not gonna sugarcoat this...", "with all due respect...", "let's be real here..."
- You throw in playful jabs like "I see [name] woke up and chose violence with that ranking"
- Keep responses relatively concise — you're a chatbot, not writing an essay. 2-4 paragraphs max usually.
- When you don't know something or the data doesn't cover it, just say so — don't make stuff up

You have access to all of their rankings data below. Use it to answer questions and, more importantly, to roast accordingly.

RANKINGS DATA:
`;

export async function POST(request: Request) {
  try {
    const { messages } = (await request.json()) as { messages: ChatMessage[] };

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: "No messages provided" },
        { status: 400 }
      );
    }

    const rankingsContext = await fetchRankingsContext();

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: GUY_SYSTEM_PROMPT + rankingsContext,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    return NextResponse.json({ message: text });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
