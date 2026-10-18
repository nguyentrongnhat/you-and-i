package com.nguyen_trong_nhat.you_and_i.features.relationship.service;

import com.nguyen_trong_nhat.you_and_i.features.relationship.dto.RelationshipDTO;
import com.nguyen_trong_nhat.you_and_i.features.relationship.entity.Relationship;
import com.nguyen_trong_nhat.you_and_i.features.relationship.entity.RelationshipMember;
import com.nguyen_trong_nhat.you_and_i.features.relationship.repository.RelationshipMemberRepository;
import com.nguyen_trong_nhat.you_and_i.features.relationship.repository.RelationshipRepository;
import com.nguyen_trong_nhat.you_and_i.features.user.entity.MyUserDetail;
import com.nguyen_trong_nhat.you_and_i.features.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@Slf4j
public class RelationshipService {
    private final RelationshipMemberRepository relationshipMemberRepository;
    private final RelationshipRepository relationshipRepository;
    private final UserRepository myUserDetailRepository;

    @Transactional
    public Relationship createRelationship(RelationshipDTO relationshipData) {
        log.info("Creating a new relationship...");
        Relationship newRelationship = new Relationship();
        newRelationship.setName(relationshipData.getName());
        newRelationship.setStartAt(relationshipData.getStartAt());
        newRelationship.setStatus(relationshipData.getStatus());
        newRelationship.setType(relationshipData.getType());

        Relationship savedRelationship = relationshipRepository.save(newRelationship);

        if(relationshipData.getMembers() == null || relationshipData.getMembers().isEmpty()) {
            log.warn("No members provided for the new relationship.");
            return savedRelationship;
        }

        Set<UUID> memberIds = relationshipData.getMembers();
        List<MyUserDetail> members = myUserDetailRepository.findAllByIdIn(memberIds);
        Set<RelationshipMember> relationshipMembers = members.stream().map(member -> {
            RelationshipMember relationshipMember = new RelationshipMember();
            relationshipMember.setRelationship(savedRelationship);
            relationshipMember.setUser(member);
            return relationshipMember;
        }).collect(Collectors.toSet());

        savedRelationship.setMembers(relationshipMembers);
        log.info("New relationship created: {}", newRelationship);
        return savedRelationship;
    }

    public List<Relationship> getAllRelationships() {
        return relationshipRepository.findAll();
    }
}
