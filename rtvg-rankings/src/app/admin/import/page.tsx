"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";

// Hardcoded spreadsheet data parsed from Rankings.xlsx
const IMPORT_DATA: Record<number, Record<string, (string | null)[]>> = {
  2022: {
    Tinetti: [
      "Better Call Saul", "Station Eleven", "Severance", "Andor", "Yellowjackets",
      "House of the Dragon", "Barry", "Stranger Things", null, null,
      "For All Mankind", "The Afterparty", "Black Bird", null, "White Lotus",
      "The Boys", "We Own This City", null, null, null,
      null, null, "Rings of Power", "Ozark", "Reacher",
      null, "Peaky Blinders", null, null, "Tokyo Vice",
    ],
    Chubbs: [
      "Severance", "Yellowjackets", "Station Eleven", "Barry", "House of the Dragon",
      "The Bear", "Reservation Dogs", "Andor", "Atlanta", "Blackbird",
      "Stranger Things", "For All Mankind", "White Lotus", "The Boys", "Tokyo Vice",
      "Jack Ryan", "We Own This City", "Rings of Power", "Ozark",
    ],
    Poteete: [
      "Reservation Dogs", "Severance", "Station Eleven", "The Bear", "Atlanta",
      "Better Call Saul", "Andor", "Yellowjackets", "House of the Dragon", "White Lotus",
      "Stranger Things", "Blackbird", "Euphoria", "Abbott Elementary", "We Own This City",
      "Slow Horses", "For All Mankind", "Interview with the Vampire", "The Afterparty", "Reboot",
      "The Boys", "Ozark", "Reacher",
    ],
  },
  2023: {
    Tinetti: [
      "The Last of Us", "Succession", "Barry", "Fargo", "Silo",
      "Drops of God", "Gen V", "For All Mankind", "Slow Horses", "One Piece",
      "The Diplomat", "Blue Eye Samurai", "Loki", "Platonic", "Jack Ryan",
      "Hijack", "Lioness", "Monarch: Legacy of Monsters", "Ted Lasso", "Bodies",
      "The Mandalorian", "Jury Duty", "Daisy Jones and the Six", "The Night Agent", "Fall of the House of Usher",
      "A Murder at the End of the World", "Yellowjackets", "Kaleidoscope", "Outer Banks", "Full Circle",
    ],
    Chubbs: [
      "The Last of Us", "Barry", "The Bear", "Succession", "Fargo",
      "Top Boy", "Godfather of Harlem", "Reservation Dogs", "Beef", "Silo",
      "Drops of God", "Gen V", "For All Mankind", "Dave", "Shrinking",
      "Poker Face", "One Piece", "Hijack", "Jury Duty", "Platonic",
      "Abbott Elementary", "Ted Lasso", "Jack Ryan", "I Think You Should Leave", "Big Mouth",
      "Always Sunny in Philadelphia", "Yellowjackets", "Daisy Jones and the Six", "A Murder at the End of the World", "The Crowded Room",
      "You", "Kaleidoscope", "Outer Banks",
    ],
    Poteete: [
      "The Bear", "The Last of Us", "Reservation Dogs", "Drops of God", "Barry",
      "Beef", "Succession", "Fargo", "Blue Eye Samurai", "Warrior",
      "Gen V", "Poker Face", "The Other Two", "Dave", "Silo",
      "For All Mankind", "Top Boy", "Jury Duty", "Daisy Jones and the Six", "The Diplomat",
      "Dark Winds", "Platonic", "Only Murders in the Building", "Hijack", "Abbott Elementary",
      "Reacher", "Yellowjackets",
    ],
  },
  2024: {
    Tinetti: [
      "Shogun", "The Penguin", "Arcane", "The Gentlemen", "Slow Horses",
      "Shrinking", "Fallout", "Day of the Jackal", "The Diplomat", "Ripley",
      "House of the Dragon", "Lioness", "Dune: Prophecy", "Silo", "Black Doves",
      "Say Nothing", "Presumed Innocent", "Masters of the Air", "A Killer Paradox", "Mr. and Mrs. Smith",
      "Dark Matter", "Rings of Power", "Outer Banks", "Griselda", "The Boys",
      "3 Body Problem", "Constellation", "Halo", "Under the Bridge", "Criminal Record",
      "Baby Reindeer", "Fool Me Once",
    ],
    Chubbs: [
      "Shogun", "The Penguin", "Pachinko", "Say Nothing", "Fallout",
      "Arcane", "Tokyo Vice", "Shrinking", "Ripley", "Slow Horses",
      "Day of the Jackal", "The Gentlemen", "Presumed Innocent", "Colin from Accounts", "Squid Game",
      "Lioness", "A Killer Paradox", "Silo", "House of the Dragon", "Masters of the Air",
      "Mr. and Mrs. Smith", "Bad Sisters", "Bad Monkey", "Black Doves", "Griselda",
      "Rings of Power", "The Bear", "The Boys", "Under the Bridge", "Baby Reindeer",
      "Criminal Record", "Tires", "Ted", "True Detective",
    ],
    Poteete: [
      "Shogun", "Ripley", "Say Nothing", "The Penguin", "Fallout",
      "Mr. and Mrs. Smith", "Slow Horses", "Baby Reindeer", "Shrinking", "Colin from Accounts",
      "Arcane", "House of the Dragon", "A Killer Paradox", "The Gentlemen", "Day of the Jackal",
      "The Bear", "Dark Matter", "Squid Game", "Presumed Innocent", "Griselda",
      "The Diplomat", "Nobody Wants This", "Hacks", "La Maquina", "Masters of the Air",
      "Abbott Elementary", "Clipped",
    ],
  },
  2025: {
    Tinetti: [
      "Andor", "The Pitt", "Severance", "Invincible", "Task",
      "Common Side Effects", "Death by Lightning", "The Diplomat", "Pluribus", "Slow Horses",
      "The Studio", "Dept Q", "Adolescence", "Platonic", "Dexter: Resurrection",
      "The Last of Us", "White Lotus", "Untamed", "The Lowdown", "The Beast in Me",
      "Your Friends and Neighbors", "Murderbot", "Stick", "The Survivors", "Paradise",
      "Gen V", "The Terminal List: Dark Wolf", "American Primeval", "Mobland", "Stranger Things",
      "Dope Thief", "Ballard", "The Four Seasons", "Smoke", "The Eternaut",
    ],
    Chubbs: [
      "The Pitt", "Andor", "Severance", "Task", "Adolescence",
      "Common Side Effects", "Pluribus", "Death by Lightning", "Asura", "Dept Q",
      "The Bear", "Slow Horses", "The Rehearsal", "The Studio", "The Lowdown",
      "All Her Fault", "Poker Face", "Chief of War", "The Beast in Me", "Squid Game",
      "Stick", "Paradise", "Platonic", "White Lotus", "Your Friends and Neighbors",
      "Mobland", "Dope Thief", "Black Rabbit", "The Last of Us", "Stranger Things",
      "American Primeval", "The Eternaut", "Gen V", "Adults", "Tires",
      "Chad Powers", "The Paper", "The Four Seasons", "You", "Deli Boys",
      "Running Point",
    ],
    Poteete: [
      "The Pitt", "Severance", "Andor", "Task", "Common Side Effects",
      "Adolescence", "Pluribus", "Big Boys", "The Rehearsal", "The Chair Company",
      "The Studio", "Death by Lightning", "The Bear", "Asura", "The Lowdown",
      "Dexter: Resurrection", "Dept Q", "All Her Fault", "Slow Horses", "The Last of Us",
      "White Lotus", "The Beast in Me", "Long Story Short", "Chief of War", "The Eternaut",
      "Poker Face", "Rogue Heroes", "Your Friends and Neighbors", "I Love LA", "Tires",
      "Stranger Things", "Dying for Sex", "American Primeval", "Adults", "The Four Seasons",
      "Hacks", "A Thousand Blows", "Reacher",
    ],
  },
};

interface ImportResult {
  year: number;
  user: string;
  rank: number;
  showName: string;
  status: "success" | "error" | "skipped" | "pending";
  message?: string;
}

async function searchTMDB(query: string): Promise<any | null> {
  const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(query)}`);
  const data = await res.json();
  return data.results?.[0] || null;
}

async function getShowDetails(tmdbId: number): Promise<any | null> {
  const res = await fetch(`/api/tmdb/show/${tmdbId}`);
  if (!res.ok) return null;
  return res.json();
}

function findSeasonForYear(
  seasons: any[],
  year: number
): { season_number: number; id: number; air_date: string | null; episode_count: number; poster_path: string | null } | null {
  // Filter out specials (season 0)
  const realSeasons = seasons.filter((s: any) => s.season_number > 0);

  // Find season that aired in the target year
  for (const s of realSeasons) {
    if (s.air_date) {
      const airYear = new Date(s.air_date).getFullYear();
      if (airYear === year) return s;
    }
  }

  // If no exact match, find the closest season that aired before or during the year
  let closest = null;
  for (const s of realSeasons) {
    if (s.air_date) {
      const airYear = new Date(s.air_date).getFullYear();
      if (airYear <= year) {
        if (!closest || airYear > new Date(closest.air_date).getFullYear()) {
          closest = s;
        }
      }
    }
  }

  // Last resort: use the latest season
  return closest || realSeasons[realSeasons.length - 1] || null;
}

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

export default function ImportPage() {
  const { user, loading: authLoading } = useAuth();
  const [results, setResults] = useState<ImportResult[]>([]);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [done, setDone] = useState(false);
  const [missingUsers, setMissingUsers] = useState<string[]>([]);
  const [preflightDone, setPreflightDone] = useState(false);

  // Count total entries to import
  const totalEntries = Object.entries(IMPORT_DATA).reduce((sum, [_, users]) => {
    return sum + Object.entries(users).reduce((uSum, [_, shows]) => {
      return uSum + shows.filter((s) => s !== null).length;
    }, 0);
  }, 0);

  // Required user names from import data
  const requiredUsers = [...new Set(
    Object.values(IMPORT_DATA).flatMap((users) => Object.keys(users))
  )];

  async function checkPreflight() {
    const { data: dbUsers } = await supabase
      .from("users")
      .select("id, display_name")
      .order("created_at", { ascending: true });

    const existingNames = new Set((dbUsers || []).map((u: { display_name: string }) => u.display_name));
    const missing = requiredUsers.filter((name) => !existingNames.has(name));
    setMissingUsers(missing);
    setPreflightDone(true);
  }

  async function runImport() {
    if (!user) return;
    setRunning(true);
    setDone(false);
    setResults([]);
    const allResults: ImportResult[] = [];

    // First, get or map user IDs from Supabase
    const { data: dbUsers } = await supabase
      .from("users")
      .select("id, display_name")
      .order("created_at", { ascending: true });

    const userMap: Record<string, string> = {};
    for (const u of dbUsers || []) {
      userMap[u.display_name] = u.id;
    }

    // Check all required users exist
    const missing = requiredUsers.filter((name) => !userMap[name]);
    if (missing.length > 0) {
      setMissingUsers(missing);
      setRunning(false);
      return;
    }

    // Cache for shows we've already looked up (by TMDB ID)
    const showCache: Record<number, { showDbId: string; details: any }> = {};
    // Cache for seasons (by show_db_id + season_number)
    const seasonCache: Record<string, string> = {};

    let processed = 0;
    const total = totalEntries;
    setProgress({ current: 0, total });

    for (const [yearStr, users] of Object.entries(IMPORT_DATA)) {
      const year = parseInt(yearStr, 10);

      // Collect all unique show names for this year
      const allShowNames = new Set<string>();
      for (const [_, shows] of Object.entries(users)) {
        shows.forEach((s) => { if (s) allShowNames.add(s); });
      }

      // Look up each unique show and cache it
      const showNameToSeason: Record<string, {
        showDbId: string;
        seasonDbId: string;
        seasonNumber: number;
      } | null> = {};
      const showLookupErrors: Record<string, string> = {};

      for (const showName of allShowNames) {
        try {
          // Search TMDB
          const tmdbResult = await searchTMDB(showName);
          if (!tmdbResult) {
            showNameToSeason[showName] = null;
            showLookupErrors[showName] = `TMDB search returned no results for "${showName}"`;
            continue;
          }

          const tmdbId = tmdbResult.id;

          // Get or create show in our DB
          let showDbId: string;
          let details: any;

          if (showCache[tmdbId]) {
            showDbId = showCache[tmdbId].showDbId;
            details = showCache[tmdbId].details;
          } else {
            details = await getShowDetails(tmdbId);
            if (!details) {
              showNameToSeason[showName] = null;
              showLookupErrors[showName] = `TMDB details fetch failed for ID ${tmdbId}`;
              continue;
            }

            // Ensure show exists in DB
            const { data: existingShow } = await supabase
              .from("shows")
              .select("id")
              .eq("tmdb_id", tmdbId)
              .single();

            if (existingShow) {
              showDbId = existingShow.id;
            } else {
              const posterUrl = details.poster_path
                ? `${TMDB_IMAGE_BASE}/w342${details.poster_path}`
                : null;
              const { data: newShow, error } = await supabase
                .from("shows")
                .insert({
                  tmdb_id: tmdbId,
                  title: details.name,
                  poster_url: posterUrl,
                  genres: (details.genres || []).map((g: any) => g.name),
                  network: details.networks?.[0]?.name || "Unknown",
                  status: details.status || "Unknown",
                })
                .select("id")
                .single();

              if (error || !newShow) {
                showNameToSeason[showName] = null;
                showLookupErrors[showName] = `DB insert failed for show: ${error?.message || "unknown error"}`;
                continue;
              }
              showDbId = newShow.id;
            }

            showCache[tmdbId] = { showDbId, details };
          }

          // Find the right season for this year
          const season = findSeasonForYear(details.seasons || [], year);
          if (!season) {
            showNameToSeason[showName] = null;
            showLookupErrors[showName] = `No season found airing in ${year} (show: ${details.name}, seasons: ${(details.seasons || []).filter((s: any) => s.season_number > 0).map((s: any) => `S${s.season_number}:${s.air_date || "?"}`).join(", ")})`;
            continue;
          }

          // Ensure season exists in DB
          const seasonKey = `${showDbId}-${season.season_number}`;
          let seasonDbId: string;

          if (seasonCache[seasonKey]) {
            seasonDbId = seasonCache[seasonKey];
          } else {
            const { data: existingSeason } = await supabase
              .from("seasons")
              .select("id")
              .eq("show_id", showDbId)
              .eq("season_number", season.season_number)
              .single();

            if (existingSeason) {
              seasonDbId = existingSeason.id;
            } else {
              const { data: newSeason, error } = await supabase
                .from("seasons")
                .insert({
                  show_id: showDbId,
                  tmdb_season_id: season.id,
                  season_number: season.season_number,
                  air_date_start: season.air_date,
                  episode_count: season.episode_count || 0,
                  poster_url: season.poster_path
                    ? `${TMDB_IMAGE_BASE}/w342${season.poster_path}`
                    : null,
                })
                .select("id")
                .single();

              if (error || !newSeason) {
                showNameToSeason[showName] = null;
                showLookupErrors[showName] = `DB insert failed for season: ${error?.message || "unknown error"}`;
                continue;
              }
              seasonDbId = newSeason.id;
            }
            seasonCache[seasonKey] = seasonDbId;
          }

          showNameToSeason[showName] = {
            showDbId,
            seasonDbId,
            seasonNumber: season.season_number,
          };
        } catch (err) {
          showNameToSeason[showName] = null;
          showLookupErrors[showName] = `Unexpected error: ${err instanceof Error ? err.message : String(err)}`;
        }

        // Small delay to avoid rate-limiting TMDB
        await new Promise((r) => setTimeout(r, 250));
      }

      // Now insert ranking entries for each user
      for (const [userName, shows] of Object.entries(users)) {
        const userId = userMap[userName];
        if (!userId) {
          shows.forEach((showName, i) => {
            if (showName) {
              processed++;
              setProgress({ current: processed, total });
              allResults.push({
                year,
                user: userName,
                rank: i + 1,
                showName,
                status: "error",
                message: `User "${userName}" not found in database. Sign in first.`,
              });
            }
          });
          continue;
        }

        // Delete existing entries for this user+year before import
        await supabase
          .from("ranking_entries")
          .delete()
          .eq("user_id", userId)
          .eq("year", year);

        const entries: any[] = [];
        let rank = 0;

        for (let i = 0; i < shows.length; i++) {
          const showName = shows[i];
          if (!showName) continue;

          rank++;
          processed++;
          setProgress({ current: processed, total });

          const lookup = showNameToSeason[showName];
          if (!lookup) {
            allResults.push({
              year,
              user: userName,
              rank,
              showName,
              status: "error",
              message: showLookupErrors[showName] || "Could not find on TMDB",
            });
            continue;
          }

          entries.push({
            user_id: userId,
            season_id: lookup.seasonDbId,
            year,
            rank_position: rank,
          });

          allResults.push({
            year,
            user: userName,
            rank,
            showName,
            status: "success",
            message: `S${lookup.seasonNumber}`,
          });
        }

        // Batch insert
        if (entries.length > 0) {
          const { error } = await supabase.from("ranking_entries").insert(entries);
          if (error) {
            // Mark all as error
            for (let i = allResults.length - entries.length; i < allResults.length; i++) {
              if (allResults[i].status === "success") {
                allResults[i].status = "error";
                allResults[i].message = `DB insert failed: ${error.message}`;
              }
            }
          }
        }
      }
    }

    setResults(allResults);
    setRunning(false);
    setDone(true);
  }

  if (authLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Sign in required</h1>
        <Link href="/admin" className="text-amber-500">Go to Admin</Link>
      </div>
    );
  }

  const successCount = results.filter((r) => r.status === "success").length;
  const errorCount = results.filter((r) => r.status === "error").length;

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12 animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/admin" className="text-gray-500 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase">
          Import <span className="text-amber-500">Historical Data</span>
        </h1>
      </div>
      <p className="text-gray-400 text-sm mb-8">
        Import rankings from the spreadsheet. This will search TMDB for each show and add them to the database.
      </p>

      {/* Preview */}
      <div className="glass rounded-xl border border-white/5 p-6 mb-8">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Data to Import</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(IMPORT_DATA).map(([year, users]) => {
            const count = Object.values(users).reduce((s, shows) => s + shows.filter(Boolean).length, 0);
            const userNames = Object.keys(users);
            return (
              <div key={year} className="bg-white/5 rounded-lg p-4">
                <p className="text-2xl font-black text-amber-500">{year}</p>
                <p className="text-xs text-gray-400 mt-1">{count} entries</p>
                <p className="text-[10px] text-gray-600 mt-0.5">{userNames.join(", ")}</p>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-gray-500 mt-4">{totalEntries} total entries to import</p>
      </div>

      {/* Preflight Check */}
      {!preflightDone && !done && (
        <button
          onClick={checkPreflight}
          className="w-full py-4 rounded-xl font-bold text-lg transition-all mb-8 bg-white/10 hover:bg-white/20 text-white"
        >
          Check Prerequisites
        </button>
      )}

      {/* Missing Users Warning */}
      {missingUsers.length > 0 && (
        <div className="glass rounded-xl border border-red-500/30 bg-red-500/5 p-6 mb-8">
          <h2 className="text-lg font-bold text-red-400 mb-2">Missing Users</h2>
          <p className="text-sm text-gray-300 mb-3">
            The following users must sign in to the site before import can proceed:
          </p>
          <ul className="space-y-1">
            {missingUsers.map((name) => (
              <li key={name} className="text-red-400 text-sm font-mono">
                {name} - not found in database
              </li>
            ))}
          </ul>
          <p className="text-xs text-gray-500 mt-3">
            Have them visit the site and click &quot;Sign in with Google&quot;, then click &quot;Check Prerequisites&quot; again.
          </p>
          <button
            onClick={checkPreflight}
            className="mt-4 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-bold transition-colors"
          >
            Re-check
          </button>
        </div>
      )}

      {/* Import Button */}
      {preflightDone && missingUsers.length === 0 && !done && (
        <button
          onClick={runImport}
          disabled={running}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all mb-8 ${
            running
              ? "bg-white/5 text-gray-500 cursor-not-allowed"
              : "bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20"
          }`}
        >
          {running ? (
            <span className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              Importing... ({progress.current}/{progress.total})
            </span>
          ) : (
            `Import ${totalEntries} Rankings`
          )}
        </button>
      )}

      {/* Results */}
      {done && (
        <div className="mb-8">
          <div className="glass rounded-xl border border-white/5 p-6 mb-6">
            <h2 className="text-lg font-bold mb-2">Import Complete</h2>
            <div className="flex gap-6">
              <p className="text-emerald-400 font-bold">{successCount} successful</p>
              {errorCount > 0 && <p className="text-red-400 font-bold">{errorCount} errors</p>}
            </div>
          </div>

          <div className="flex gap-4 mb-6">
            <Link
              href="/admin/rankings"
              className="flex-1 py-3 rounded-xl bg-amber-500 text-black font-bold text-center hover:bg-amber-400 transition-colors"
            >
              Go to Manage Rankings
            </Link>
            {errorCount > 0 && (
              <button
                onClick={() => { setDone(false); setResults([]); }}
                className="flex-1 py-3 rounded-xl bg-white/10 text-white font-bold text-center hover:bg-white/20 transition-colors"
              >
                Re-run Import
              </button>
            )}
          </div>
        </div>
      )}

      {/* Result Details */}
      {results.length > 0 && (
        <div className="space-y-6">
          {Object.entries(IMPORT_DATA).map(([yearStr]) => {
            const year = parseInt(yearStr, 10);
            const yearResults = results.filter((r) => r.year === year);
            if (yearResults.length === 0) return null;

            return (
              <div key={year} className="glass rounded-xl border border-white/5 p-5">
                <h3 className="text-lg font-bold text-amber-500 mb-3">{year}</h3>
                <div className="space-y-1 max-h-80 overflow-y-auto">
                  {yearResults.map((r, i) => (
                    <div
                      key={i}
                      className={`px-3 py-1.5 rounded text-xs ${
                        r.status === "success"
                          ? "text-gray-300"
                          : "text-red-400 bg-red-500/5"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 text-right text-gray-600 shrink-0">#{r.rank}</span>
                        <span className="w-16 text-gray-500 shrink-0">{r.user}</span>
                        <span className="flex-grow truncate">{r.showName}</span>
                        {r.status === "success" ? (
                          <>
                            <span className="shrink-0 text-gray-500">{r.message}</span>
                            <span className="text-emerald-500 shrink-0">✓</span>
                          </>
                        ) : (
                          <span className="text-red-500 shrink-0">✗</span>
                        )}
                      </div>
                      {r.status === "error" && r.message && (
                        <p className="ml-[6.5rem] text-[10px] text-red-400/70 mt-0.5 break-words">{r.message}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
