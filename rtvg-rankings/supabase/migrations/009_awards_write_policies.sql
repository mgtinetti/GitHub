-- ═══════════════════════════════════════════════════════════
-- RTVG Rankings - Write policies for award categories & picks
-- ═══════════════════════════════════════════════════════════

-- Award categories: any authenticated user can create
CREATE POLICY "Authenticated insert" ON award_categories FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Award categories: any authenticated user can update (for approvals, etc.)
CREATE POLICY "Authenticated update" ON award_categories FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Award categories: any authenticated user can delete
CREATE POLICY "Authenticated delete" ON award_categories FOR DELETE
  USING (auth.role() = 'authenticated');

-- Award picks: any authenticated user can insert
CREATE POLICY "Authenticated insert" ON award_picks FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Award picks: any authenticated user can update their own picks
CREATE POLICY "Authenticated update" ON award_picks FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Award picks: any authenticated user can delete
CREATE POLICY "Authenticated delete" ON award_picks FOR DELETE
  USING (auth.role() = 'authenticated');
