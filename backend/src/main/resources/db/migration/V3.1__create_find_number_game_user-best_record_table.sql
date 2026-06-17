CREATE TABLE IF NOT EXISTS find_number_game_user_best_record (
    id UUID PRIMARY KEY DEFAULT uuidv7(),

    user_id UUID NOT NULL,
    best_game_id UUID NOT NULL,

    completion_time INTEGER NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_best_record_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

    CONSTRAINT fk_best_record_game
    FOREIGN KEY (best_game_id)
    REFERENCES find_number_games(id)
    ON DELETE CASCADE
);

CREATE UNIQUE INDEX uk_best_record_user
ON find_number_game_user_best_record(user_id);

CREATE INDEX idx_best_record_completion_time
ON find_number_game_user_best_record(completion_time);