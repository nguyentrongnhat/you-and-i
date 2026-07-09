package com.nguyen_trong_nhat.you_and_i.features.relationship.controller;

import com.nguyen_trong_nhat.you_and_i.common.config.Constants;
import com.nguyen_trong_nhat.you_and_i.common.exception.ForbidenException;
import com.nguyen_trong_nhat.you_and_i.common.security.util.SecurityUtils;
import com.nguyen_trong_nhat.you_and_i.features.relationship.dto.*;
import com.nguyen_trong_nhat.you_and_i.features.relationship.service.RelationshipService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("api/relationships")
@RequiredArgsConstructor
public class RelationshipController {

    private final RelationshipService relationshipService;

    /**
     * Only users with ROLE_ADMIN or ROLE_SUPER_ADMIN may manage relationships
     * and relationship members. Throws {@link ForbidenException} otherwise.
     */
    private void verifyAdminAccess() {
        if (!SecurityUtils.hasAuthorities(Constants.ROLE_SUPER_ADMIN)
                && !SecurityUtils.hasAuthorities(Constants.ROLE_ADMIN)) {
            throw new ForbidenException("You have no permission to manage relationships");
        }
    }

    // ── Relationship endpoints ─────────────────────────────────────────────────

    /**
     * POST /api/relationships
     * Create a new relationship. The authenticated user becomes the OWNER.
     */
    @PostMapping
    public ResponseEntity<RelationshipDTO> createRelationship(
            @RequestBody @Valid CreateRelationshipRequest request) {
        verifyAdminAccess();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(relationshipService.createRelationship(request));
    }

    /**
     * GET /api/relationships
     * Get all relationships the authenticated user is an active member of.
     */
    @GetMapping
    public ResponseEntity<List<RelationshipDTO>> getMyRelationships() {
        verifyAdminAccess();
        return ResponseEntity.ok(relationshipService.getMyRelationships());
    }

    /**
     * GET /api/relationships/user/{userId}
     * Get all relationships a specific user is a member of (ADMIN / SUPER_ADMIN only).
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<RelationshipDTO>> getRelationshipsByUserId(
            @PathVariable UUID userId) {
        verifyAdminAccess();
        return ResponseEntity.ok(relationshipService.getRelationshipsByUserId(userId));
    }

    /**
     * GET /api/relationships/{id}
     * Get details of a specific relationship (must be a member).
     */
    @GetMapping("/{id}")
    public ResponseEntity<RelationshipDTO> getRelationshipById(@PathVariable UUID id) {
        verifyAdminAccess();
        return ResponseEntity.ok(relationshipService.getRelationshipById(id));
    }

    /**
     * PUT /api/relationships/{id}
     * Update relationship info (OWNER or ADMIN only).
     */
    @PutMapping("/{id}")
    public ResponseEntity<RelationshipDTO> updateRelationship(
            @PathVariable UUID id,
            @RequestBody UpdateRelationshipRequest request) {
        verifyAdminAccess();
        return ResponseEntity.ok(relationshipService.updateRelationship(id, request));
    }

    /**
     * DELETE /api/relationships/{id}
     * Delete a relationship entirely (OWNER only).
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRelationship(@PathVariable UUID id) {
        verifyAdminAccess();
        relationshipService.deleteRelationship(id);
        return ResponseEntity.noContent().build();
    }

    // ── Member endpoints ───────────────────────────────────────────────────────

    /**
     * GET /api/relationships/{id}/members
     * List all active members (must be a member to view).
     */
    @GetMapping("/{id}/members")
    public ResponseEntity<List<RelationshipMemberDTO>> getMembers(@PathVariable UUID id) {
        verifyAdminAccess();
        return ResponseEntity.ok(relationshipService.getMembers(id));
    }

    /**
     * POST /api/relationships/{id}/members
     * Add a new member (OWNER or ADMIN only).
     */
    @PostMapping("/{id}/members")
    public ResponseEntity<RelationshipMemberDTO> addMember(
            @PathVariable UUID id,
            @RequestBody @Valid AddMemberRequest request) {
        verifyAdminAccess();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(relationshipService.addMember(id, request));
    }

    /**
     * PUT /api/relationships/{id}/members/{memberId}/role
     * Change a member's role (OWNER or ADMIN only).
     */
    @PutMapping("/{id}/members/{memberId}/role")
    public ResponseEntity<RelationshipMemberDTO> updateMemberRole(
            @PathVariable UUID id,
            @PathVariable UUID memberId,
            @RequestBody @Valid UpdateMemberRoleRequest request) {
        verifyAdminAccess();
        return ResponseEntity.ok(relationshipService.updateMemberRole(id, memberId, request));
    }

    /**
     * DELETE /api/relationships/{id}/members/{memberId}
     * Remove a member (OWNER/ADMIN, or the member themselves to leave).
     */
    @DeleteMapping("/{id}/members/{memberId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable UUID id,
            @PathVariable UUID memberId) {
        verifyAdminAccess();
        relationshipService.removeMember(id, memberId);
        return ResponseEntity.noContent().build();
    }
}

