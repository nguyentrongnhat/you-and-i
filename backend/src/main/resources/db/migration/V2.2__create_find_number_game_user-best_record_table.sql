CREATE TABLE IF NOT EXISTS find_number_game_stats (
    id UUID PRIMARY KEY DEFAULT uuidv7(),

    user_id UUID NOT NULL,
    best_record_game_id UUID NOT NULL,

    best_completion_time INTEGER NOT NULL,
    total_games_played BIGINT NOT NULL DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_find_number_game_stats_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

    CONSTRAINT fk_find_number_game_stats_best_game
    FOREIGN KEY (best_record_game_id)
    REFERENCES find_number_games(id)
    ON DELETE CASCADE
    );

CREATE UNIQUE INDEX IF NOT EXISTS uk_find_number_game_stats_user
    ON find_number_game_stats(user_id);

CREATE INDEX IF NOT EXISTS idx_find_number_game_stats_best_completion_time
    ON find_number_game_stats(best_completion_time);