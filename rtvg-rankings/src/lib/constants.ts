export const SITE_NAME = "RTVG Rankings";
export const SITE_DESCRIPTION =
  "The definitive record of our television journey — TV season rankings by Tinetti, Chubbs & Poteete.";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://rtvgrankings.com";

export const YEARS = [2026, 2025, 2024, 2023, 2022, 2021] as const;
export const CURRENT_YEAR = new Date().getFullYear();

export const TIER_LABELS: Record<string, string> = {
  "Instant Classic": "All-time great, will rewatch multiple times",
  Great: "Exceptional season",
  "Very Good": "Strong season, above average",
  Good: "Solid, enjoyable season",
  Average: "Fine but forgettable",
  Bad: "Below average",
  ASS: "Terrible",
};

export const TIER_ICONS: Record<string, string> = {
  "Instant Classic": "⭐",
  Great: "🔥",
  "Very Good": "💪",
  Good: "👍",
  Average: "😐",
  Bad: "👎",
  ASS: "💩",
};

export const PRESET_AWARD_CATEGORIES = [
  "Show of the Year",
  "Best New Show",
  "Best Returning Show",
  "Most Disappointing",
  "Biggest Surprise",
  "Best Finale",
  "Best Pilot/Premiere",
  "Most Overrated",
  "Most Underrated",
];

export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";
export const TMDB_POSTER_SIZES = {
  thumbnail: "w185",
  list: "w342",
  detail: "w500",
  full: "w780",
  original: "original",
} as const;
