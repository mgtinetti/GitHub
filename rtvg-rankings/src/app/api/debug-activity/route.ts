import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("activity_feed_events")
    .select("id, user_id, event_type, metadata, created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  return NextResponse.json({ count: data?.length ?? 0, error: error?.message ?? null, data });
}
