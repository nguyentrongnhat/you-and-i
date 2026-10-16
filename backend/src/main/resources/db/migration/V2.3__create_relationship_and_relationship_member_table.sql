CREATE TABLE IF NOT EXISTS relationships (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    start_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS relationship_members (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    relationship_id UUID NOT NULL,
    user_id UUID NOT NULL,

    CONSTRAINT fk_relationship_members_relationship
    FOREIGN KEY (relationship_id)
    REFERENCES relationships(id)
    ON DELETE CASCADE,

    CONSTRAINT fk_relationship_members_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

    CONSTRAINT uk_relationship_members_relationship_user
    UNIQUE (relationship_id, user_id)
);

CREATE INDEX idx_relationships_status
    ON relationships(status);

CREATE INDEX idx_relationships_type
    ON relationships(type);

CREATE INDEX idx_relationship_members_user_id
    ON relationship_members(user_id);