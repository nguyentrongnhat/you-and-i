package com.nguyen_trong_nhat.you_and_i.features.relationship.repository;

import com.nguyen_trong_nhat.you_and_i.features.relationship.entity.Relationship;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RelationshipRepository extends JpaRepository<Relationship, UUID> {
    List<Relationship> findByMembers_User_Username(String username);
}

