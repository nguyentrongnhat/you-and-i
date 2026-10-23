package com.nguyen_trong_nhat.you_and_i.features.relationship.service;

import com.nguyen_trong_nhat.you_and_i.common.exception.NotFoundException;
import com.nguyen_trong_nhat.you_and_i.features.games.find_number_game.service.FindNumberGameBestRecordCacheService;
import com.nguyen_trong_nhat.you_and_i.features.relationship.dto.RelationshipDTO;
import com.nguyen_trong_nhat.you_and_i.features.relationship.dto.RelationshipMemberDTO;
import com.nguyen_trong_nhat.you_and_i.features.relationship.entity.Relationship;
import com.nguyen_trong_nhat.you_and_i.features.relationship.entity.RelationshipMember;
import com.nguyen_trong_nhat.you_and_i.features.relationship.mapper.RelationshipMapper;
import com.nguyen_trong_nhat.you_and_i.features.relationship.repository.RelationshipMemberRepository;
import com.nguyen_trong_nhat.you_and_i.features.relationship.repository.RelationshipRepository;
import com.nguyen_trong_nhat.you_and_i.features.user.dto.UserDetailDTO;
import com.nguyen_trong_nhat.you_and_i.features.user.entity.MyUserDetail;
import com.nguyen_trong_nhat.you_and_i.features.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@Slf4j
public class RelationshipService {
    private final RelationshipRepository relationshipRepository;
    private final RelationshipMemberRepository relationshipMemberRepository;
    private final UserRepository myUserDetailRepository;
    private final RelationshipMapper relationshipMapper;
    private final RelationshipCacheService relationshipCacheService;
    private final FindNumberGameBestRecordCacheService findNumberGameBestRecordCacheService;

    @Transactional
    public Relationship createRelationship(RelationshipDTO relationshipData) {
        log.info("Creating a new relationship...");
        Relationship newRelationship = relationshipMapper.toRelationship(relationshipData);

        Relationship savedRelationship = relationshipRepository.save(newRelationship);

        if (relationshipData.getMembers() == null || relationshipData.getMembers().isEmpty()) {
            log.warn("No members provided for the new relationship.");
            relationshipCacheService.evictAllRelationshipCaches();
            return savedRelationship;
        }

        savedRelationship.getMembers().addAll(
                buildRelationshipMembers(savedRelationship, relationshipData.getMembers())
        );

        log.info("New relationship created: {}", savedRelationship);
        relationshipCacheService.evictAllRelationshipCaches();
        findNumberGameBestRecordCacheService.evictBestRecordRankingCache();
        return savedRelationship;
    }

    @Transactional
    public Relationship updateRelationship(UUID relationshipId, RelationshipDTO relationshipData) {
        Relationship existingRelationship = relationshipRepository.findById(relationshipId)
                .orElseThrow(() -> new NotFoundException("Relationship not found with id: " + relationshipId));

        relationshipMapper.updateRelationshipFromDTO(relationshipData, existingRelationship);

        if (relationshipData.getMembers() != null) {
            Set<RelationshipMember> updatedMembers =
                    buildRelationshipMembers(existingRelationship, relationshipData.getMembers());

            existingRelationship.getMembers().clear();
            relationshipRepository.flush();
            existingRelationship.getMembers().addAll(updatedMembers);
        }

        log.info("Updated relationship: {}", existingRelationship);
        relationshipCacheService.evictAllRelationshipCaches();
        findNumberGameBestRecordCacheService.evictBestRecordRankingCache();
        return existingRelationship;
    }

    @Transactional
    public void deleteRelationship(UUID relationshipId) {
        var needToDelete = relationshipRepository.findById(relationshipId)
                .orElseThrow(() -> new NotFoundException("Relationship not found with id: " + relationshipId));
        relationshipRepository.delete(needToDelete);
        log.info("Deleted relationship: {}", relationshipId);
        relationshipCacheService.evictAllRelationshipCaches();
        findNumberGameBestRecordCacheService.evictBestRecordRankingCache();
    }

    private Set<RelationshipMember> buildRelationshipMembers(Relationship relationship,
                                                             Set<RelationshipMemberDTO> memberDTOs) {
        Set<UUID> memberIds = memberDTOs.stream()
                .map(RelationshipMemberDTO::getUser)
                .filter(Objects::nonNull)
                .map(UserDetailDTO::getId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<UUID, RelationshipMemberDTO> memberDTOMap = memberDTOs.stream()
                .filter(dto -> dto.getUser() != null && dto.getUser().getId() != null)
                .collect(Collectors.toMap(dto -> dto.getUser().getId(), Function.identity()));

        if (memberIds.isEmpty()) {
            return Set.of();
        }

        List<MyUserDetail> users = myUserDetailRepository.findAllByIdIn(memberIds);
        return users.stream().map(user -> {
            RelationshipMember relationshipMember = new RelationshipMember();
            relationshipMember.setRelationship(relationship);
            relationshipMember.setActive(memberDTOMap.get(user.getId()).isActive());
            relationshipMember.setUser(user);
            return relationshipMember;
        }).collect(Collectors.toSet());
    }

    public List<Relationship> getAllRelationships() {
        return relationshipCacheService.getAllRelationships();
    }

    public Relationship getRelationshipById(UUID relationshipId) {
        return relationshipRepository.findById(relationshipId)
                .orElseThrow(() -> new NotFoundException(
                        "Relationship not found with id: " + relationshipId
                ));
    }
}
