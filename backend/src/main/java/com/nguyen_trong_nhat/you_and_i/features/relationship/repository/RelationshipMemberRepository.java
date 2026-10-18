package com.nguyen_trong_nhat.you_and_i.features.relationship.repository;

import com.nguyen_trong_nhat.you_and_i.features.relationship.entity.RelationshipMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface RelationshipMemberRepository extends JpaRepository<RelationshipMember, UUID> {
}
