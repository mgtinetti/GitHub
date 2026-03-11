-- ═══════════════════════════════════════════════════════════
-- RTVG Rankings - All-Time: Change from season-based to show-based
-- All-time rankings should reference shows, not specific seasons
-- ═══════════════════════════════════════════════════════════

-- Add show_id column
ALTER TABLE all_time_entries ADD COLUMN show_id UUID REFERENCES shows(id) ON DELETE CASCADE;

-- Populate show_id from existing season_id -> seasons -> shows
UPDATE all_time_entries
SET show_id = seasons.show_id
FROM seasons
WHERE all_time_entries.season_id = seasons.id;

-- Make show_id NOT NULL now that it's populated
ALTER TABLE all_time_entries ALTER COLUMN show_id SET NOT NULL;

-- Drop the old season_id column and its constraints
ALTER TABLE all_time_entries DROP COLUMN season_id;

-- Update unique constraint: one entry per user per show
ALTER TABLE all_time_entries DROP CONSTRAINT IF EXISTS all_time_entries_user_id_season_id_key;
ALTER TABLE all_time_entries ADD CONSTRAINT all_time_entries_user_id_show_id_key UNIQUE (user_id, show_id);

-- Add index for show_id lookups
CREATE INDEX idx_all_time_show ON all_time_entries(show_id);
