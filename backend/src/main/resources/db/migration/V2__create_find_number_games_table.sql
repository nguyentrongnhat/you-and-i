-- =========================
-- Create find_number_games table

CREATE TABLE IF NOT EXISTS find_number_games (
    id UUID PRIMARY KEY DEFAULT uuidv7(),

    user_id UUID NOT NULL,

    start_time TIMESTAMP,
    end_time TIMESTAMP,

    total_numbers_to_find INTEGER DEFAULT 0,
    difficulty_level VARCHAR(20) DEFAULT 'NORMAL',
    game_status VARCHAR(20) DEFAULT 'NEW',
    last_selected_number INTEGER DEFAULT 0,

    elapsed_time INTEGER DEFAULT 0,
    completion_time INTEGER DEFAULT 0,
    bonus_time INTEGER DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_find_number_games_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

-- =========================
-- Index for faster lookup by user
CREATE INDEX IF NOT EXISTS idx_find_number_games_user_id
    ON find_number_games(user_id);

-- Optional: index for sorting / querying by time
CREATE INDEX IF NOT EXISTS idx_find_number_games_start_time
    ON find_number_games(start_time);

CREATE INDEX IF NOT EXISTS idx_fng_user_id_id
    ON find_number_games(user_id, id DESC);

CREATE INDEX IF NOT EXISTS idx_fng_user_id_start_time
    ON find_number_games(user_id, start_time DESC);