-- Drop old index
DROP INDEX IF EXISTS idx_find_number_games_end_time;

-- Create new index
CREATE INDEX IF NOT EXISTS idx_fng_user_id_id
    ON find_number_games(user_id, id DESC);

CREATE INDEX IF NOT EXISTS idx_fng_user_id_start_time
    ON find_number_games(user_id, start_time DESC);

ALTER TABLE find_number_games
ALTER COLUMN completion_time TYPE INTEGER
USING ROUND(completion_time::NUMERIC)::INTEGER;

ALTER TABLE find_number_games
ALTER COLUMN elapsed_time TYPE INTEGER
USING ROUND(elapsed_time::NUMERIC)::INTEGER;
