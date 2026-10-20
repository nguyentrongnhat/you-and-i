package com.nguyen_trong_nhat.you_and_i.features.relationship.service;

import com.nguyen_trong_nhat.you_and_i.features.relationship.entity.Relationship;
import com.nguyen_trong_nhat.you_and_i.features.relationship.entity.RelationshipMember;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;

@Service
@AllArgsConstructor
@Slf4j
public class RelationshipMemberService {
    private final RelationshipCacheService relationshipCacheService;

    public List<RelationshipMember> getRelativeRelationshipMembersByUsername(String username) {
        var result = relationshipCacheService.getRelationshipsByUsername(username);
        return result.stream().map(Relationship::getMembers)
                .flatMap(Collection::stream)
                .filter(member -> !member.getUser().getUsername().equals(username))
                .toList();
    }
}
