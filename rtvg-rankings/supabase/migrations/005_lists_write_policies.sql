-- ═══════════════════════════════════════════════════════════
-- RTVG Rankings - Write policies for supplementary lists
-- Allow any authenticated user to insert/delete entries
-- (safe because only whitelisted emails can authenticate)
-- ═══════════════════════════════════════════════════════════

-- Episode ranking entries
CREATE POLICY "Authenticated insert" ON episode_ranking_entries FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete" ON episode_ranking_entries FOR DELETE
  USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update" ON episode_ranking_entries FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Performance ranking entries
CREATE POLICY "Authenticated insert" ON performance_ranking_entries FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete" ON performance_ranking_entries FOR DELETE
  USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update" ON performance_ranking_entries FOR UPDATE
  USING (auth.role() = 'authenticated');

-- All-time entries
CREATE POLICY "Authenticated insert" ON all_time_entries FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete" ON all_time_entries FOR DELETE
  USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update" ON all_time_entries FOR UPDATE
  USING (auth.role() = 'authenticated');
