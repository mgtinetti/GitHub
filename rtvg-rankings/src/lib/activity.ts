import { supabase } from "@/lib/supabase/client";

export async function logActivity(
  userId: string,
  eventType: "add" | "move" | "remove" | "finalize",
  metadata: Record<string, any>,
  year?: number
) {
  await supabase.from("activity_feed_events").insert({
    user_id: userId,
    event_type: eventType,
    metadata,
    year: year || null,
  });
}
