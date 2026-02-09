import { NextResponse } from "next/server";
import { getShowCredits } from "@/lib/tmdb/client";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const tmdbId = parseInt(id, 10);

  if (isNaN(tmdbId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    const cast = await getShowCredits(tmdbId);
    return NextResponse.json({ cast });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch credits" },
      { status: 500 }
    );
  }
}
