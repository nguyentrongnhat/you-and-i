-- Note: PostgreSQL 18+ is required to use uuidv7()

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT FALSE,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    enable_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Separate index for username to speed up queries
CREATE UNIQUE INDEX idx_users_username ON users(username);

CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID NOT NULL,
    role_id UUID NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_role FOREIGN KEY(role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- Indexes to quickly query roles of a user or users by role
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);

-- =========================
-- User_verifications table (email verification codes)
CREATE TABLE IF NOT EXISTS user_verifications (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    verification_code VARCHAR(10) NOT NULL,
    expiry TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index to quickly find unused codes by user_id
CREATE INDEX idx_user_verifications_user_id_used
    ON user_verifications(user_id, used);

-- =========================
-- Seed roles data
INSERT INTO roles (name)
VALUES
    ('ROLE_SUPER_ADMIN'),
    ('ROLE_ADMIN'),
    ('ROLE_USER')
ON CONFLICT (name) DO NOTHING;

-- =========================
-- Seed admin user
-- Password: 'admin123' encoded with BCrypt
INSERT INTO users(username, password, enabled,  email_verified)
VALUES ('admin@admin.com', '$2a$12$P9cuc9ycb.ApZ63gGUSE1OCd9Keh5jPmnXzhkrZ5JzllFJttoqX32', TRUE, TRUE)
ON CONFLICT (username) DO NOTHING;

-- =========================
-- Assign admin role to the admin user
INSERT INTO user_roles(user_id, role_id)
SELECT u.id, r.id
FROM users u JOIN roles r ON r.name = 'ROLE_ADMIN'
WHERE u.username = 'admin@admin.com'
ON CONFLICT DO NOTHING;
