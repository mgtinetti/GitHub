-- Pipeline (shows to watch next)
CREATE TABLE pipeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  show_id UUID NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
  season_number INTEGER NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, show_id, season_number)
);

CREATE INDEX idx_pipeline_user ON pipeline(user_id);

ALTER TABLE pipeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON pipeline FOR SELECT USING (true);
CREATE POLICY "Own data write" ON pipeline FOR ALL
  USING (auth.uid()::text = user_id::text);
CREATE POLICY "Authenticated insert" ON pipeline FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete" ON pipeline FOR DELETE
  USING (auth.role() = 'authenticated');
