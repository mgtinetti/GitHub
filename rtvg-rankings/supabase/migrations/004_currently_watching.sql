-- ═══════════════════════════════════════════════════════════
-- RTVG Rankings - Currently Watching
-- ═══════════════════════════════════════════════════════════

CREATE TABLE currently_watching (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  show_id UUID NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
  season_number INTEGER NOT NULL,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, show_id, season_number)
);

CREATE INDEX idx_currently_watching_user ON currently_watching(user_id);

ALTER TABLE currently_watching ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Public read" ON currently_watching FOR SELECT USING (true);

-- Authenticated users can manage their own entries
CREATE POLICY "Own data write" ON currently_watching FOR ALL
  USING (auth.uid()::text = user_id::text);

-- Any authenticated user can insert (for admin managing others)
CREATE POLICY "Authenticated insert" ON currently_watching FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Any authenticated user can delete (for admin managing others)
CREATE POLICY "Authenticated delete" ON currently_watching FOR DELETE
  USING (auth.role() = 'authenticated');
