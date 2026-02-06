import { NextResponse } from "next/server";
import { searchShows } from "@/lib/tmdb/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results = await searchShows(query);
    return NextResponse.json({ results: results.slice(0, 10) });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to search TMDB" },
      { status: 500 }
    );
  }
}
