"use client";

import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { TMDB_IMAGE_BASE, TIER_ICONS } from "@/lib/constants";
import type { Tier } from "@/types";

export interface ManagedEntry {
  localId: string;
  tmdbId: number;
  showName: string;
  posterPath: string | null;
  network: string;
  genres: string[];
  seasonNumber: number;
  tmdbSeasonId: number;
  airDate: string | null;
  episodeCount: number;
  score: number | null;
  tier: Tier | null;
  review: string | null;
  // If this came from Supabase
  dbId?: string;
  showDbId?: string;
  seasonDbId?: string;
}

interface RankingListProps {
  entries: ManagedEntry[];
  onReorder: (entries: ManagedEntry[], movedLocalId: string) => void;
  onRemove: (localId: string) => void;
  onUpdateEntry: (localId: string, updates: Partial<ManagedEntry>) => void;
}

const TIER_OPTIONS: Tier[] = ["Instant Classic", "Great", "Very Good", "Good", "Average", "Bad", "ASS"];

export default function RankingList({
  entries,
  onReorder,
  onRemove,
  onUpdateEntry,
}: RankingListProps) {
  function handleDragEnd(result: DropResult) {
    if (!result.destination) return;
    const items = Array.from(entries);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    onReorder(items, reordered.localId);
  }

  if (entries.length === 0) {
    return (
      <div className="glass rounded-2xl border border-white/5 p-12 text-center">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <p className="text-gray-400 text-sm mb-1">No shows ranked yet</p>
        <p className="text-gray-600 text-xs">Search above to add shows to your rankings</p>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="rankings">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-2"
          >
            {entries.map((entry, index) => (
              <Draggable key={entry.localId} draggableId={entry.localId} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`glass rounded-xl border transition-all ${
                      snapshot.isDragging
                        ? "border-amber-500/50 shadow-2xl shadow-amber-500/10 scale-[1.02]"
                        : "border-white/5 hover:border-white/10"
                    }`}
                  >
                    <div className="flex items-start gap-3 p-3">
                      {/* Drag Handle + Rank */}
                      <div
                        {...provided.dragHandleProps}
                        className="flex flex-col items-center gap-1 pt-1 shrink-0 cursor-grab active:cursor-grabbing"
                      >
                        <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm8-16a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" />
                        </svg>
                        <span
                          className={`text-lg font-black ${
                            index < 3 ? "text-amber-500" : "text-gray-500"
                          }`}
                        >
                          {index + 1}
                        </span>
                      </div>

                      {/* Poster */}
                      <div className="w-12 h-[4.5rem] rounded-lg overflow-hidden bg-white/5 shrink-0">
                        {entry.posterPath ? (
                          <img
                            src={`${TMDB_IMAGE_BASE}/w92${entry.posterPath}`}
                            alt={entry.showName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-600 text-[10px]">
                            N/A
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-grow min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h4 className="font-bold text-sm text-white truncate">
                              {entry.showName}
                            </h4>
                            <p className="text-xs text-gray-500">
                              Season {entry.seasonNumber} &middot; {entry.network}
                            </p>
                          </div>
                          <button
                            onClick={() => onRemove(entry.localId)}
                            className="shrink-0 p-1 text-gray-600 hover:text-red-400 transition-colors"
                            title="Remove from rankings"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>

                        {/* Score + Tier inline */}
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-1.5">
                            <label className="text-[10px] text-gray-500 uppercase">Score</label>
                            <input
                              type="number"
                              min="0"
                              max="10"
                              step="0.1"
                              value={entry.score ?? ""}
                              onChange={(e) =>
                                onUpdateEntry(entry.localId, {
                                  score: e.target.value ? parseFloat(e.target.value) : null,
                                })
                              }
                              placeholder="—"
                              className="w-14 px-2 py-1 text-xs bg-white/5 border border-white/10 rounded-lg text-amber-500 font-bold text-center focus:outline-none focus:border-amber-500/50"
                            />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <label className="text-[10px] text-gray-500 uppercase">Tier</label>
                            <select
                              value={entry.tier || ""}
                              onChange={(e) =>
                                onUpdateEntry(entry.localId, {
                                  tier: (e.target.value || null) as Tier | null,
                                })
                              }
                              className="px-2 py-1 text-xs bg-white/5 border border-white/10 rounded-lg text-gray-300 focus:outline-none focus:border-amber-500/50 appearance-none cursor-pointer"
                            >
                              <option value="">—</option>
                              {TIER_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>
                                  {TIER_ICONS[opt]} {opt}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
