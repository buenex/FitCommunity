-- Idempotent for volumes criados antes da coluna streak_days_target
ALTER TABLE communities
  ADD COLUMN IF NOT EXISTS streak_days_target SMALLINT NOT NULL DEFAULT 4;

ALTER TABLE communities
  DROP CONSTRAINT IF EXISTS communities_streak_days_target_check;

ALTER TABLE communities
  ADD CONSTRAINT communities_streak_days_target_check CHECK (streak_days_target BETWEEN 2 AND 6);
