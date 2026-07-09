package com.nguyen_trong_nhat.you_and_i.features.relationship.repository;

import com.nguyen_trong_nhat.you_and_i.features.relationship.entity.Relationship;
import com.nguyen_trong_nhat.you_and_i.features.relationship.dto.RelationshipStatus;
import com.nguyen_trong_nhat.you_and_i.features.relationship.dto.RelationshipType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RelationshipRepository extends JpaRepository<Relationship, UUID> {

    /**
     * Find all relationships that a specific user belongs to.
     */
    @Query("""
            SELECT DISTINCT r
            FROM Relationship r
            JOIN FETCH r.memberships allMembers
            JOIN FETCH allMembers.user memberUser
            LEFT JOIN FETCH memberUser.profile
            WHERE r.id IN (
                SELECT rm.relationship.id
                FROM RelationshipMember rm
                WHERE rm.user.id = :userId AND rm.active = true
            )
            """)
    List<Relationship> findAllByUserId(@Param("userId") UUID userId);

    /**
     * Find all active relationships of a user with a specific type.
     */
    @Query("""
            SELECT DISTINCT r
            FROM Relationship r
            JOIN FETCH r.memberships allMembers
            JOIN FETCH allMembers.user memberUser
            LEFT JOIN FETCH memberUser.profile
            WHERE r.type = :type
              AND r.id IN (
                  SELECT rm.relationship.id
                  FROM RelationshipMember rm
                  WHERE rm.user.id = :userId AND rm.active = true
              )
            """)
    List<Relationship> findAllByUserIdAndType(@Param("userId") UUID userId, @Param("type") RelationshipType type);

    @EntityGraph(attributePaths = {"memberships", "memberships.user", "memberships.user.profile"})
    Optional<Relationship> findDetailedById(UUID id);

    List<Relationship> findAllByStatus(RelationshipStatus status);
}

