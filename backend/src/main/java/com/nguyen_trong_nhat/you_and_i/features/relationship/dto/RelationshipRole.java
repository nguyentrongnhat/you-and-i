package com.nguyen_trong_nhat.you_and_i.features.relationship.dto;

public enum RelationshipRole {

    OWNER,
    ADMIN,
    MEMBER,
    VIEWER;

    public boolean canManageRelationship() {
        return this == OWNER || this == ADMIN;
    }

    public boolean canManageMembers() {
        return this == OWNER || this == ADMIN;
    }

    public boolean canEditResources() {
        return this != VIEWER;
    }

    public boolean canDeleteResources() {
        return this == OWNER || this == ADMIN;
    }

    public boolean canViewResources() {
        return true;
    }
}
