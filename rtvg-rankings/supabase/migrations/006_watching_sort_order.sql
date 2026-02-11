-- ═══════════════════════════════════════════════════════════
-- RTVG Rankings - Add sort_order to currently_watching
-- ═══════════════════════════════════════════════════════════

ALTER TABLE currently_watching
  ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;

-- Backfill sort_order based on added_at (most recent = lowest number = top of list)
WITH ordered AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY added_at DESC) AS rn
  FROM currently_watching
)
UPDATE currently_watching
SET sort_order = ordered.rn
FROM ordered
WHERE currently_watching.id = ordered.id;
