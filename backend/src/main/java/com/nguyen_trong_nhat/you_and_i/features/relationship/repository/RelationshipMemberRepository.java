package com.nguyen_trong_nhat.you_and_i.features.relationship.repository;

import com.nguyen_trong_nhat.you_and_i.features.relationship.dto.RelationshipRole;
import com.nguyen_trong_nhat.you_and_i.features.relationship.entity.RelationshipMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RelationshipMemberRepository extends JpaRepository<RelationshipMember, UUID> {

    /**
     * Find all active memberships for a given relationship.
     */
    @Query("""
            SELECT rm
            FROM RelationshipMember rm
            JOIN FETCH rm.user u
            LEFT JOIN FETCH u.profile
            WHERE rm.relationshipId = :relationshipId AND rm.active = true
            """)
    List<RelationshipMember> findAllByRelationshipIdAndActiveTrue(UUID relationshipId);

    /**
     * Find a specific membership record for a user in a relationship.
     */
    @Query("""
            SELECT rm
            FROM RelationshipMember rm
            JOIN FETCH rm.user u
            LEFT JOIN FETCH u.profile
            WHERE rm.relationshipId = :relationshipId AND rm.userId = :userId
            """)
    Optional<RelationshipMember> findByRelationshipIdAndUserId(UUID relationshipId, UUID userId);

    @Query("""
            SELECT rm
            FROM RelationshipMember rm
            JOIN FETCH rm.user u
            LEFT JOIN FETCH u.profile
            WHERE rm.id = :memberId
            """)
    Optional<RelationshipMember> findDetailedById(@Param("memberId") UUID memberId);

    @Query("""
            SELECT rm.role
            FROM RelationshipMember rm
            WHERE rm.relationshipId = :relationshipId AND rm.userId = :userId AND rm.active = true
            """)
    Optional<RelationshipRole> findActiveRoleByRelationshipIdAndUserId(@Param("relationshipId") UUID relationshipId,
                                                                       @Param("userId") UUID userId);

    /**
     * Check if a user is an active member of a relationship.
     */
    boolean existsByRelationshipIdAndUserIdAndActiveTrue(UUID relationshipId, UUID userId);

    /**
     * Find all active memberships of a user.
     */
    List<RelationshipMember> findAllByUserIdAndActiveTrue(UUID userId);

    /**
     * Find all memberships of a user with a specific role.
     */
    List<RelationshipMember> findAllByUserIdAndRole(UUID userId, RelationshipRole role);
}

