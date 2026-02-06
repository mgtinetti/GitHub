import { NextResponse } from "next/server";
import { getRankingsByYear, USERS } from "@/lib/mock-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get("year") || "2025", 10);
  const userId = searchParams.get("userId");

  const rankings = getRankingsByYear(year);

  if (userId) {
    return NextResponse.json({
      rankings: rankings[userId] || [],
      user: USERS.find((u) => u.id === userId),
    });
  }

  return NextResponse.json({ rankings, users: USERS });
}
