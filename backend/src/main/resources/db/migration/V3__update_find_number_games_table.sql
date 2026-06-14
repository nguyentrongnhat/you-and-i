-- =========================
-- Add new columns

ALTER TABLE find_number_games
    ADD COLUMN total_numbers_to_find INTEGER DEFAULT 0;

ALTER TABLE find_number_games
    ADD COLUMN difficulty_level VARCHAR(20) DEFAULT 'NORMAL';

ALTER TABLE find_number_games
    ADD COLUMN game_status VARCHAR(20) DEFAULT 'NEW';

ALTER TABLE find_number_games
    ADD COLUMN last_selected_number INTEGER DEFAULT 0;

ALTER TABLE find_number_games
    ADD COLUMN elapsed_time VARCHAR(20);

-- =========================
-- Rename old column

ALTER TABLE find_number_games
    RENAME COLUMN time_to_finish TO completion_time;