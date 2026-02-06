import Link from "next/link";
import { timeAgo } from "@/lib/utils";
import type { ActivityEvent } from "@/types";

interface ActivityFeedProps {
  events: ActivityEvent[];
  limit?: number;
}

function EventText({ event }: { event: ActivityEvent }) {
  const userName = event.user?.display_name || "Someone";
  const m = event.metadata;

  switch (event.event_type) {
    case "add":
      return (
        <p>
          <span className="font-bold text-white">{userName}</span> added{" "}
          <span className="text-amber-500">
            {m.show_name} S{m.season_number}
          </span>{" "}
          at #{m.new_rank}
        </p>
      );
    case "move":
      return (
        <p>
          <span className="font-bold text-white">{userName}</span> moved{" "}
          <span className="text-amber-500">
            {m.show_name} S{m.season_number}
          </span>{" "}
          from #{m.old_rank} to #{m.new_rank}
        </p>
      );
    case "remove":
      return (
        <p>
          <span className="font-bold text-white">{userName}</span> removed{" "}
          <span className="text-amber-500">
            {m.show_name} S{m.season_number}
          </span>{" "}
          from their rankings
        </p>
      );
    case "finalize":
      return (
        <p>
          <span className="font-bold text-white">{userName}</span> marked their{" "}
          {m.year} rankings as{" "}
          <span className="text-emerald-400">finalized</span>
        </p>
      );
    case "award_pick":
      return (
        <p>
          <span className="font-bold text-white">{userName}</span> picked{" "}
          <span className="text-amber-500">{m.show_name}</span> for{" "}
          <span className="italic">{m.award_name}</span>
        </p>
      );
    case "blog_post":
      return (
        <p>
          <span className="font-bold text-white">{userName}</span> published{" "}
          <Link
            href={`/blog/${m.post_slug || ""}`}
            className="text-amber-500 hover:underline"
          >
            &ldquo;{m.post_title}&rdquo;
          </Link>
        </p>
      );
    default:
      return null;
  }
}

export default function ActivityFeed({ events, limit = 8 }: ActivityFeedProps) {
  const displayEvents = events.slice(0, limit);

  return (
    <div className="space-y-1">
      {displayEvents.map((event) => (
        <div key={event.id} className="flex gap-4 group">
          <div className="flex flex-col items-center">
            <div className="w-2 h-2 rounded-full bg-amber-500 ring-4 ring-amber-500/10 mb-1 mt-2 shrink-0" />
            <div className="w-px flex-grow bg-white/10 group-last:hidden" />
          </div>
          <div className="pb-5">
            <div className="text-sm text-gray-400 leading-relaxed mb-1">
              <EventText event={event} />
            </div>
            <span className="text-[10px] font-mono uppercase text-gray-600 tracking-tighter">
              {timeAgo(event.created_at)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
