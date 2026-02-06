import { NextResponse } from "next/server";
import { ACTIVITY_FEED } from "@/lib/mock-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  const events = ACTIVITY_FEED.slice(offset, offset + limit);

  return NextResponse.json({
    events,
    total: ACTIVITY_FEED.length,
    hasMore: offset + limit < ACTIVITY_FEED.length,
  });
}
