-- ═══════════════════════════════════════════════════════════
-- RTVG Rankings - Write Policies for Authenticated Users
-- ═══════════════════════════════════════════════════════════

-- Allow authenticated users to insert their own user record (id must match auth.uid())
CREATE POLICY "Self insert" ON users FOR INSERT
  WITH CHECK (auth.uid()::text = id::text);

-- Allow authenticated users to update their own user record
CREATE POLICY "Self update" ON users FOR UPDATE
  USING (auth.uid()::text = id::text);

-- Allow authenticated users to insert shows (shared resource)
CREATE POLICY "Authenticated insert" ON shows FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update shows (for TMDB re-sync)
CREATE POLICY "Authenticated update" ON shows FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert seasons (shared resource)
CREATE POLICY "Authenticated insert" ON seasons FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update seasons
CREATE POLICY "Authenticated update" ON seasons FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert activity feed events (own events)
CREATE POLICY "Own data write" ON activity_feed_events FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);
