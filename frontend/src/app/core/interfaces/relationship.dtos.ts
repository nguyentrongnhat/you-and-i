export enum RELATIONSHIP_TYPE {
    COUPLE = 'COUPLE',
    FRIENDSHIP = 'FRIENDSHIP',
    FAMILY = 'FAMILY',
    COLLEAGUE = 'COLLEAGUE',
}

export enum RELATIONSHIP_STATUS {
    PENDING = 'PENDING',
    ACTIVE = 'ACTIVE',
    PAUSED = 'PAUSED',
    ENDED = 'ENDED',
}

export enum RELATIONSHIP_ROLE {
    OWNER = 'OWNER',
    ADMIN = 'ADMIN',
    MEMBER = 'MEMBER',
    VIEWER = 'VIEWER',
}

export interface RelationshipMember {
    id: string;
    userId: string;
    username: string;
    displayName: string;
    avatarUrl: string;
    role: RELATIONSHIP_ROLE;
    joinedAt: string;
    active: boolean;
}

export interface Relationship {
    id: string;
    type: RELATIONSHIP_TYPE;
    status: RELATIONSHIP_STATUS;
    description: string;
    startAt: string;
    createdAt: string;
    updatedAt: string;
    members: RelationshipMember[];
}

export interface CreateRelationshipRequest {
    type: RELATIONSHIP_TYPE;
    description?: string;
    startAt?: string;
}

export interface UpdateRelationshipRequest {
    type?: RELATIONSHIP_TYPE;
    status?: RELATIONSHIP_STATUS;
    description?: string;
    startAt?: string;
}

export interface AddMemberRequest {
    userId: string;
    role: RELATIONSHIP_ROLE;
}

export interface UpdateMemberRoleRequest {
    role: RELATIONSHIP_ROLE;
}
