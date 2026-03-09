-- ═══════════════════════════════════════════════════════════
-- RTVG Rankings - Non Rankable Shows
-- Shows like documentaries, reality TV, previous-year shows, etc.
-- ═══════════════════════════════════════════════════════════

CREATE TABLE non_rankable_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  show_id UUID NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  season_number INTEGER NOT NULL DEFAULT 1,
  category TEXT NOT NULL DEFAULT 'Other',
  note TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, show_id, year, season_number)
);

CREATE INDEX idx_non_rankable_user_year ON non_rankable_entries(user_id, year);

ALTER TABLE non_rankable_entries ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Public read" ON non_rankable_entries FOR SELECT USING (true);

-- Authenticated users can manage their own entries
CREATE POLICY "Own data write" ON non_rankable_entries FOR ALL
  USING (auth.uid()::text = user_id::text);

-- Any authenticated user can insert
CREATE POLICY "Authenticated insert" ON non_rankable_entries FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Any authenticated user can delete
CREATE POLICY "Authenticated delete" ON non_rankable_entries FOR DELETE
  USING (auth.role() = 'authenticated');
