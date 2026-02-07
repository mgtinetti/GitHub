-- ═══════════════════════════════════════════════════════════
-- RTVG Rankings - Admin Import Policies
-- Allow any authenticated user to insert/delete ranking entries
-- for any user (needed for admin bulk import of historical data).
-- Safe because only whitelisted emails can authenticate.
-- ═══════════════════════════════════════════════════════════

-- Allow any authenticated user to insert ranking entries (for admin import)
CREATE POLICY "Authenticated insert" ON ranking_entries FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Allow any authenticated user to delete ranking entries (for admin import cleanup)
CREATE POLICY "Authenticated delete" ON ranking_entries FOR DELETE
  USING (auth.role() = 'authenticated');
