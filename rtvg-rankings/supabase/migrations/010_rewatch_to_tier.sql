-- Migration: Rename rewatchability to tier
ALTER TABLE ranking_entries ADD COLUMN tier TEXT;
UPDATE ranking_entries SET tier = CASE
  WHEN rewatchability = 'Instant Classic' THEN 'Instant Classic'
  WHEN rewatchability = 'High' THEN 'Great'
  WHEN rewatchability = 'Medium' THEN 'Good'
  WHEN rewatchability = 'Low' THEN 'Average'
  ELSE NULL
END;
ALTER TABLE ranking_entries ADD CONSTRAINT ranking_entries_tier_check
  CHECK (tier IN ('Instant Classic', 'Great', 'Very Good', 'Good', 'Average', 'Bad', 'ASS'));
ALTER TABLE ranking_entries DROP COLUMN rewatchability;
