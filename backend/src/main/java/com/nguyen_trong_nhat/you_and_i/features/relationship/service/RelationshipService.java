package com.nguyen_trong_nhat.you_and_i.features.relationship.service;

import com.nguyen_trong_nhat.you_and_i.features.relationship.dto.*;

import java.util.List;
import java.util.UUID;

public interface RelationshipService {

    /** Create a new relationship. The authenticated user becomes the OWNER. */
    RelationshipDTO createRelationship(CreateRelationshipRequest request);

    /** Get all relationships the authenticated user is an active member of. */
    List<RelationshipDTO> getMyRelationships();

    /** Get all relationships a specific user is a member of (admin only). */
    List<RelationshipDTO> getRelationshipsByUserId(UUID userId);

    /** Get details of a specific relationship (authenticated user must be a member). */
    RelationshipDTO getRelationshipById(UUID relationshipId);

    /** Update relationship info (OWNER or ADMIN only). */
    RelationshipDTO updateRelationship(UUID relationshipId, UpdateRelationshipRequest request);

    /** Delete a relationship entirely (OWNER only). */
    void deleteRelationship(UUID relationshipId);

    /** List all active members of a relationship (must be a member to view). */
    List<RelationshipMemberDTO> getMembers(UUID relationshipId);

    /** Add a new member to a relationship (OWNER or ADMIN only). */
    RelationshipMemberDTO addMember(UUID relationshipId, AddMemberRequest request);

    /** Change a member's role (OWNER or ADMIN only). */
    RelationshipMemberDTO updateMemberRole(UUID relationshipId, UUID memberId, UpdateMemberRoleRequest request);

    /** Remove a member from a relationship (OWNER/ADMIN, or the member themselves). */
    void removeMember(UUID relationshipId, UUID memberId);
}

