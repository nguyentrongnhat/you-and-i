-- =========================
-- Create find_number_games table

CREATE TABLE IF NOT EXISTS find_number_games (
    id UUID PRIMARY KEY DEFAULT uuidv7(),

    user_id UUID NOT NULL,

    start_time TIMESTAMP,
    end_time TIMESTAMP,

    time_to_finish VARCHAR(10),
    bonus_time INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_find_number_games_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

-- =========================
-- Index for faster lookup by user
CREATE INDEX idx_find_number_games_user_id
    ON find_number_games(user_id);

-- Optional: index for sorting / querying by time
CREATE INDEX idx_find_number_games_start_time
    ON find_number_games(start_time);

CREATE INDEX idx_find_number_games_end_time
    ON find_number_games(end_time);