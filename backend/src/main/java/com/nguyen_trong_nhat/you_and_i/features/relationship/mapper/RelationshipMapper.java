package com.nguyen_trong_nhat.you_and_i.features.relationship.mapper;

import com.nguyen_trong_nhat.you_and_i.features.relationship.dto.RelationshipDTO;
import com.nguyen_trong_nhat.you_and_i.features.relationship.dto.RelationshipMemberDTO;
import com.nguyen_trong_nhat.you_and_i.features.relationship.entity.Relationship;
import com.nguyen_trong_nhat.you_and_i.features.relationship.entity.RelationshipMember;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
public class RelationshipMapper {

    public RelationshipMemberDTO toMemberDTO(RelationshipMember member) {
        if (member == null) return null;

        RelationshipMemberDTO dto = new RelationshipMemberDTO();
        dto.setId(member.getId());
        dto.setRole(member.getRole());
        dto.setJoinedAt(member.getJoinedAt());
        dto.setActive(member.isActive());

        if (member.getUser() != null) {
            dto.setUserId(member.getUser().getId());
            dto.setUsername(member.getUser().getUsername());
            if (member.getUser().getProfile() != null) {
                dto.setDisplayName(member.getUser().getProfile().getDisplayName());
                dto.setAvatarUrl(member.getUser().getProfile().getAvatarUrl());
            }
        }

        return dto;
    }

    public RelationshipDTO toDTO(Relationship relationship) {
        if (relationship == null) return null;

        RelationshipDTO dto = new RelationshipDTO();
        dto.setId(relationship.getId());
        dto.setType(relationship.getType());
        dto.setStatus(relationship.getStatus());
        dto.setDescription(relationship.getDescription());
        dto.setStartAt(relationship.getStartAt());
        dto.setCreatedAt(relationship.getCreatedAt());
        dto.setUpdatedAt(relationship.getUpdatedAt());

        List<RelationshipMemberDTO> memberDTOs = relationship.getMemberships() != null
                ? relationship.getMemberships().stream()
                        .map(this::toMemberDTO)
                        .toList()
                : Collections.emptyList();
        dto.setMembers(memberDTOs);

        return dto;
    }
}

