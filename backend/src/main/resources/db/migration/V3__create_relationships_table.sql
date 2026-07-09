-- V3: Create relationships and relationship_members tables

CREATE TABLE IF NOT EXISTS relationships (
    id            UUID         PRIMARY KEY DEFAULT uuidv7(),
    type          VARCHAR(50)  NOT NULL,
    status        VARCHAR(50)  NOT NULL DEFAULT 'ACTIVE',
    start_at      TIMESTAMPTZ,
    description   VARCHAR(500),
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_relationships_type   ON relationships(type);
CREATE INDEX IF NOT EXISTS idx_relationships_status ON relationships(status);

-- =====================================================

CREATE TABLE IF NOT EXISTS relationship_members (
    id              UUID        PRIMARY KEY DEFAULT uuidv7(),
    relationship_id UUID        NOT NULL,
    user_id         UUID        NOT NULL,
    role            VARCHAR(50) NOT NULL,
    joined_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    active          BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_rel_member_relationship
        FOREIGN KEY (relationship_id) REFERENCES relationships(id) ON DELETE CASCADE,

    CONSTRAINT fk_rel_member_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

    -- A user can only appear once per relationship
    CONSTRAINT uk_relationship_member UNIQUE (relationship_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_rel_members_relationship_id ON relationship_members(relationship_id);
CREATE INDEX IF NOT EXISTS idx_rel_members_user_id         ON relationship_members(user_id);

