import { NextResponse } from "next/server";
import { getSeasonDetails } from "@/lib/tmdb/client";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; seasonNumber: string }> }
) {
  const { id, seasonNumber } = await params;
  const tmdbId = parseInt(id, 10);
  const season = parseInt(seasonNumber, 10);

  if (isNaN(tmdbId) || isNaN(season)) {
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  }

  try {
    const data = await getSeasonDetails(tmdbId, season);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch season details" },
      { status: 500 }
    );
  }
}
