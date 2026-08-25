import { supabase } from "@/lib/supabase/client";

export async function logActivity(
  userId: string,
  eventType: "add" | "move" | "remove" | "finalize",
  metadata: Record<string, any>,
  year?: number
) {
  const { data: { session } } = await supabase.auth.getSession();
  console.log("logActivity called:", { userId, eventType, metadata, hasSession: !!session, authUid: session?.user?.id });
  const { error } = await supabase.from("activity_feed_events").insert({
    user_id: userId,
    event_type: eventType,
    metadata,
    year: year || null,
  });
  if (error) {
    console.error("logActivity FAILED:", error.message, error);
  } else {
    console.log("logActivity SUCCESS");
  }
}
